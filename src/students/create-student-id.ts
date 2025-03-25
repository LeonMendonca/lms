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
  const institute = instituteName
    .split(" ")
    .filter(word => word[0] && word[0] === word[0].toUpperCase()) // Ensure the first letter is uppercase
    .map(word => word[0]) // Get first letter of each word
    .join(""); // Join them into a single string

  const dept = department
    .split(" ")
    .filter(word => word[0] && word[0] === word[0].toUpperCase()) // Ensure the first letter is uppercase
    .map(word => word[0]) // Get first letter of each word
    .join(""); // Join them into a single string

  if (!count) {
    return `${institute}001/${dept}${deptcount}`
  }
  if (!deptcount) {
    return `${institute}${count}/${dept}001`  }

  if (!count && !deptcount) {
    return `${institute}001/${dept}001 `
  }
  const splitMaxId = count.split('/');
  let maxIdToNumber = Number(splitMaxId[0]);

  const departmentcount = deptcount.split('/');
  let deptotal = Number(departmentcount[0]);

  console.log("institute:", institute, "department:", dept);
  return (`${institute}${(maxIdToNumber + 1).toString().padStart(3, '0')}/${dept}${(deptotal + 1).toString().padStart(3, '0')}`)
}



export function bookBarcode(
  count: string | null,
  
  instituteName: string,

) {
  const institute = instituteName
    .split(" ")
    .filter(word => word[0] && word[0] === word[0].toUpperCase()) // Ensure the first letter is uppercase
    .map(word => word[0]) // Get first letter of each word
    .join(""); // Join them into a single string



  if (!count) {
    return `${institute}-001 `
  }
  

  
  const splitMaxId = count.split('-');
  let maxIdToNumber = Number(splitMaxId[0]);

  

  return (`${institute}${(maxIdToNumber + 1).toString().padStart(3, '0')}`)
}



