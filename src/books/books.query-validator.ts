export const BookQueryValidator = {
  book_uuid: '',
  book_title: '',
  book_author: '',
  bill_no: 0,
};

export type UnionBook = {
  [key in keyof typeof BookQueryValidator]: Pick<
    typeof BookQueryValidator,
    key
  >;
}[keyof typeof BookQueryValidator];
