import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const DesignationEnum = {
  LIBRARIAN: 'librarian',
  ASSISTANT: 'assistant',
  RECEPTIONIST: 'receptionist',
} as const;

@Entity('users_table') // You can specify the table name (optional)
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_uuid' })
  userUUID: 'user_uuid' = 'user_uuid';

  @Column({
    type: 'int',
    generated: true,
    name: 'user_id',
  })
  userId: 'user_id' = 'user_id';

  @Column({ type: 'varchar', length: 255 })
  name: 'name' = 'name';

  @Column({ type: 'varchar', length: 255, unique: true, name: 'email' })
  email: 'email' = 'email';

  @Column({ type: 'enum', enum: DesignationEnum, name: 'designation' })
  designation: 'designation' = 'designation';

  @Column({ type: 'jsonb', name: 'institute_details' })
  institute_details: 'institute_details' = 'institute_details';

  @Column({ type: 'varchar', length: 255, name: 'address' })
  address: 'address' = 'address';

  @Column({ type: 'varchar', length: 255, name: 'phone_no' })
  phone_no: 'phone_no' = 'phone_no';

  @Column({ type: 'varchar', length: 255, name: 'password' })
  password: 'password' = 'password';

  @Column({ type: 'boolean', default: false, name: 'is_archived' })
  is_archived: 'is_archived' = 'is_archived';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: 'created_at' = 'created_at';

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: 'updated_at' = 'updated_at';
}

export const user = new User();

export type TUser = {
  [P in keyof typeof user as (typeof user)[P]]: any;
};
