export function createStudentId(
  maxId: string | null,
  instituteName: string,
) {
  let getFullYear = new Date().getFullYear();
  if (!maxId) {
    return `00001-${instituteName}-${getFullYear}`;
  }
  const splitMaxId = maxId.split('-');
  let maxIdToNumber = Number(splitMaxId[0]);
  let maxYearToNumber = Number(splitMaxId[2]);
  if(maxYearToNumber < getFullYear) {
    return `00001-${instituteName}-${getFullYear}`
  }
  return `${(maxIdToNumber + 1).toString().padStart(5, '0')}-${instituteName}-${getFullYear}`;
}
