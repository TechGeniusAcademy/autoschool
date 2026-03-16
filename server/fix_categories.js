const mysql = require("mysql2/promise");

async function fixCategories() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    console.log("🔧 Исправляем структуру категорий...");

    // Сначала удаляем все планы, чтобы избежать проблем с foreign key
    await connection.execute("DELETE FROM price_plans");
    console.log("✅ Удалили все планы");

    // Очищаем таблицу категорий
    await connection.execute("DELETE FROM price_categories");
    console.log("✅ Очистили категории");

    // Изменяем тип ID на AUTO_INCREMENT
    await connection.execute("ALTER TABLE price_categories DROP PRIMARY KEY");
    await connection.execute(
      "ALTER TABLE price_categories MODIFY id INT AUTO_INCREMENT"
    );
    await connection.execute(
      "ALTER TABLE price_categories ADD PRIMARY KEY (id)"
    );
    console.log("✅ Изменили тип ID категорий на INT AUTO_INCREMENT");

    // Добавляем категории с правильными ID
    await connection.execute(`
      INSERT INTO price_categories (name, icon, description, sort_order) VALUES
      ('Категория B', 'FaCar', 'Легковые автомобили', 1),
      ('Категория A', 'FaMotorcycle', 'Мотоциклы', 2),
      ('Категория C', 'FaTruck', 'Грузовые автомобили', 3),
      ('Категория D', 'FaBus', 'Автобусы', 4),
      ('Категория E', 'FaTrailer', 'Составы транспортных средств', 5)
    `);
    console.log("✅ Добавили категории с числовыми ID");

    // Добавляем премиум план
    const [result] = await connection.execute(
      `
      INSERT INTO price_plans (
        category_id, title, price, duration, lessons_count, 
        description, features, is_popular, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        1, // Категория B
        "Премиум",
        60000,
        "3 месяца",
        68,
        "Расширенный курс с дополнительными часами практики",
        `Теоретический курс - 134 часа
Практические занятия - 68 часов
Индивидуальный график занятий
Вождение на премиум-автомобилях
Дополнительные часы вождения
Учебные материалы премиум-класса
Персональный инструктор
Топливный сбор включен
Внутренние экзамены`,
        1, // популярный
        1, // активный
        1, // порядок
      ]
    );
    console.log("✅ Добавили премиум план с ID:", result.insertId);

    // Добавляем стандартный план
    await connection.execute(
      `
      INSERT INTO price_plans (
        category_id, title, price, duration, lessons_count, 
        description, features, is_popular, is_active, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        1, // Категория B
        "Стандарт",
        35000,
        "2,5 месяца",
        56,
        "Базовый пакет обучения на категорию B",
        `Теоретический курс - 134 часа
Практические занятия - 56 часов
Учебные материалы
Топливный сбор включен
Внутренние экзамены`,
        0, // не популярный
        1, // активный
        2, // порядок
      ]
    );
    console.log("✅ Добавили стандартный план");

    // Проверяем результат
    const [cats] = await connection.execute("SELECT * FROM price_categories");
    const [plans] = await connection.execute("SELECT * FROM price_plans");

    console.log("\n📊 Результат:");
    console.log(
      "Категории:",
      cats.map((c) => `${c.id}: ${c.name}`)
    );
    console.log(
      "Планы:",
      plans.map((p) => `${p.id}: ${p.title} (категория ${p.category_id})`)
    );
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  } finally {
    await connection.end();
  }
}

fixCategories();
