export function createStudentId(
  maxCountId: number | null,
  instituteName: string,
) {
  if (!maxCountId) {
    return `${instituteName}-00001-${new Date().getFullYear()}`;
  }

  return `${instituteName}-${(Number(maxCountId) + 1).toString().padStart(5, '0')}-${new Date().getFullYear()}`;
}
