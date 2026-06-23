import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Driver } from './driver.entity';
import * as GeoJSON from 'geojson';

@Entity('driver_locations')
export class DriverLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // This links directly to the driver's ID
  @OneToOne(() => Driver)
  @JoinColumn()
  driver: Driver;

  // This tells PostgreSQL to treat this as a location on Earth (SRID 4326 is standard GPS)
  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  coordinates: GeoJSON.Point;
}
