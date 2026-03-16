const mysql = require("mysql2/promise");

async function addAvatarColumn() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    // Проверяем существующую структуру
    const [columns] = await connection.execute("DESCRIBE users");
    console.log("Current table structure:");
    console.table(columns);

    // Проверяем есть ли поле avatar_url
    const hasAvatarUrl = columns.some((col) => col.Field === "avatar_url");

    if (!hasAvatarUrl) {
      console.log("Adding avatar_url column...");
      await connection.execute(
        "ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL AFTER password_hash"
      );
      console.log("✅ avatar_url column added successfully");
    } else {
      console.log("✅ avatar_url column already exists");
    }

    // Проверяем обновленную структуру
    const [newColumns] = await connection.execute("DESCRIBE users");
    console.log("Updated table structure:");
    console.table(newColumns);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

addAvatarColumn();
