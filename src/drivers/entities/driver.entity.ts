import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('drivers') // This creates a table named "drivers"
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  vehicleModel: string; // e.g., Toyota Corolla

  @Column({ unique: true })
  licensePlate: string;

  @Column({ default: false })
  isActive: boolean; // False = Offline, True = Online and ready for requests

  @CreateDateColumn()
  createdAt: Date;
}
