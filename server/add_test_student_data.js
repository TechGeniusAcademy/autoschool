const mysql = require("mysql2/promise");
require("dotenv").config();

async function addTestStudentData() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("🔗 Подключение к базе данных установлено");

    // Проверяем, есть ли уже студент с ролью 'student'
    const [students] = await connection.execute("SELECT id FROM users WHERE role = 'student' LIMIT 1");

    let studentId;
    if (students.length > 0) {
      studentId = students[0].id;
      console.log(`📚 Найден существующий студент с ID: ${studentId}`);
    } else {
      // Создаем тестового студента
      const [result] = await connection.execute(`
        INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, email_verified)
        VALUES ('Иван', 'Петров', 'student@test.com', '+7123456789', '$2b$10$example', 'student', 1, 1)
      `);
      studentId = result.insertId;
      console.log(`👤 Создан новый студент с ID: ${studentId}`);
    }

    // Проверяем, есть ли инструктор
    const [instructors] = await connection.execute("SELECT id FROM users WHERE role = 'instructor' LIMIT 1");

    let instructorId;
    if (instructors.length > 0) {
      instructorId = instructors[0].id;
    } else {
      const [result] = await connection.execute(`
        INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, email_verified)
        VALUES ('Сергей', 'Иванов', 'instructor@test.com', '+7987654321', '$2b$10$example', 'instructor', 1, 1)
      `);
      instructorId = result.insertId;
      console.log(`👨‍🏫 Создан новый инструктор с ID: ${instructorId}`);
    }

    // Проверяем, есть ли курс
    const [courses] = await connection.execute("SELECT id FROM courses LIMIT 1");

    let courseId;
    if (courses.length > 0) {
      courseId = courses[0].id;
    } else {
      const [result] = await connection.execute(
        `
        INSERT INTO courses (title, slug, description, short_description, instructor_id, category, is_active)
        VALUES ('Базовый курс вождения (категория B)', 'basic-driving-b', 'Полный курс подготовки к получению водительских прав категории B', 'Изучите теорию и практику вождения', ?, 'B', 1)
      `,
        [instructorId]
      );
      courseId = result.insertId;
      console.log(`🚗 Создан новый курс с ID: ${courseId}`);

      // Добавляем уроки к курсу
      const lessons = [
        ["Правила дорожного движения - основы", "Изучение основных правил ПДД", "theory"],
        ["Дорожные знаки и разметка", "Знакомство с дорожными знаками", "theory"],
        ["Первый практический урок", "Знакомство с автомобилем", "practice"],
        ["Вождение в городе", "Практика вождения в городских условиях", "practice"],
        ["Парковка и маневрирование", "Отработка навыков парковки", "practice"],
      ];

      for (let i = 0; i < lessons.length; i++) {
        await connection.execute(
          `
          INSERT INTO lessons (course_id, title, description, lesson_type, order_index)
          VALUES (?, ?, ?, ?, ?)
        `,
          [courseId, lessons[i][0], lessons[i][1], lessons[i][2], i + 1]
        );
      }

      console.log(`📝 Добавлено ${lessons.length} уроков к курсу`);
    }

    // Записываем студента на курс
    const [enrollment] = await connection.execute("SELECT id FROM student_courses WHERE student_id = ? AND course_id = ?", [studentId, courseId]);

    if (enrollment.length === 0) {
      await connection.execute(
        `
        INSERT INTO student_courses (student_id, course_id, assigned_by, is_active, progress_percentage)
        VALUES (?, ?, ?, 1, 40.0)
      `,
        [studentId, courseId, instructorId]
      );
      console.log(`✅ Студент записан на курс`);
    }

    // Добавляем прогресс по урокам
    const [lessons] = await connection.execute("SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index", [courseId]);

    for (let i = 0; i < Math.min(2, lessons.length); i++) {
      const [existing] = await connection.execute("SELECT id FROM student_lesson_progress WHERE student_id = ? AND lesson_id = ?", [studentId, lessons[i].id]);

      if (existing.length === 0) {
        await connection.execute(
          `
          INSERT INTO student_lesson_progress (student_id, lesson_id, is_completed, completed_at)
          VALUES (?, ?, 1, NOW())
        `,
          [studentId, lessons[i].id]
        );
      }
    }
    console.log(`📖 Добавлен прогресс по урокам`);

    // Добавляем индивидуальное занятие
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const [existingLesson] = await connection.execute("SELECT id FROM individual_lessons WHERE student_id = ? AND lesson_date = ?", [studentId, tomorrowStr]);

    if (existingLesson.length === 0) {
      await connection.execute(
        `
        INSERT INTO individual_lessons (student_id, instructor_id, lesson_date, start_time, end_time, lesson_type, subject, status)
        VALUES (?, ?, ?, '10:00:00', '11:30:00', 'practice', 'Вождение в городе', 'scheduled')
      `,
        [studentId, instructorId, tomorrowStr]
      );
      console.log(`🚗 Добавлено индивидуальное занятие на завтра`);
    }

    await connection.end();
    console.log("✅ Тестовые данные для студента успешно добавлены!");
    console.log("\n📋 Итог:");
    console.log(`- Студент ID: ${studentId}`);
    console.log(`- Курс ID: ${courseId}`);
    console.log(`- Прогресс: 40%`);
    console.log(`- Следующее занятие: ${tomorrowStr} в 10:00`);
  } catch (error) {
    console.error("❌ Ошибка:", error);
  }
}

addTestStudentData();
