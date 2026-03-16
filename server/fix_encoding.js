const mysql = require("mysql2");
const fs = require("fs");

console.log("🔧 Исправляем кодировку и добавляем правильные данные...");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
  multipleStatements: true,
  charset: "utf8mb4",
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }

  console.log("✅ Подключение установлено");

  // Читаем SQL файл
  const sql = fs.readFileSync("fix_encoding.sql", "utf8");

  // Выполняем SQL
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Ошибка выполнения SQL:", err.message);
      connection.end();
      process.exit(1);
    }

    console.log("✅ SQL выполнен успешно");

    // Проверяем результат
    connection.query(
      "SELECT id, name FROM price_categories",
      (err, categories) => {
        if (err) {
          console.error("❌ Ошибка проверки категорий:", err.message);
          connection.end();
          return;
        }

        connection.query(
          "SELECT id, title, price, lessons_count FROM price_plans",
          (err, plans) => {
            if (err) {
              console.error("❌ Ошибка проверки планов:", err.message);
              connection.end();
              return;
            }

            console.log("\n📊 Результат:");
            console.log("Категории:");
            categories.forEach((cat) =>
              console.log(`  ${cat.id}. ${cat.name}`)
            );

            console.log("\nПланы:");
            plans.forEach((plan) =>
              console.log(
                `  ${plan.id}. ${plan.title}: ${plan.price}₸ (${plan.lessons_count} занятий)`
              )
            );

            console.log("\n🎉 Данные успешно исправлены!");
            connection.end();
          }
        );
      }
    );
  });
});
