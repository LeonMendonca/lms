import { pool } from "src/pg.connect";

const createExt = `
CREATE EXTENSION plv8;
`;

const createStudentId = `
CREATE OR REPLACE FUNCTION create_student_id()
  RETURNS TRIGGER AS $$
  
  const instituteName = NEW.institute_name;
  const departmentName = NEW.department;

  const instituteCount = plv8.execute('SELECT COUNT(student_id) FROM students_table WHERE institute_name = $1', [instituteName])[0].count;
  const instituteCountAsNum = Number(instituteCount) + 1;
 
  const deptCount = plv8.execute(
    'SELECT COUNT(student_id) FROM students_table WHERE department = $1 AND institute_name = $2',
    [departmentName, instituteName]
  )[0].count;
  const deptCountAsNum = Number(deptCount) + 1;
  

  const instituteCountPadstart = String(instituteCountAsNum).padStart(3, '0');
  const deptCountPadstart = String(deptCountAsNum).padStart(3, '0');

  const instituteNameAbbr = instituteName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");
  const deptNameAbbr = departmentName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");

  const studentId = instituteNameAbbr+instituteCountPadstart+'/'+deptNameAbbr+deptCountPadstart;

  plv8.execute('UPDATE students_table SET student_id = $1 WHERE student_uuid = $2', [studentId, NEW.student_uuid]);

$$ LANGUAGE plv8;
`;

const createCopiesId = `
CREATE OR REPLACE FUNCTION get_book_copies_id()
RETURNS TRIGGER AS $$
  const instituteName = NEW.institute_name
  const instituteCount = plv8.execute('SELECT COUNT(*) FROM book_copies WHERE institute_name = $1', [instituteName])[0].count
  const instituteCountAsNum = Number(instituteCount);

  let bookCopyId = ''
  const instituteNameAbbr = instituteName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");

  const instituteCountPadstart = String(instituteCountAsNum).padStart(4, '0');
  bookCopyId = instituteNameAbbr+instituteCountPadstart

  plv8.execute('UPDATE book_copies SET book_copy_id = $1 WHERE book_copy_uuid = $2', [bookCopyId, NEW.book_copy_uuid])

  return NEW;
$$ LANGUAGE plv8;
`

const updateStudentId = `
CREATE OR REPLACE FUNCTION update_student_id() 
  RETURNS TRIGGER AS $$

  const instituteName = OLD.institute_name;
  const departmentName = NEW.department;

  const instituteCount = plv8.execute('SELECT COUNT(student_id) FROM students_table WHERE institute_name = $1', [instituteName])[0].count;
  const instituteCountAsNum = Number(instituteCount);
 
  const deptCount = plv8.execute(
    'SELECT COUNT(student_id) FROM students_table WHERE department = $1 AND institute_name = $2',
    [departmentName, instituteName]
  )[0].count;
  const deptCountAsNum = Number(deptCount);
  

  const instituteCountPadstart = String(instituteCountAsNum).padStart(3, '0');
  const deptCountPadstart = String(deptCountAsNum).padStart(3, '0');

  const instituteNameAbbr = instituteName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");
  const deptNameAbbr = departmentName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");

  const studentId = instituteNameAbbr+instituteCountPadstart+'/'+deptNameAbbr+deptCountPadstart;

  plv8.execute('UPDATE students_table SET student_id = $1 WHERE student_uuid = $2', [studentId, OLD.student_uuid]);

$$ LANGUAGE plv8;
`

/*
'
CREATE OR REPLACE FUNCTION get_book_titles_id()
RETURNS TRIGGER AS $$
  const alphabetArr = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z' 
  ];

  const numberOfPadding = 5;
  let paddingZero = ''.padStart(numberOfPadding, '0')

  let maxBookId = plv8.execute('SELECT MAX(book_title_id) FROM book_titles')[0].max
  
  let numFromId = '';
  let alphaFromId = '';
  let incByOne = 0;
  
  if(!maxBookId) {
    maxBookId = 'A-00000';
  } else {
    alphaFromId = maxBookId.split('-')[0];
    numFromId = maxBookId.split('-')[1];
    incByOne = Number(numFromId) + 1;
  }
  
  if(String(incByOne).length > String(numFromId).length) {
    let indexOfNextAlphabet = alphabetArr.indexOf(alphaFromId) + 1
    maxBookId = `${alphabetArr[indexOfNextAlphabet]}-${paddingZero}`
  } else {
    maxBookId = `${alphaFromId}-${(Number(numFromId)+1).toString().padStart(numberOfPadding, '0')}`
  }
  
  plv8.execute('UPDATE book_titles SET book_title_id = $1 WHERE book_uuid = $2', maxBookId, NEW.book_uuid);

  return NEW;
$$ LANGUAGE plv8;

CREATE OR REPLACE TRIGGER trigger_bt
AFTER INSERT ON book_titles
FOR EACH ROW
EXECUTE PROCEDURE create_book_titles_id()
*/

const triggerUpdateStudentId = `
CREATE OR REPLACE TRIGGER trigger_stup
AFTER UPDATE OF department ON students_table
FOR EACH ROW
WHEN (OLD.department IS DISTINCT FROM NEW.department)
EXECUTE PROCEDURE update_student_id()
`

const triggerCreateStudentId = `
CREATE OR REPLACE TRIGGER trigger_stu
AFTER INSERT ON students_table
FOR EACH ROW
EXECUTE PROCEDURE create_student_id()
`;

const triggerCreateBookCopiesId = `
CREATE OR REPLACE TRIGGER trigger_bc
After INSERT ON book_copies
FOR EACH ROW
EXECUTE FUNCTION get_book_copies_id();
`

export async function pgPLV8() {
  try {
      const clientEnableExt = await pool.connect();

      await clientEnableExt.query(createExt)
      .then(() => console.log("Extension enabled!"))
      .catch(err => console.error("ERROR", err.message));

      clientEnableExt.on('error', (err) => {
        console.log(err.message);
      });

      clientEnableExt.release(true);
  } catch (error) {
      console.log("Catch block", error.message);
  } finally {
    const clientTriggerAndFunction = await pool.connect();
    await clientTriggerAndFunction.query(createStudentId);
    await clientTriggerAndFunction.query(createCopiesId)
    await clientTriggerAndFunction.query(updateStudentId);

    await clientTriggerAndFunction.query(triggerCreateStudentId);
    await clientTriggerAndFunction.query(triggerCreateBookCopiesId);
    await clientTriggerAndFunction.query(triggerUpdateStudentId);

    clientTriggerAndFunction.on('error', (err) => {
      console.log(err.message);
    });

    clientTriggerAndFunction.release(true);
  }
}