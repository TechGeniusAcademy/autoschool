const mysql = require("mysql2/promise");

async function assignStudentToCourse() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    // Назначаем студента (ID: 6) курсу (ID: 1), назначено админом (ID: 3)
    const [result] = await connection.execute(
      `INSERT INTO student_courses (student_id, course_id, assigned_by, is_active, enrollment_date) 
       VALUES (?, ?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE is_active = ?, enrollment_date = NOW()`,
      [6, 1, 3, true, true]
    );

    console.log("Student assigned to course successfully:", result);

    // Проверяем результат
    const [rows] = await connection.execute(
      "SELECT * FROM student_courses WHERE student_id = ? AND course_id = ?",
      [6, 1]
    );

    console.log("Assignment result:", rows);
  } catch (error) {
    console.error("Error assigning student to course:", error);
  } finally {
    await connection.end();
  }
}

assignStudentToCourse();
