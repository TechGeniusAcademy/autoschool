const mysql = require("mysql2");

console.log("🔍 Проверяем структуру таблицы price_categories...");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }

  console.log("✅ Подключение установлено");

  // Показываем структуру таблицы
  connection.query("SHOW CREATE TABLE price_categories", (err, result) => {
    if (err) {
      console.error("❌ Ошибка:", err.message);
      connection.end();
      return;
    }

    console.log("\n📋 Структура таблицы price_categories:");
    console.log(result[0]["Create Table"]);

    // Исправляем структуру
    console.log("\n🔧 Исправляем структуру таблицы...");

    const fixQuery = `
      ALTER TABLE price_categories 
      MODIFY COLUMN id INT AUTO_INCREMENT PRIMARY KEY
    `;

    connection.query(fixQuery, (err, result) => {
      if (err) {
        console.error("❌ Ошибка исправления:", err.message);
      } else {
        console.log("✅ Структура таблицы исправлена");
      }

      // Проверяем результат
      connection.query("SHOW CREATE TABLE price_categories", (err, result) => {
        if (err) {
          console.error("❌ Ошибка проверки:", err.message);
        } else {
          console.log("\n📋 Новая структура таблицы:");
          console.log(result[0]["Create Table"]);
        }

        connection.end();
      });
    });
  });
});
