const mysql = require("mysql2/promise");

async function checkUserSessions() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    console.log("Checking user sessions...");

    // Проверяем все сессии для пользователя ID 4
    const [sessions] = await connection.execute(
      "SELECT * FROM user_sessions WHERE user_id = 4 ORDER BY created_at DESC",
      []
    );

    console.log("Sessions for user ID 4:", sessions);

    // Проверяем активные сессии
    const [activeSessions] = await connection.execute(
      "SELECT * FROM user_sessions WHERE user_id = 4 AND is_active = true AND expires_at > NOW()",
      []
    );

    console.log("Active sessions for user ID 4:", activeSessions);

    // Проверяем структуру таблицы сессий
    const [structure] = await connection.execute("DESCRIBE user_sessions");
    console.log("User sessions table structure:", structure);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

checkUserSessions();
