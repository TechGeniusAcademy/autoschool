const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== ПОИСК СТУДЕНТА student@autoshkola.ru ===");
    const [users] = await pool.execute("SELECT * FROM users WHERE email = 'student@autoshkola.ru'");
    console.log("Студент:", users[0]);

    if (users.length > 0) {
      const studentId = users[0].id;

      console.log(`\n=== КУРСЫ СТУДЕНТА ID ${studentId} ===`);
      const [courses] = await pool.execute("SELECT * FROM student_courses WHERE student_id = ?", [studentId]);
      courses.forEach((course) => {
        console.log(`Курс ID: ${course.course_id}, Progress: ${course.progress_percentage}%`);
      });

      console.log(`\n=== ПРОГРЕСС УРОКОВ СТУДЕНТА ID ${studentId} ===`);
      const [progress] = await pool.execute("SELECT * FROM lesson_progress WHERE student_id = ?", [studentId]);
      console.log("Записи прогресса:", progress);

      if (courses.length > 0) {
        const courseId = courses[0].course_id;
        console.log(`\n=== УРОКИ КУРСА ID ${courseId} ===`);
        const [lessons] = await pool.execute(
          `
          SELECT l.*, 
                 CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END as is_completed,
                 lp.completed_at
          FROM lessons l
          LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
          WHERE l.course_id = ?
          ORDER BY l.order_index
        `,
          [studentId, courseId]
        );

        lessons.forEach((lesson, index) => {
          const prevCompleted = index === 0 || lessons[index - 1].is_completed;
          console.log(`${lesson.order_index}. ${lesson.title}:`);
          console.log(`   completed: ${lesson.is_completed}, available: ${prevCompleted}`);
        });
      }
    }

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
