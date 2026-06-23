import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('ride_requests')
export class RideRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Many requests can belong to one Rider
  @ManyToOne(() => User)
  rider: User;

  // Many requests can be accepted by one Driver (Nullable because it starts unassigned)
  @ManyToOne(() => Driver, { nullable: true })
  driver: Driver;

  @Column()
  pickupLocation: string; // e.g., "123 Main St"

  @Column()
  dropoffLocation: string; // e.g., "456 Market St"

  @Column({ default: 'pending' }) // Statuses: pending, accepted, in_progress, completed, cancelled
  status: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedFare: number;

  @CreateDateColumn()
  createdAt: Date;
}
