const mysql = require("mysql2/promise");

async function checkAndFixAdmin() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  try {
    // Проверяем текущую роль админа
    const [users] = await connection.execute(
      "SELECT id, first_name, last_name, email, role FROM users WHERE email = 'admin@autoshkola.ru'"
    );

    if (users.length === 0) {
      console.log("❌ Admin user not found");
      return;
    }

    const admin = users[0];
    console.log("📋 Current admin user:");
    console.table(admin);

    if (admin.role !== "admin") {
      console.log("🔧 Fixing admin role...");
      await connection.execute(
        "UPDATE users SET role = 'admin' WHERE email = 'admin@autoshkola.ru'"
      );
      console.log("✅ Admin role updated successfully");

      // Проверяем результат
      const [updatedUsers] = await connection.execute(
        "SELECT id, first_name, last_name, email, role FROM users WHERE email = 'admin@autoshkola.ru'"
      );
      console.log("📋 Updated admin user:");
      console.table(updatedUsers[0]);
    } else {
      console.log("✅ Admin role is already correct");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

checkAndFixAdmin();
