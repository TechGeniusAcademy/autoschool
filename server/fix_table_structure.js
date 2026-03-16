const mysql = require("mysql2");

console.log("🔧 Исправляем структуру таблицы price_categories...");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "00000000",
  database: "autoshkola_db",
  multipleStatements: true,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Ошибка подключения:", err.message);
    process.exit(1);
  }

  console.log("✅ Подключение установлено");

  const fixQueries = `
    -- Отключаем проверку внешних ключей
    SET FOREIGN_KEY_CHECKS = 0;
    
    -- Удаляем все планы (зависят от категорий)
    DELETE FROM price_plans;
    
    -- Удаляем все категории
    DELETE FROM price_categories;
    
    -- Удаляем первичный ключ
    ALTER TABLE price_categories DROP PRIMARY KEY;
    
    -- Изменяем тип поля id на INT AUTO_INCREMENT
    ALTER TABLE price_categories MODIFY COLUMN id INT AUTO_INCREMENT;
    
    -- Добавляем первичный ключ обратно
    ALTER TABLE price_categories ADD PRIMARY KEY (id);
    
    -- Включаем проверку внешних ключей
    SET FOREIGN_KEY_CHECKS = 1;
    
    -- Добавляем тестовые категории
    INSERT INTO price_categories (name, icon, description, sort_order, is_active) VALUES
    ('Категория B', 'FaCar', 'Легковые автомобили', 1, 1),
    ('Категория A', 'FaMotorcycle', 'Мотоциклы', 2, 1),
    ('Категория C', 'FaTruck', 'Грузовые автомобили', 3, 1);
    
    -- Добавляем тестовые планы
    INSERT INTO price_plans 
    (category_id, title, price, duration, lessons_count, description, features, is_popular, is_active, sort_order) 
    VALUES 
    (1, 'Премиум', 60000.00, '3 месяца', 68, 'Расширенный курс с дополнительными часами практики', 
     JSON_ARRAY('68 занятий', 'Индивидуальный подход', 'Дополнительные часы практики', 'Приоритетная запись', 'Гарантия качества'), 
     1, 1, 1),
    (1, 'Базовый', 45000.00, '2 месяца', 40, 'Стандартный курс обучения', 
     JSON_ARRAY('40 занятий', 'Теоретические занятия', 'Практическое вождение', 'Подготовка к экзамену'), 
     0, 1, 2),
    (1, 'Стандарт', 55000.00, '2.5 месяца', 50, 'Расширенный курс с дополнительной практикой', 
     JSON_ARRAY('50 занятий', 'Дополнительные часы практики', 'Индивидуальные консультации', 'Экзаменационная подготовка'), 
     0, 1, 3);
  `;

  connection.query(fixQueries, (err, results) => {
    if (err) {
      console.error("❌ Ошибка исправления:", err.message);
      connection.end();
      return;
    }

    console.log("✅ Структура таблицы исправлена");

    // Проверяем результат
    connection.query("SHOW CREATE TABLE price_categories", (err, result) => {
      if (err) {
        console.error("❌ Ошибка проверки:", err.message);
      } else {
        console.log("\n📋 Новая структура таблицы:");
        console.log(result[0]["Create Table"]);
      }

      // Проверяем данные
      connection.query(
        "SELECT id, name FROM price_categories",
        (err, categories) => {
          if (err) {
            console.error("❌ Ошибка получения категорий:", err.message);
          } else {
            console.log("\n📊 Категории:");
            categories.forEach((cat) =>
              console.log(`  ${cat.id}. ${cat.name}`)
            );
          }

          connection.query(
            "SELECT id, title, price FROM price_plans",
            (err, plans) => {
              if (err) {
                console.error("❌ Ошибка получения планов:", err.message);
              } else {
                console.log("\n📊 Планы:");
                plans.forEach((plan) =>
                  console.log(`  ${plan.id}. ${plan.title}: ${plan.price}₸`)
                );
              }

              console.log(
                "\n🎉 Готово! Теперь можно создавать новые категории через админ панель"
              );
              connection.end();
            }
          );
        }
      );
    });
  });
});
