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

const triggerCreateStudentId = `
CREATE OR REPLACE TRIGGER trigger_stu
AFTER INSERT ON students_table
FOR EACH ROW
EXECUTE PROCEDURE create_student_id()
`;

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
    await clientTriggerAndFunction.query(triggerCreateStudentId);

    clientTriggerAndFunction.on('error', (err) => {
      console.log(err.message);
    });

    clientTriggerAndFunction.release(true);
  }
}