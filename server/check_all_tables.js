const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkAllTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Показать все таблицы
    const [tables] = await connection.execute("SHOW TABLES");
    console.log("Все таблицы в базе данных:");
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });

    console.log("\n=====================================\n");

    // Проверим основные таблицы для студентов
    const studentTables = ["users", "enrollments", "lessons", "student_progress", "courses", "groups"];

    for (const tableName of studentTables) {
      try {
        const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\nСтруктура таблицы ${tableName}:`);
        console.table(structure);
      } catch (error) {
        console.log(`Таблица ${tableName} не найдена`);
      }
    }

    await connection.end();
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}

checkAllTables();
