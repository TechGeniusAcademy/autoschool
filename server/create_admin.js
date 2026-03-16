const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    // Проверяем, есть ли уже админ
    const [admins] = await connection.execute(
      "SELECT id FROM users WHERE role = 'admin'"
    );

    if (admins.length > 0) {
      console.log("✅ Admin user already exists");
      console.table(admins);
      return;
    }

    // Создаем админа
    const saltRounds = 12;
    const password_hash = await bcrypt.hash("admin123", saltRounds);

    const [result] = await connection.execute(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, email_verified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "Админ",
        "Администратор",
        "admin@autoshkola.ru",
        "+7(999)999-99-99",
        password_hash,
        "admin",
        true,
        true,
      ]
    );

    console.log("✅ Admin user created successfully");
    console.log("Email: admin@autoshkola.ru");
    console.log("Password: admin123");
    console.log("ID:", result.insertId);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

createAdminUser();
