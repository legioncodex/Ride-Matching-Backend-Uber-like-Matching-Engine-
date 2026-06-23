// new-ride-broadcast.dto.ts
import { IsString, IsNumber, IsNotEmpty, IsPositive } from 'class-validator';

export class NewRideBroadcastDto {
  @IsString()
  @IsNotEmpty()
  rideId: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropoffLocation: string;

  @IsNumber()
  @IsPositive()
  estimatedFare: number;
}
