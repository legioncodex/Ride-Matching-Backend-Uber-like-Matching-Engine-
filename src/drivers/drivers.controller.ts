import { Controller, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('drivers')
@UseGuards(JwtAuthGuard) // The Bouncer: You must have a token to hit these routes!
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Patch('status')
  async updateStatus(@Request() req, @Body('isActive') isActive: boolean) {
    // req.user.userId is magically extracted from the JWT token
    return this.driversService.toggleStatus(req.user.userId, isActive);
  }

  @Patch('location')
  async updateLocation(
    @Request() req,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number,
  ) { 
    return this.driversService.updateLocation(
      req.user.userId,
      latitude,
      longitude,
    );
  }
}
