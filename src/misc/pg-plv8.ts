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

  if(!NEW.password) {
    plv8.execute('UPDATE students_table SET password = $1 WHERE student_uuid = $2', [studentId, NEW.student_uuid]);
  }

$$ LANGUAGE plv8;
`;

const createCopiesId = `
CREATE OR REPLACE FUNCTION get_book_copies_id()
RETURNS TRIGGER AS $$
  const instituteName = NEW.institute_name
  const instituteCount = plv8.execute('SELECT COUNT(book_copy_id) FROM book_copies WHERE institute_name = $1', [instituteName])[0].count
  const instituteCountAsNum = Number(instituteCount) + 1;

  let bookCopyId = ''
  const instituteNameAbbr = instituteName.split(" ").map((item) => (item[0] === item[0].toUpperCase()) ? item[0] : "").join("");

  const instituteCountPadstart = String(instituteCountAsNum).padStart(4, '0');
  bookCopyId = instituteNameAbbr+instituteCountPadstart

  plv8.execute('UPDATE book_copies SET book_copy_id = $1 WHERE book_copy_uuid = $2', [bookCopyId, NEW.book_copy_uuid])

  return NEW;
$$ LANGUAGE plv8;
`

const createTitleId = `
CREATE OR REPLACE FUNCTION create_book_titles_id()
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
    maxBookId = alphabetArr[indexOfNextAlphabet]+'-'+paddingZero
  } else {
    maxBookId = alphaFromId+'-'+(Number(numFromId)+1).toString().padStart(numberOfPadding, '0')
  }
  
  plv8.execute('UPDATE book_titles SET book_title_id = $1 WHERE book_uuid = $2', maxBookId, NEW.book_uuid);

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

const triggerCreateBookTitleId = `
CREATE OR REPLACE TRIGGER trigger_bt
AFTER INSERT ON book_titles
FOR EACH ROW
EXECUTE PROCEDURE create_book_titles_id()
`


const createJournalTitleIdFunction = `
CREATE OR REPLACE FUNCTION generate_journal_title_id()
RETURNS TRIGGER AS $$
  const instituteUUID = NEW.institute_uuid;

  const abbrResult = plv8.execute(
    'SELECT institute_abbr FROM institute_config WHERE institute_uuid = $1 LIMIT 1',
    [instituteUUID]
  );

  if (abbrResult.length === 0 || !abbrResult[0].institute_abbr) {
    throw new Error('No abbreviation found for institute_uuid');
  }

  const abbr = abbrResult[0].institute_abbr;

  // Count titles from journal_titles table using institute_uuid
  const countResult = plv8.execute(
    'SELECT COUNT(*) AS total FROM journal_titles WHERE institute_uuid = $1',
    [instituteUUID]
  );

  const count = parseInt(countResult[0].total || 0, 10) + 1;
  const paddedCount = String(count).padStart(3, '0');

  NEW.journal_title_id = 'T/' + abbr + '-' + paddedCount;

  return NEW;
$$ LANGUAGE plv8;
`;


const triggerCreateJournalTitleId = `
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'generate_journal_title_id'
  ) THEN
    CREATE TRIGGER generate_journal_title_id
    BEFORE INSERT ON journal_titles
    FOR EACH ROW
    EXECUTE FUNCTION generate_journal_title_id();
  END IF;
END$$;
`;




const createJournalCopyId = `
CREATE OR REPLACE FUNCTION generate_journal_copy_id()
RETURNS TRIGGER AS $$
  const journalTitleUUID = NEW.journal_title_uuid;

  const titleResult = plv8.execute(
    'SELECT journal_title_id FROM journal_titles WHERE journal_uuid = $1 LIMIT 1',
    [journalTitleUUID]
  );

  if (titleResult.length === 0 || !titleResult[0].journal_title_id) {
    throw new Error('No journal_title_id found for the given journal_title_uuid');
  }

  const journalTitleId = titleResult[0].journal_title_id;

  const countResult = plv8.execute(
    'SELECT COUNT(*) AS total FROM journal_copy WHERE journal_title_uuid = $1',
    [journalTitleUUID]
  );

  const count = parseInt(countResult[0].total || 0, 10) + 1;
  const paddedCount = String(count).padStart(3, '0');

  NEW.journal_copy_id = journalTitleId + '/' + paddedCount;

  return NEW;
$$ LANGUAGE plv8;
`;



const triggerCreateJournalCopyId = `

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'generate_journal_copy_id'
  ) THEN
    CREATE TRIGGER generate_journal_copy_id
    BEFORE INSERT ON journal_copy
    FOR EACH ROW
    EXECUTE FUNCTION generate_journal_copy_id();
  END IF;
END$$;


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
    await clientTriggerAndFunction.query(createTitleId);
    await clientTriggerAndFunction.query(createCopiesId);
    await clientTriggerAndFunction.query(updateStudentId);

    await clientTriggerAndFunction.query(triggerCreateStudentId);
    await clientTriggerAndFunction.query(triggerCreateBookTitleId);
    await clientTriggerAndFunction.query(triggerCreateBookCopiesId);
    await clientTriggerAndFunction.query(triggerUpdateStudentId);


    // periodical id
    await clientTriggerAndFunction.query(createJournalTitleIdFunction);
    await clientTriggerAndFunction.query(triggerCreateJournalTitleId);

    await clientTriggerAndFunction.query(createJournalCopyId);
    await clientTriggerAndFunction.query(triggerCreateJournalCopyId);


    clientTriggerAndFunction.on('error', (err) => {
      console.log(err.message);
    });

    clientTriggerAndFunction.release(true);
  }
}