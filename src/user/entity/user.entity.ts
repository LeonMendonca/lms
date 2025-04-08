import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users_table') // You can specify the table name (optional)
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'userUuid' })
  userUuid: string;

  @Column({ type: 'varchar', name: 'userId', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255, name: 'email' })
  email: string;

  @Column({ type: 'varchar', name: 'designation' })
  designation: string;

  @Column('simple-array', { name: 'instituteDetails' })
  instituteDetails: string[];

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address: string;

  @Column({ type: 'varchar', length: 255, name: 'phoneNo' })
  phoneNo: string;

  @Column({ type: 'varchar', length: 255, name: 'password' })
  password: string;

  @Column({ type: 'boolean', default: false, name: 'isArchived' })
  isArchived: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
