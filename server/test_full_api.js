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

    console.log("=== ПОЛНАЯ ЭМУЛЯЦИЯ API getLessonsByCourse ===");

    // Точно такой же запрос как в контроллере
    let query = `
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

    console.log("\n=== ДАННЫЕ УРОКОВ ===");
    lessons.forEach((lesson, i) => {
      console.log(`\n${i + 1}. ${lesson.title}:`);
      console.log(`   ID: ${lesson.id}`);
      console.log(`   Тип: ${lesson.lesson_type}`);
      console.log(`   Видео URL: ${lesson.video_url || "нет"}`);
      console.log(`   Продолжительность видео: ${lesson.video_duration || "нет"}`);
      console.log(`   Контент: ${lesson.content ? lesson.content.substring(0, 50) + "..." : "нет"}`);
      console.log(`   Описание: ${lesson.description || "нет"}`);
      console.log(`   Прогресс: ${lesson.progress_status || "не начато"}`);
      console.log(`   Завершен: ${lesson.progress_completed_at || "нет"}`);
      console.log(`   Порядок: ${lesson.order_index}`);
    });

    // Логика обработки как на сервере с isAccessible
    console.log("\n=== ФИНАЛЬНЫЙ РЕЗУЛЬТАТ API ===");
    const processedLessons = [];

    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      let isAccessible = false;

      if (i === 0 || lesson.is_preview) {
        isAccessible = true;
      } else {
        const prevLesson = lessons[i - 1];
        if (prevLesson.progress_status === "completed") {
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
        content: lesson.content,
        lesson_type: lesson.lesson_type,
        video_url: lesson.video_url,
        video_duration: lesson.video_duration,
        order_index: lesson.order_index,
        is_completed: lesson.progress_status === "completed",
        completed_at: lesson.progress_completed_at,
        isAccessible,
      });
    }

    console.log("\nИтоговые данные для фронтенда:");
    processedLessons.forEach((lesson) => {
      console.log(`\n${lesson.order_index}. ${lesson.title}:`);
      console.log(`   Тип: ${lesson.lesson_type}`);
      console.log(`   Видео: ${lesson.video_url ? "есть" : "нет"}`);
      console.log(`   Доступен: ${lesson.isAccessible}`);
      console.log(`   Завершен: ${lesson.is_completed}`);
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
