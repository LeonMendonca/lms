import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid', { name: 'reviewUuid' })
  reviewUuid: string;

  @Column({ name: 'bookUuid', type: 'uuid' })
  bookUuid: string;

  @Column({ name: 'studentUuid', type: 'uuid' })
  studentUuid: string;

  @Column({ name: 'starRating', type: 'int', default: 5 })
  starRating: number;

  @Column({ name: 'reviewText', type: 'text' })
  reviewText: string;

  @Column({ name: 'isApproved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'isArchived', type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
