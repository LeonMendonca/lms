import { createStudentQuery } from "./zod-validation/studentquery-zod";

export const StudentQueryValidator = {
  [createStudentQuery.studentId]: '',
  [createStudentQuery.email]: '',
  [createStudentQuery.phoneNo]: '',
};

export type UnionUser = {
  [key in keyof typeof StudentQueryValidator]: Pick<
    typeof StudentQueryValidator,
    key
  >;
}[keyof typeof StudentQueryValidator];
