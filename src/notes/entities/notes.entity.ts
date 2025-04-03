import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notes')
export class Notes {
  @PrimaryGeneratedColumn('uuid', { name: 'notes_uuid' })
  notesUUID: 'notes_uuid' = 'notes_uuid';

  @Column({ name: 'student_uuid', type: 'uuid' })
  studentUuid: 'student_uuid' = 'student_uuid';
  
  @Column({ name: 'note_resource', type: 'text' })
  noteResource: 'note_resource' = 'note_resource';

  @Column({ name: 'note_title', type: 'text' })
  noteTitle: 'note_title' = 'note_title';

  @Column({ name: 'note_description', type: 'text' })
  noteDescription: 'note_description' = 'note_description';

  @Column({ name: 'is_approved', type: 'boolean', default: false })
  isApproved: 'is_approved' = 'is_approved';

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: 'is_archived' = 'is_archived'; // Null = Active, True = Archived

  @CreateDateColumn({ name: 'created_at' })
  createdAt: 'created_at' = 'created_at'; // Timestamp for review creation

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: 'updated_at' = 'updated_at'; // Timestamp for review updates
}

export const notes = new Notes();

export type TNotes = {
  [P in keyof typeof notes as (typeof notes)[P]]: (typeof notes)[P];
};
