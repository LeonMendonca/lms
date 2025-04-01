const alphabetArr = [ 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' ];

const numberOfPadding = 5;  //This decides the no. of 0's to be prefixed
let paddingZero = ''.padStart(numberOfPadding, '0')

export function genBookId(prevId: string | null, type: 'BC' | 'BT') {
  if(!prevId) {
    //if 1st / new record in table, then
    return `A-${paddingZero}-${type}`
  }
  let numFromId = prevId.split('-')[1];
  let alphaFromId = prevId.split('-')[0];
  let incByOne = Number(numFromId)+1;
  if(String(incByOne).length > String(numFromId).length) {
    let indexOfNextAlphabet = alphabetArr.indexOf(alphaFromId) + 1
    //return when a alphabet reached its max limit to generate number eg. A-99999-TYPE -> B-00000-TYPE
    return `${alphabetArr[indexOfNextAlphabet]}-${paddingZero}-${type}`
  }
  //return an incremented number of previous ID eg. A-00011-TYPE -> A-00012-TYPE
  return `${alphaFromId}-${(Number(numFromId)+1).toString().padStart(numberOfPadding, '0')}-${type}`
}

export function genBookId2(instituteCount: string, instituteName: string) {
  let instituteCountAsNum = Number(instituteCount);
  let instituteNameAbbr = instituteName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");
  if(!instituteCountAsNum) {
    return `${instituteNameAbbr}0001`;
  }
  const instituteCountPadstart = String(instituteCountAsNum + 1).padStart(4, '0');
  return `${instituteNameAbbr}${instituteCountPadstart}`;
}