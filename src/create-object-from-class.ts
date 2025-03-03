//I didn't use any AI, believe me!
export function createObject<T extends object, E extends (keyof T)[]>(
  classObject: T,
  ignoreFields: E,
) {
  type NewType = Omit<T, (typeof ignoreFields)[number]>;
  ignoreFields.map((key) => {
    delete classObject[key];
  });
  return classObject as NewType;
}
