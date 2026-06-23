import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RideRequest } from './entities/ride.entity';
import { RideHistory } from './entities/ride-history.entity';
import { DriverLocation } from 'src/drivers/entities/driver-location.entity';
import { RidesGateway } from './rides.gateway';

@Injectable()
export class RidesService {
  constructor(
    @InjectRepository(RideRequest)
    private rideRequestRepo: Repository<RideRequest>,

    @InjectRepository(RideHistory) // Add this injection
    private rideHistoryRepo: Repository<RideHistory>,

    private ridesGateway: RidesGateway,
  ) {}

  // --- REQUEST A RIDE ---
  async requestRide(
    userId: string,
    pickupLat: number,
    pickupLon: number,
    dropoffLocation: string,
  ) {
    // 1. Run the PostGIS spatial query
    // This finds all active drivers within 5000 meters (5km) of the rider
    const nearbyDrivers = await this.rideRequestRepo.manager
      .createQueryBuilder(DriverLocation, 'location')
      .leftJoinAndSelect('location.driver', 'driver')
      .where('driver.isActive = :isActive', { isActive: true })
      .andWhere(
        `ST_DWithin(
          location.coordinates, 
          ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography, 
          :radius
        )`,
      )
      .setParameters({
        lon: pickupLon,
        lat: pickupLat,
        radius: 5000, // 5km radius in meters
      })
      .getMany();

    // 2. If no one is inside the 5km circle, reject the request
    if (nearbyDrivers.length === 0) {
      return { message: 'No drivers available in your area right now.' };
    }

    // In a real app, you would use Google Maps API to calculate distance.
    // For this assessment, we will mock a dynamic fare between NGN 1500 and NGN 6000.
    const estimatedFare = Math.floor(Math.random() * 4500) + 1500;

    const newRide = this.rideRequestRepo.create({
      rider: { id: userId }, // We pass the ID relation directly!
      pickupLocation: `${pickupLat}, ${pickupLon}`,
      dropoffLocation,
      estimatedFare,
      status: 'pending', // Waiting for a driver to accept
    });

    await this.rideRequestRepo.save(newRide);

    // 4. In a production app, you would push this via WebSockets specifically to these drivers
    const driverIds = nearbyDrivers.map((loc) => loc.driver.id);

    // --- THE WEBSOCKET BROADCAST ---
    this.ridesGateway.broadcastNewRide(driverIds, {
      rideId: newRide.id,
      pickupLocation: newRide.pickupLocation,
      dropoffLocation: newRide.dropoffLocation,
      estimatedFare: newRide.estimatedFare,
    });

    return {
      message: 'Ride requested successfully. Searching for drivers...',
      rideId: newRide.id,
      estimatedFare,
      status: newRide.status,
      pingedDrivers: driverIds, // We return this so you can verify who got the broadcast
    };
  }

  // --- ACCEPT A RIDE (WITH CONCURRENCY CONTROL) ---
  async acceptRide(rideId: string, driverId: string) {
    // We open an isolated transaction block
    return await this.rideRequestRepo.manager.transaction(
      async (transactionalEntityManager) => {
        // 1. Find the ride AND lock the row so no one else can touch it
        const ride = await transactionalEntityManager.findOne(RideRequest, {
          where: { id: rideId },
          lock: { mode: 'pessimistic_write' }, // <-- THE MAGIC LOCK!
        });

        // 2. Standard validations
        if (!ride) {
          throw new NotFoundException('Ride request not found.');
        }

        // 3. If the status changed while we were waiting for the lock, reject it
        if (ride.status !== 'pending') {
          throw new ConflictException(
            'Sorry, another driver already accepted this ride.',
          );
        }

        // 4. Assign the driver and update the status
        ride.driver = { id: driverId } as any;
        ride.status = 'accepted';

        // 5. Save the updated ride and release the lock
        await transactionalEntityManager.save(ride);

        return {
          message: 'Ride accepted successfully!',
          rideId: ride.id,
          status: ride.status,
        };
      },
    );
  }

  // --- COMPLETE A RIDE & GENERATE RECEIPT ---
  async completeRide(rideId: string, driverId: string) {
    // 1. Find the ride, but ONLY if it belongs to the driver making the request
    const ride = await this.rideRequestRepo.findOne({
      where: { id: rideId, driver: { id: driverId } },
    });

    if (!ride) {
      throw new NotFoundException(
        'Ride not found or you are not the assigned driver.',
      );
    }

    if (ride.status === 'completed') {
      throw new ConflictException('This ride has already been completed.');
    }

    // 2. Mark the active ride as completed
    ride.status = 'completed';
    await this.rideRequestRepo.save(ride);

    // 3. Generate the permanent receipt in the Ride History table
    const receipt = this.rideHistoryRepo.create({
      rideRequest: { id: ride.id } as any,
      finalFare: ride.estimatedFare, // In a real app, you'd calculate this based on actual GPS time/distance
    });

    await this.rideHistoryRepo.save(receipt);

    return {
      message: 'Trip completed successfully! Receipt generated.',
      receipt,
    };
  }
}
