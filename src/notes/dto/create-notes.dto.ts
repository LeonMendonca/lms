import { z } from 'zod';
import { createObjectOmitProperties } from '../../misc/create-object-from-class';
import { Notes } from '../entities/notes.entity';

let notesCreateObject = createObjectOmitProperties(new Notes(), [
  'notesUUID',
  'studentUuid',
  'isApproved',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const createNotesSchema = z.object({
  [notesCreateObject.noteDescription]: z.string(),

  [notesCreateObject.noteResource]: z.string(),

  [notesCreateObject.noteTitle]: z.string(),

  [notesCreateObject.category]: z.string(),

  [notesCreateObject.author]: z.array(z.string()),
});

export type TCreateNotesDTO = z.infer<typeof createNotesSchema>;
