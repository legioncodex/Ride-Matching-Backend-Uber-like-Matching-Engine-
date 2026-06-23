import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesController } from './rides.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RideRequest } from './entities/ride.entity';
import { RideHistory } from './entities/ride-history.entity';
import { RidesGateway } from './rides.gateway';
import { Driver } from 'src/drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RideRequest, RideHistory, Driver])],
  controllers: [RidesController],
  providers: [RidesService, RidesGateway],
})
export class RidesModule {}
