import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm'; // Assuming the file path

@Entity('users_preference_table') // You can specify the table name (optional)
export class UserPreference {
  @PrimaryGeneratedColumn('uuid', { name: 'userPreferenceUuid' })
  userPreferenceUuid: string;

  @Column('uuid', { name: 'employeeId' })
  employeeId: string;

  @Column({ name: 'enableTabs', type: 'boolean', default: false })
  enableTabs: boolean;

  @Column({ name: 'dark_mode', type: 'boolean', default: false })
  darkMode: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
