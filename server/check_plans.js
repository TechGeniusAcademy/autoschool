const mysql = require("mysql2/promise");

async function checkPlans() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  const [plans] = await connection.execute(`
    SELECT pp.*, pc.name as category_name, pc.id as cat_id
    FROM price_plans pp 
    JOIN price_categories pc ON pp.category_id = pc.id 
    WHERE pp.is_active = 1
  `);

  console.log("Активные планы:");
  plans.forEach((plan) => {
    console.log(
      `- ${plan.title}: ${plan.price}₽ (${plan.category_name}, ID категории: ${plan.cat_id})`
    );
  });

  await connection.end();
}

checkPlans();
