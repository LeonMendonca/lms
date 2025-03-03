export const StudentQueryValidator = {
  student_id: '',
  email: '',
  phone_no: '',
};

export type UnionUser = {
  [key in keyof typeof StudentQueryValidator]: Pick<
    typeof StudentQueryValidator,
    key
  >;
}[keyof typeof StudentQueryValidator];
