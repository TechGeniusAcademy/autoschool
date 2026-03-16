const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== ПРОВЕРКА ПРОГРЕССА УРОКОВ ===");

    // Проверяем прогресс студента ID 3
    const [progress] = await pool.execute(
      `SELECT lp.*, l.title, l.order_index 
       FROM lesson_progress lp 
       JOIN lessons l ON lp.lesson_id = l.id 
       WHERE lp.student_id = 3 
       ORDER BY l.order_index`
    );

    console.log("\nПрогресс студента ID 3:");
    progress.forEach((p) => {
      console.log(`  ${p.order_index}. ${p.title}: ${p.status} (завершен: ${p.completed_at})`);
    });

    // Проверяем запрос, который использует API /lessons/course/:id
    console.log("\n=== ЗАПРОС ИЗ API /lessons/course/:id ===");

    const [lessons] = await pool.execute(`
      SELECT l.*, 
             COALESCE(lp.status = 'completed', false) as is_completed,
             lp.completed_at,
             lp.progress_percentage,
             lp.time_spent,
             lp.started_at as progress_started_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = 3
      WHERE l.course_id = 1
      ORDER BY l.order_index
    `);

    console.log("\nУроки курса с прогрессом:");
    lessons.forEach((lesson, index) => {
      console.log(`  ${lesson.order_index}. ${lesson.title}:`);
      console.log(`     is_completed: ${lesson.is_completed}`);
      console.log(`     completed_at: ${lesson.completed_at}`);
      console.log(`     доступен: ${index === 0 || (index > 0 && lessons[index - 1].is_completed)}`);
      console.log("     ---");
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
