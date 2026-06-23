import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { RideRequest } from './ride.entity';

@Entity('ride_history')
export class RideHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Links back to the original request details
  @ManyToOne(() => RideRequest)
  rideRequest: RideRequest;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalFare: number;

  @CreateDateColumn()
  completedAt: Date;
}
