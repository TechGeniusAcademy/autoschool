const mysql = require("mysql2");

console.log("🔧 Исправляем структуру таблицы price_categories полностью...");

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

  // Полное пересоздание таблиц
  const recreateQueries = `
    -- Отключаем проверку внешних ключей
    SET FOREIGN_KEY_CHECKS = 0;
    
    -- Удаляем таблицы
    DROP TABLE IF EXISTS price_plans;
    DROP TABLE IF EXISTS price_categories;
    
    -- Создаем таблицу категорий с правильной структурой
    CREATE TABLE price_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      icon VARCHAR(50),
      description TEXT,
      sort_order INT DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    -- Создаем таблицу планов
    CREATE TABLE price_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      old_price DECIMAL(10,2),
      duration VARCHAR(100),
      lessons_count INT,
      description TEXT,
      features JSON,
      is_popular BOOLEAN DEFAULT false,
      is_active BOOLEAN DEFAULT true,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES price_categories(id) ON DELETE CASCADE
    );
    
    -- Включаем проверку внешних ключей
    SET FOREIGN_KEY_CHECKS = 1;
    
    -- Добавляем категории
    INSERT INTO price_categories (name, icon, description, sort_order, is_active) VALUES
    ('Категория B', 'FaCar', 'Легковые автомобили', 1, 1),
    ('Категория A', 'FaMotorcycle', 'Мотоциклы', 2, 1),
    ('Категория C', 'FaTruck', 'Грузовые автомобили', 3, 1);
    
    -- Добавляем планы
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

  connection.query(recreateQueries, (err, results) => {
    if (err) {
      console.error("❌ Ошибка пересоздания:", err.message);
      connection.end();
      return;
    }

    console.log("✅ Таблицы пересозданы");

    // Проверяем результат
    connection.query("SHOW CREATE TABLE price_categories", (err, result) => {
      if (err) {
        console.error("❌ Ошибка проверки:", err.message);
      } else {
        console.log("\n📋 Новая структура таблицы price_categories:");
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
