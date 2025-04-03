//I didn't use any AI, believe me!
export function createObjectOmitProperties<
  T extends object,
  E extends (keyof T)[],
>(classObject: T, ignoreFields: E) {
  type NewType = Omit<T, (typeof ignoreFields)[number]>;
  ignoreFields.map((key) => {
    delete classObject[key];
  });
  return classObject as NewType;
}

export function createObjectIncludeProperties<
  T extends object,
  E extends (keyof T)[],
>(classObject: T, requiredFields: E) {
  type NewType = Pick<T, (typeof requiredFields)[number]>;
  for (let key in classObject) {
    if (requiredFields.includes(key)) {
      continue;
    }
    delete classObject[key];
  }
  return classObject as NewType;
}
