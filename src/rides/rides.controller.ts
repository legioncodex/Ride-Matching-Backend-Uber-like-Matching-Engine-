import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { RidesService } from './rides.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rides')
@UseGuards(JwtAuthGuard) // You must be logged in to request a ride
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post('request')
  async requestRide(
    @Request() req,
    @Body('pickupLat') pickupLat: number,
    @Body('pickupLon') pickupLon: number,
    @Body('dropoffLocation') dropoffLocation: string,
  ) {
    // req.user.userId is magically extracted from the Rider's JWT token
    return this.ridesService.requestRide(
      req.user.userId,
      pickupLat,
      pickupLon,
      dropoffLocation,
    );
  }

  @Patch(':id/accept') // The URL will look like http://localhost:3000/rides/UUID/accept
  async acceptRide(
    @Request() req,
    @Param('id') rideId: string, // Grabs the Ride ID from the URL
  ) {
    // req.user.userId is magically extracted from the Driver's JWT token
    // req.user.role check could also be added here to ensure only drivers accept rides!

    return this.ridesService.acceptRide(rideId, req.user.userId);
  }

  @Patch(':id/complete')
  async completeRide(@Request() req, @Param('id') rideId: string) {
    // req.user.userId is magically extracted from the Driver's JWT token
    return this.ridesService.completeRide(rideId, req.user.userId);
  }
}
