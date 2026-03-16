const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

(async () => {
  try {
    console.log("=== ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦ ===");

    // Проверяем структуру таблицы lessons
    const [lessonsStructure] = await pool.execute("DESCRIBE lessons");
    console.log("\nСтруктура таблицы lessons:");
    lessonsStructure.forEach((col) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });

    // Проверяем структуру таблицы lesson_progress
    const [progressStructure] = await pool.execute("DESCRIBE lesson_progress");
    console.log("\nСтруктура таблицы lesson_progress:");
    progressStructure.forEach((col) => {
      console.log(`  ${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default}`);
    });

    // Добавляем тестовые уроки для курса ID 1
    console.log("\n=== СОЗДАНИЕ ТЕСТОВЫХ УРОКОВ ===");

    const testLessons = [
      { title: "Введение в вождение", order_index: 1, content: "Базовые принципы вождения", video_url: null },
      { title: "Правила дорожного движения", order_index: 2, content: "Основные правила ПДД", video_url: null },
      { title: "Первые практические навыки", order_index: 3, content: "Начальные навыки вождения", video_url: null },
      { title: "Парковка и маневрирование", order_index: 4, content: "Техники парковки", video_url: null },
    ];

    for (const lesson of testLessons) {
      try {
        await pool.execute(
          `INSERT INTO lessons (course_id, title, content, video_url, order_index, duration_minutes, is_active)
           VALUES (1, ?, ?, ?, ?, 45, true)`,
          [lesson.title, lesson.content, lesson.video_url, lesson.order_index]
        );
        console.log(`✓ Создан урок: ${lesson.title}`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`- Урок уже существует: ${lesson.title}`);
        } else {
          console.error(`Ошибка создания урока ${lesson.title}:`, error.message);
        }
      }
    }

    // Проверяем созданные уроки
    const [lessons] = await pool.execute("SELECT * FROM lessons WHERE course_id = 1 ORDER BY order_index");
    console.log(`\n=== УРОКИ КУРСА 1 (${lessons.length} уроков) ===`);
    lessons.forEach((lesson) => {
      console.log(`${lesson.order_index}. ${lesson.title} (ID: ${lesson.id})`);
    });

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
    await pool.end();
  }
})();
