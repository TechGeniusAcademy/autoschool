const mysql = require("mysql2/promise");

async function checkCategories() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "autoshkola_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    console.log("Проверяем категории цен...");
    const [categories] = await pool.execute("SELECT * FROM price_categories");

    if (categories.length === 0) {
      console.log("Таблица price_categories пуста. Добавляем базовые категории...");

      // Добавляем базовые категории
      await pool.execute(`
        INSERT INTO price_categories (name, icon, description) VALUES 
        ('Теория', '📚', 'Теоретические курсы по вождению'),
        ('Практика', '🚗', 'Практические занятия вождения'),
        ('Экзамены', '📝', 'Подготовка к экзаменам')
      `);

      console.log("Базовые категории добавлены");

      // Показываем добавленные категории
      const [newCategories] = await pool.execute("SELECT * FROM price_categories");
      console.log("Категории в базе данных:");
      newCategories.forEach((cat) => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Icon: ${cat.icon}`);
      });
    } else {
      console.log("Найденные категории:");
      categories.forEach((cat) => {
        console.log(`ID: ${cat.id}, Name: ${cat.name}, Icon: ${cat.icon}`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

checkCategories();
