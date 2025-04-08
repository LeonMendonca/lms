import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// export const DesignationEnum = {
//   LIBRARIAN: 'librarian',
//   ASSISTANT: 'assistant',
//   RECEPTIONIST: 'receptionist',
// } as const;

@Entity('users_table') // You can specify the table name (optional)
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_uuid' })
  userUuid: string;

  @Column({
    type: 'varchar',
    generated: true,
    name: 'user_id',
    unique: true,
  })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255, name: 'email' })
  email: string;

  @Column({ type: 'enum', name: 'designation' })
  designation: string;

  @Column('simple-array', { name: 'institute_details' })
  instituteDetails: string[];

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address: string;

  @Column({ type: 'varchar', length: 255, name: 'phone_no' })
  phoneNo: string;

  @Column({ type: 'varchar', length: 255, name: 'password' })
  password: string;

  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
