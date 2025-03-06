export function createStudentId(
  maxId: string | null,
  instituteName: string,
) {
  if (!maxId) {
    return `00000-${instituteName}-${new Date().getFullYear()}`;
  }
  let getFullYear = new Date().getFullYear();
  const splitMaxId = maxId.split('-');
  let maxIdToNumber = Number(splitMaxId[0]);
  let maxYearToNumber = Number(splitMaxId[2]);
  if(maxYearToNumber < getFullYear) {
    return `00000-${instituteName}-${getFullYear}`
  }
  return `${(maxIdToNumber + 1).toString().padStart(5, '0')}-${instituteName}-${new Date().getFullYear()}`;
}
