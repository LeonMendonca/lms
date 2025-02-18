function GenericTypeGuard<T extends object>(
  obj: unknown,
  keys: (keyof T)[],
): obj is T {
  if (obj && typeof obj === 'object') {
    return keys.every((key) => key in obj);
  }
  return false;
}

export { GenericTypeGuard };
