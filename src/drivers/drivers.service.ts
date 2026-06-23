import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { DriverLocation } from './entities/driver-location.entity';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    @InjectRepository(DriverLocation)
    private locationRepo: Repository<DriverLocation>,
  ) {}

  // --- 1. GO ONLINE / OFFLINE ---
  async toggleStatus(driverId: string, isActive: boolean) {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver profile not found.');

    driver.isActive = isActive;
    await this.driverRepo.save(driver);

    return { message: `Driver is now ${isActive ? 'Online' : 'Offline'}` };
  }

  // --- 2. UPDATE LIVE LOCATION ---
  async updateLocation(driverId: string, latitude: number, longitude: number) {
    const driver = await this.driverRepo.findOne({ where: { id: driverId } });
    if (!driver) throw new NotFoundException('Driver profile not found.');

    // Format the coordinates for PostGIS (Remember: Longitude comes first!)
    const point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // Look for an existing tracking row for this driver
    let location = await this.locationRepo.findOne({
      where: { driver: { id: driverId } },
    });

    if (!location) {
      // If they don't have a row yet, create one
      location = this.locationRepo.create({ driver, coordinates: point as any });
    } else {
      // If they do, just quickly overwrite the coordinates
      location.coordinates = point as any;
    }

    await this.locationRepo.save(location);
    return { message: 'GPS coordinates updated.', location };
  }
}
