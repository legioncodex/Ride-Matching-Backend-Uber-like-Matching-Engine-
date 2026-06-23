import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { Driver } from './entities/driver.entity';
import { DriverLocation } from './entities/driver-location.entity';

@Module({
  // This array gives the service permission to read/write to these specific tables
  imports: [TypeOrmModule.forFeature([Driver, DriverLocation])],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
