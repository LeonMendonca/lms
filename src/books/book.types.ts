import { BookQueryValidator } from './book.query-validator';

export type UnionBook = {
  [key in keyof typeof BookQueryValidator]: Pick<
    typeof BookQueryValidator,
    key
  >;
}[keyof typeof BookQueryValidator];
