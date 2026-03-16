const mysql = require("mysql2/promise");

async function addPremiumPlan() {
  try {
    // Подключение к базе данных
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "00000000",
      database: "autoshkola_db",
    });

    console.log("🔍 Проверяем существующие данные...");

    // Проверяем категории
    const [categories] = await connection.execute(
      "SELECT * FROM price_categories"
    );
    console.log("Категории:", categories);

    // Проверяем планы
    const [plans] = await connection.execute("SELECT * FROM price_plans");
    console.log("Существующие планы:", plans);

    // Если нет категорий, добавляем их
    if (categories.length === 0) {
      console.log("📝 Добавляем категории...");
      await connection.execute(`
        INSERT INTO price_categories (category_code, category_name, icon_name, sort_order) VALUES
        ('B', 'Категория B', 'FaCar', 1),
        ('A', 'Категория A', 'FaMotorcycle', 2),
        ('C', 'Категория C', 'FaTruck', 3),
        ('D', 'Категория D', 'FaBus', 4),
        ('E', 'Категория E', 'FaTrailer', 5)
      `);
      console.log("✅ Категории добавлены");
    }

    // Проверяем, есть ли уже премиум план
    const [existingPremium] = await connection.execute(
      "SELECT COUNT(*) as count FROM price_plans WHERE title = ?",
      ["Премиум"]
    );

    if (existingPremium[0].count === 0) {
      console.log("📝 Добавляем премиум план...");

      // Добавляем премиум план
      const [result] = await connection.execute(
        `
        INSERT INTO price_plans (
          category_id, title, price, duration, lessons_count, 
          description, is_popular, is_active, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          1,
          "Премиум",
          60000,
          "3 месяца",
          68,
          "Расширенный курс с дополнительными часами практики",
          1,
          1,
          1,
        ]
      );

      console.log("✅ Премиум план добавлен с ID:", result.insertId);

      // Добавляем особенности плана
      const features = [
        "Теоретический курс - 134 часа",
        "Практические занятия - 68 часов",
        "Индивидуальный график занятий",
        "Вождение на премиум-автомобилях",
        "Дополнительные часы вождения",
        "Учебные материалы премиум-класса",
        "Персональный инструктор",
        "Топливный сбор включен",
        "Внутренние экзамены",
      ];

      // Обновляем план, добавив особенности в поле features как строку
      await connection.execute(
        "UPDATE price_plans SET features = ? WHERE id = ?",
        [features.join("\n"), result.insertId]
      );

      console.log("✅ Особенности премиум плана добавлены");
    } else {
      console.log("ℹ️ Премиум план уже существует");
    }

    // Добавляем дополнительные услуги
    const [existingServices] = await connection.execute(
      "SELECT COUNT(*) as count FROM additional_services"
    );
    if (existingServices[0].count === 0) {
      console.log("📝 Добавляем дополнительные услуги...");
      await connection.execute(`
        INSERT INTO additional_services (title, price, description, is_active, sort_order) VALUES
        ('Дополнительный час вождения', 1200, 'Индивидуальное занятие с инструктором', 1, 1),
        ('Повторная пересдача экзамена', 1500, 'Внутренний экзамен в автошколе', 1, 2),
        ('Экспресс-курс ПДД', 3500, 'Интенсивное изучение правил дорожного движения за 5 дней', 1, 3),
        ('Психологическая подготовка', 2500, 'Работа с автопсихологом для преодоления страхов вождения', 1, 4)
      `);
      console.log("✅ Дополнительные услуги добавлены");
    }

    // Добавляем скидки
    const [existingDiscounts] = await connection.execute(
      "SELECT COUNT(*) as count FROM discounts"
    );
    if (existingDiscounts[0].count === 0) {
      console.log("📝 Добавляем скидки...");
      await connection.execute(`
        INSERT INTO discounts (title, discount_value, description, conditions, is_active, sort_order) VALUES
        ('Скидка для студентов', '15%', 'Специальная скидка для студентов очных отделений ВУЗов и СУЗов', 'При предъявлении студенческого билета', 1, 1),
        ('Семейная скидка', '10%', 'Скидка при одновременном обучении двух и более членов семьи', 'Скидка действует для каждого члена семьи при совместной записи', 1, 2),
        ('Ранняя запись', '2000₽', 'Фиксированная скидка при записи за 2 месяца до начала обучения', 'Действует при полной предоплате курса обучения', 1, 3)
      `);
      console.log("✅ Скидки добавлены");
    }

    // Показываем итоговые данные
    console.log("\n📊 Итоговые данные:");
    const [finalCategories] = await connection.execute(
      "SELECT * FROM price_categories"
    );
    const [finalPlans] = await connection.execute("SELECT * FROM price_plans");
    const [finalServices] = await connection.execute(
      "SELECT * FROM additional_services"
    );
    const [finalDiscounts] = await connection.execute(
      "SELECT * FROM discounts"
    );

    console.log("Категории:", finalCategories.length);
    console.log("Планы:", finalPlans.length);
    console.log("Услуги:", finalServices.length);
    console.log("Скидки:", finalDiscounts.length);

    await connection.end();
    console.log("✅ Данные успешно добавлены!");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  }
}

addPremiumPlan();
