const mysql = require("mysql2/promise");

async function checkTest() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "00000000",
    database: "autoshkola_db",
  });

  const [result] = await connection.execute(`
    SELECT 
      l.id as lesson_id,
      l.title as lesson_title,
      l.lesson_type,
      lt.id as test_id,
      lt.title as test_title,
      lt.passing_score,
      lt.max_attempts,
      JSON_LENGTH(lt.questions) as questions_count
    FROM lessons l
    LEFT JOIN lesson_tests lt ON l.id = lt.lesson_id
    WHERE l.lesson_type = 'test'
  `);

  console.log("Tests in database:", JSON.stringify(result, null, 2));

  await connection.end();
}

checkTest().catch(console.error);
