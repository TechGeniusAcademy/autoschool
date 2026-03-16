const mysql = require("mysql2/promise");
require("dotenv").config();

async function createAdditionalServicesTable() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "autoschool",
  });

  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS additional_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        description TEXT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Добавляем тестовые данные
    await connection.execute(`
      INSERT IGNORE INTO additional_services (title, price, description, sort_order) VALUES
      ('Дополнительное занятие по вождению', 1500.00, 'Дополнительная практика вождения с инструктором', 1),
      ('Повторная пересдача внутреннего экзамена', 1000.00, 'Повторная попытка сдачи экзамена в автошколе', 2),
      ('Сопровождение в ГИБДД', 2000.00, 'Инструктор поедет с вами на экзамен в ГИБДД', 3),
      ('Индивидуальная теория', 800.00, 'Индивидуальное занятие по теории ПДД', 4)
    `);

    console.log("✅ Таблица additional_services создана и заполнена");
  } catch (error) {
    console.error("❌ Ошибка:", error.message);
  } finally {
    await connection.end();
  }
}

createAdditionalServicesTable();
