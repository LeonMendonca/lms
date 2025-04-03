import { createObjectOmitProperties } from 'src/misc/create-object-from-class';
import { Notes } from '../entities/notes.entity';
import { z } from 'zod';

let notesUpdateObject = createObjectOmitProperties(new Notes(), [
  'notesUUID',
  'studentUuid',
  'isApproved',
  'isArchived',
  'createdAt',
  'updatedAt',
]);

export const updateNotesSchema = z.object({
  [notesUpdateObject.noteDescription]: z.string(),

  [notesUpdateObject.noteResource]: z.string(),

  [notesUpdateObject.noteTitle]: z.string(),
});

export type TUpdateNotesDTO = z.infer<typeof updateNotesSchema>;
