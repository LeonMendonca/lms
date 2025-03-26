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
  if (maxYearToNumber < getFullYear) {
    return `00001-${instituteName}-${getFullYear}`
  }
  return `${(maxIdToNumber + 1).toString().padStart(5, '0')}-${instituteName}-${getFullYear}`;
}

export function createStudentId2(
  count: string | null,
  deptcount: string | null,
  instituteName: string,
  department: string
) {
  const institute_name = instituteName.trim().split(" ")
    .map((item) => (item[0] === item[0].toUpperCase()) ? item[0]: "")
    .join("");

  const dept = department.trim().split(" ")
  .map((item) => (item[0] === item[0].toUpperCase()) ? item[0]: "")
  .join(""); 

  if (!count) {
    return `${institute_name}001/${dept}${deptcount}`
  }
  if (!deptcount) {
    return `${institute_name}${count}/${dept}001`  }

  if (!count && !deptcount) {
    return `${institute_name}001/${dept}001 `
  }
  const splitMaxId = count.split('/');
  let maxIdToNumber = Number(splitMaxId[0]);

  const departmentcount = deptcount.split('/');
  let deptotal = Number(departmentcount[0]);

  // console.log("institute:", institute, "department:", dept);
  return (`${institute_name}${(maxIdToNumber + 1).toString().padStart(3, '0')}/${dept}${(deptotal + 1).toString().padStart(3, '0')}`)
}


