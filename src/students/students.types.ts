import { StudentQueryValidator } from './student.query-validator';

export type UnionUser = {
  [key in keyof typeof StudentQueryValidator]: Pick<
    typeof StudentQueryValidator,
    key
  >;
}[keyof typeof StudentQueryValidator];
