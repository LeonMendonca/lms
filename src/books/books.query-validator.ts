import { createBookQuery } from "./zod-validation/bookquery-zod";

export const BookQueryValidator = {
  [createBookQuery.bookUUID]: '',
  [createBookQuery.bookTitle]: '',
  [createBookQuery.bookAuthor]: '',
  [createBookQuery.isbn]: 0,
};

export type UnionBook = {
  [key in keyof typeof BookQueryValidator]: Pick<
    typeof BookQueryValidator,
    key
  >;
}[keyof typeof BookQueryValidator];
