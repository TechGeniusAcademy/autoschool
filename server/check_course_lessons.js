const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== ПРОВЕРКА УРОКОВ ДЛЯ КУРСА ===");

    // Проверяем уроки для курса ID 1
    const [lessons] = await pool.execute("SELECT * FROM lessons WHERE course_id = 1");
    console.log(`\nУроков для курса ID 1: ${lessons.length}`);
    if (lessons.length > 0) {
      lessons.forEach((lesson, index) => {
        console.log(`  ${index + 1}. ${lesson.title} (ID: ${lesson.id})`);
      });
    }

    // Проверяем прогресс студента ID 3 по курсу ID 1
    const [progress] = await pool.execute("SELECT * FROM lesson_progress WHERE course_id = 1 AND student_id = 3");
    console.log(`\nПрогресс студента 3 по курсу 1: ${progress.length} записей`);
    if (progress.length > 0) {
      progress.forEach((prog) => {
        console.log(`  Урок ${prog.lesson_id}: ${prog.status} (${prog.progress_percentage}%)`);
      });
    }

    // Проверяем запрос из getStudentCourses
    const [courses] = await pool.execute(
      `SELECT c.*, sc.enrolled_at, sc.started_at, sc.completed_at, sc.progress_percentage,
              CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
              (SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as total_lessons,
              (SELECT COUNT(*) FROM lesson_progress lp 
               WHERE lp.course_id = c.id AND lp.student_id = sc.student_id AND lp.status = 'completed') as completed_lessons
       FROM student_courses sc
       JOIN courses c ON sc.course_id = c.id
       LEFT JOIN users u ON c.instructor_id = u.id
       WHERE sc.student_id = 3 AND sc.is_active = true
       ORDER BY sc.enrolled_at DESC`
    );

    console.log("\n=== РЕЗУЛЬТАТ ЗАПРОСА getStudentCourses ===");
    courses.forEach((course) => {
      console.log(`Курс: ${course.title}`);
      console.log(`  Total lessons: ${course.total_lessons}`);
      console.log(`  Completed lessons: ${course.completed_lessons}`);
      console.log(`  Progress: ${course.progress_percentage}%`);
      console.log(`  Enrolled at: ${course.enrolled_at}`);
      console.log(`  Instructor: ${course.instructor_name}`);
      console.log("---");
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
