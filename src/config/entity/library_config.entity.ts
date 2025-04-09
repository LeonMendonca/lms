import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('library_config')
export class LibraryConfig {
  @PrimaryGeneratedColumn('uuid', { name: 'libraryRuleId' })
  libraryRuleId: string;

  @Column({ name: 'instituteUuid', type: 'varchar' })
  instituteUuid: string;
  @Column({ name: 'organisation', type: 'varchar', length: 255 })
  organisation: string;

  @Column({ name: 'maxBooksStudent', type: 'int', default: 1 })
  maxBooksStudent: number;

  @Column({ name: 'maxBooksStaff', type: 'int', default: 1 })
  maxBooksStaff: number;

  @Column({ name: 'maxDaysStudent', type: 'int', default: 7 })
  maxDaysStudent: number;

  @Column({ name: 'maxDaysStaff', type: 'int', default: 7 })
  maxDaysStaff: number;

  @Column({ name: 'lateFeesPerDay', type: 'int', default: 10 })
  lateFeesPerDay: number;

  @Column({
    name: 'openingHour',
    type: 'time',
    default: '09:00:00',
  })
  openingHour: string;

  @Column({
    name: 'closingHour',
    type: 'time',
    default: '17:00:00',
  })
  closingHour: string;

  @Column({
    name: 'createdAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    name: 'updatedAt',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({ name: 'createdByUUID', type: 'uuid', nullable: true })
  createdByUUID: string;

  @Column({ name: 'isArchived', type: 'boolean', default: false })
  isArchived: boolean;

  @Column({
    name: 'emailNotificationStudent',
    type: 'json',
    default: () => ({
      bookBorrowing: true,
      bookReturning: true,
      checkIn: true,
      checkOut: true,
      penalties: false,
    }),
  })
  emailNotificationStudent: {
    bookBorrowing: boolean;
    bookReturning: boolean;
    checkIn: boolean;
    checkOut: boolean;
    penalties: boolean;
  };

  @Column({
    name: 'emailNotificationAdmin',
    type: 'json',
    default: () => ({
      bookBorrowing: true,
      bookReturning: true,
      checkIn: true,
      checkOut: true,
      penalties: false,
    }),
  })
  emailNotificationAdmin: {
    bookBorrowing: boolean;
    bookReturning: boolean;
    checkIn: boolean;
    checkOut: boolean;
    penalties: boolean;
  };
}
