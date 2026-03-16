const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== СТРУКТУРА ТАБЛИЦЫ LESSONS ===");
    const [structure] = await pool.execute("DESCRIBE lessons");
    structure.forEach((col) => {
      console.log(`${col.Field}: ${col.Type} ${col.Null === "YES" ? "NULL" : "NOT NULL"} ${col.Key} ${col.Default}`);
    });

    console.log("\n=== СУЩЕСТВУЮЩИЕ УРОКИ И ИХ ТИПЫ ===");
    const [lessons] = await pool.execute(`
      SELECT id, course_id, title, lesson_type, video_url, content, 
             CHAR_LENGTH(content) as content_length,
             CASE 
               WHEN video_url IS NOT NULL AND video_url != '' THEN 'HAS_VIDEO'
               ELSE 'NO_VIDEO'
             END as video_status
      FROM lessons 
      ORDER BY course_id, order_index
    `);

    lessons.forEach((lesson) => {
      console.log(`\nID: ${lesson.id} | Курс: ${lesson.course_id} | "${lesson.title}"`);
      console.log(`  Тип: ${lesson.lesson_type}`);
      console.log(`  Видео: ${lesson.video_status} (${lesson.video_url || "нет"})`);
      console.log(`  Контент: ${lesson.content_length} символов`);
    });

    console.log("\n=== СТАТИСТИКА ПО ТИПАМ УРОКОВ ===");
    const [stats] = await pool.execute(`
      SELECT lesson_type, 
             COUNT(*) as count,
             COUNT(CASE WHEN video_url IS NOT NULL AND video_url != '' THEN 1 END) as with_video,
             COUNT(CASE WHEN content IS NOT NULL AND content != '' THEN 1 END) as with_content
      FROM lessons 
      GROUP BY lesson_type
    `);

    stats.forEach((stat) => {
      console.log(`${stat.lesson_type}: ${stat.count} уроков (видео: ${stat.with_video}, контент: ${stat.with_content})`);
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
