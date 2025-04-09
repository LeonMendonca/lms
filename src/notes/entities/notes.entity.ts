import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notes')
export class Notes {
  @PrimaryGeneratedColumn('uuid', { name: 'notesUuid' })
  notesUuid: string;

  @Column({ name: 'studentUuid', type: 'uuid' })
  studentUuid: string;

  @Column({ name: 'noteResource', type: 'text' })
  noteResource: string;

  @Column({ name: 'noteTitle', type: 'text' })
  noteTitle: string;

  @Column({ name: 'category', type: 'text' })
  category: string;

  @Column({ name: 'author', type: 'simple-array' })
  author: string[];

  @Column({ name: 'noteDescription', type: 'text' })
  noteDescription: string;

  @Column({ name: 'isApproved', type: 'boolean', default: false })
  isApproved: boolean;

  @Column({ name: 'isArchived', type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;

  @Column({ name: 'instituteUuid', type: 'uuid' })
  instituteUuid: string;

  @Column({ name: 'instituteName', type: 'varchar', nullable: true })
  instituteName: string;
}