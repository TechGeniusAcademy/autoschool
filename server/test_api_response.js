const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    const courseId = 7;
    const studentId = 21; // student@autoshkola.ru

    console.log("=== ЭМУЛЯЦИЯ API /lessons/course/7 ===");

    // Точно такой же запрос как в getLessonsByCourse
    const query = `
      SELECT l.*,
             (SELECT COUNT(*) FROM lesson_tests WHERE lesson_id = l.id) as has_test,
             lp.status as progress_status,
             lp.started_at as progress_started_at,
             lp.completed_at as progress_completed_at,
             (SELECT COUNT(*) FROM test_attempts ta 
              JOIN lesson_tests lt ON ta.test_id = lt.id 
              WHERE ta.student_id = ? AND lt.lesson_id = l.id AND ta.passed = true) as test_passed
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = ?
      WHERE l.course_id = ?
      ORDER BY l.order_index ASC
    `;

    const [lessons] = await pool.execute(query, [studentId, studentId, courseId]);

    console.log("\nДанные из запроса:");
    lessons.forEach((lesson, i) => {
      console.log(`${i + 1}. ${lesson.title}:`);
      console.log(`   progress_status: ${lesson.progress_status}`);
      console.log(`   completed_at: ${lesson.progress_completed_at}`);
    });

    // Логика обработки как на сервере
    console.log("\n=== ЛОГИКА ДОСТУПНОСТИ ===");
    const processedLessons = [];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      let isAccessible = false;
      let is_completed = lesson.progress_status === "completed";

      if (i === 0 || lesson.is_preview) {
        // Первый урок и preview уроки всегда доступны
        isAccessible = true;
      } else {
        // Проверяем, завершен ли предыдущий урок
        const prevLesson = lessons[i - 1];

        if (prevLesson.progress_status === "completed") {
          // Если предыдущий урок - тест, проверяем, пройден ли он
          if (prevLesson.has_test > 0) {
            isAccessible = prevLesson.test_passed > 0;
          } else {
            isAccessible = true;
          }
        }
      }

      processedLessons.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order_index: lesson.order_index,
        is_completed,
        completed_at: lesson.progress_completed_at,
        isAccessible,
      });
    }

    console.log("\nИтоговый результат API:");
    processedLessons.forEach((lesson, i) => {
      console.log(`${lesson.order_index}. ${lesson.title}:`);
      console.log(`   is_completed: ${lesson.is_completed}`);
      console.log(`   isAccessible: ${lesson.isAccessible}`);
      console.log(`   completed_at: ${lesson.completed_at}`);
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
