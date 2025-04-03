import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid', { name: 'review_uuid' })
  reviewUUID: 'review_uuid' = 'review_uuid';

  @Column({ name: 'book_uuid', type: 'uuid' })
  bookUUID: 'book_uuid' = 'book_uuid';

  @Column({ name: 'student_uuid', type: 'uuid' })
  studentId: 'student_uuid' = 'student_uuid';

  @Column({ name: 'star_rating', type: 'int', default: 5 })
  starRating: 'star_rating' = 'star_rating';

  @Column({ name: 'review_text', type: 'text' })
  reviewText: 'review_text' = 'review_text';

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: 'is_approved' = 'is_approved';

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: 'is_archived' = 'is_archived'; // Null = Active, True = Archived

  @CreateDateColumn({ name: 'created_at' })
  createdAt: 'created_at' = 'created_at'; // Timestamp for review creation

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: 'updated_at' = 'updated_at'; // Timestamp for review updates
}

export const review = new Review();

export type TReviews = {
  [P in keyof typeof review as (typeof review)[P]]: (typeof review)[P];
};
