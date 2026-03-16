const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== СТРУКТУРА ТАБЛИЦЫ lesson_progress ===");
    const [structure] = await pool.execute("DESCRIBE lesson_progress");
    structure.forEach((col) => {
      console.log(`${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });

    console.log("\n=== ДАННЫЕ В lesson_progress ===");
    const [data] = await pool.execute("SELECT * FROM lesson_progress LIMIT 5");
    console.log(data);

    // Проверяем более простым запросом
    console.log("\n=== ПРОСТОЙ ЗАПРОС УРОКОВ ===");
    const [lessons] = await pool.execute(`
      SELECT l.*, 
             CASE WHEN lp.status = 'completed' THEN 1 ELSE 0 END as is_completed,
             lp.completed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.student_id = 3
      WHERE l.course_id = 1
      ORDER BY l.order_index
    `);

    console.log("\nУроки курса:");
    lessons.forEach((lesson, index) => {
      console.log(`${lesson.order_index}. ${lesson.title}: completed=${lesson.is_completed}, date=${lesson.completed_at}`);
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
