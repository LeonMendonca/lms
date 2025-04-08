import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users_access_table') // You can specify the table name (optional)
export class UserAccessToken {
  @PrimaryGeneratedColumn('uuid', { name: 'accessUuid' })
  accessUuid: string;

  @Column('uuid', { name: 'userUuid' })
  userUuid: string;

  @Column({ type: 'varchar', name: 'userId', unique: true })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 255, name: 'accessToken' })
  accessToken: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
