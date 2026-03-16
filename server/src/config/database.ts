import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

// Создание пула соединений
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '00000000',
  database: process.env.DB_NAME || 'autoshkola_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Функция для подключения к базе данных и создания таблиц
export const connectDatabase = async () => {
  try {
    // Создаем соединение без указания конкретной базы данных
    const tempPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await tempPool.getConnection();
    console.log('✅ Connected to MySQL server');
    
    // Создаем базу данных если она не существует
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database ${process.env.DB_NAME} created or already exists`);
    
    connection.release();
    tempPool.end();

    // Теперь подключаемся к созданной базе данных
    const dbConnection = await pool.getConnection();
    console.log('✅ Connected to AutoSchool database');
    
    // Создаем таблицы
    await createTables(dbConnection);
    
    dbConnection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Функция для создания таблиц
const createTables = async (connection: mysql.PoolConnection) => {
  try {
    // Таблица пользователей
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        avatar_url VARCHAR(255) DEFAULT NULL,
        role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
        is_active BOOLEAN DEFAULT true,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица сессий/токенов (для отзыва токенов)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_token_hash (token_hash),
        INDEX idx_expires_at (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица попыток входа (для безопасности)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        success BOOLEAN NOT NULL,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_ip_address (ip_address),
        INDEX idx_attempted_at (attempted_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица сообщений обратной связи
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        subject VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        admin_response TEXT DEFAULT NULL,
        responded_at TIMESTAMP NULL,
        responded_by INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at),
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица блогов
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        featured_image VARCHAR(500),
        author_id INT NOT NULL,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        meta_title VARCHAR(255),
        meta_description TEXT,
        tags JSON,
        view_count INT DEFAULT 0,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_published_at (published_at),
        INDEX idx_author_id (author_id),
        INDEX idx_slug (slug),
        FULLTEXT idx_search (title, content, excerpt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица курсов
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description LONGTEXT,
        short_description TEXT,
        featured_image LONGTEXT,
        price DECIMAL(10,2) DEFAULT 0.00,
        instructor_id INT NOT NULL,
        category VARCHAR(100),
        difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
        duration_weeks INT DEFAULT 4,
        prerequisites TEXT,
        learning_outcomes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_instructor_id (instructor_id),
        INDEX idx_slug (slug),
        INDEX idx_is_active (is_active),
        INDEX idx_category (category),
        FULLTEXT idx_search (title, description, short_description)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица уроков
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lessons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        content LONGTEXT,
        lesson_type ENUM('video', 'text', 'live_stream', 'test') NOT NULL,
        video_url VARCHAR(500),
        video_duration INT DEFAULT 0,
        live_stream_date TIMESTAMP NULL,
        live_stream_url VARCHAR(500),
        order_index INT NOT NULL DEFAULT 0,
        is_preview BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        INDEX idx_course_id (course_id),
        INDEX idx_order_index (order_index),
        INDEX idx_lesson_type (lesson_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица тестов
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lesson_tests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lesson_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        passing_score INT DEFAULT 70,
        time_limit INT DEFAULT 0,
        max_attempts INT DEFAULT 3,
        questions JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        INDEX idx_lesson_id (lesson_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица назначенных курсов студентам
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS student_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        assigned_by INT NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        progress_percentage DECIMAL(5,2) DEFAULT 0.00,
        is_active BOOLEAN DEFAULT true,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_course (student_id, course_id),
        INDEX idx_student_id (student_id),
        INDEX idx_course_id (course_id),
        INDEX idx_assigned_by (assigned_by),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица прогресса по урокам
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS lesson_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        lesson_id INT NOT NULL,
        course_id INT NOT NULL,
        status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
        started_at TIMESTAMP NULL,
        completed_at TIMESTAMP NULL,
        time_spent INT DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        UNIQUE KEY unique_student_lesson (student_id, lesson_id),
        INDEX idx_student_id (student_id),
        INDEX idx_lesson_id (lesson_id),
        INDEX idx_course_id (course_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица результатов тестов
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS test_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        lesson_id INT NOT NULL,
        test_id INT NOT NULL,
        answers JSON NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        max_score DECIMAL(5,2) NOT NULL,
        passed BOOLEAN NOT NULL,
        attempt_number INT NOT NULL DEFAULT 1,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        time_taken INT DEFAULT 0,
        FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
        FOREIGN KEY (test_id) REFERENCES lesson_tests(id) ON DELETE CASCADE,
        INDEX idx_student_id (student_id),
        INDEX idx_lesson_id (lesson_id),
        INDEX idx_test_id (test_id),
        INDEX idx_passed (passed)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Таблица отзывов
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NULL,
        author_name VARCHAR(255) NOT NULL,
        author_email VARCHAR(255) NOT NULL,
        author_phone VARCHAR(20) NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT false,
        likes_count INT DEFAULT 0,
        replies_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_course_id (course_id),
        INDEX idx_rating (rating),
        INDEX idx_is_approved (is_approved),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Database tables created successfully');
    
    // Выполняем миграции для добавления новых столбцов
    await runMigrations(connection);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Функция для выполнения миграций базы данных
const runMigrations = async (connection: mysql.PoolConnection) => {
  try {
    console.log('🔄 Running database migrations...');
    
    // Проверяем и добавляем столбцы prerequisites и learning_outcomes в таблицу courses
    try {
      await connection.execute(`
        ALTER TABLE courses 
        ADD COLUMN prerequisites TEXT,
        ADD COLUMN learning_outcomes TEXT
      `);
      console.log('✅ Added prerequisites and learning_outcomes columns to courses table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns prerequisites and learning_outcomes already exist in courses table');
      } else {
        console.error('❌ Error adding columns to courses table:', error);
      }
    }

    // Создаем таблицу student_lesson_progress если не существует
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS student_lesson_progress (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          lesson_id INT NOT NULL,
          is_completed BOOLEAN DEFAULT false,
          completed_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
          UNIQUE KEY unique_student_lesson_progress (student_id, lesson_id),
          INDEX idx_student_id (student_id),
          INDEX idx_lesson_id (lesson_id),
          INDEX idx_is_completed (is_completed)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created student_lesson_progress table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table student_lesson_progress already exists');
      } else {
        console.error('❌ Error creating student_lesson_progress table:', error);
      }
    }

    // Обновляем таблицу student_courses для соответствия новой структуре
    try {
      await connection.execute(`
        ALTER TABLE student_courses 
        ADD COLUMN enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN completion_date TIMESTAMP NULL
      `);
      console.log('✅ Added enrollment_date and completion_date columns to student_courses table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns enrollment_date and completion_date already exist in student_courses table');
      } else {
        console.error('❌ Error adding columns to student_courses table:', error);
      }
    }

    // Миграция для таблицы reviews - изменяем структуру
    try {
      // Сначала проверим, нужно ли изменять таблицу
      const [columns] = await connection.execute<RowDataPacket[]>(`
        SELECT COLUMN_NAME, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'reviews' 
        AND COLUMN_NAME IN ('user_id', 'reason')
      `);

      const hasReasonColumn = columns.some((col: any) => col.COLUMN_NAME === 'reason');
      const userIdNullable = columns.find((col: any) => col.COLUMN_NAME === 'user_id')?.IS_NULLABLE === 'YES';

      if (!hasReasonColumn || !userIdNullable) {
        // Удаляем внешний ключ на user_id
        await connection.execute(`ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_1`);
        
        // Изменяем user_id на nullable
        await connection.execute(`ALTER TABLE reviews MODIFY COLUMN user_id INT NULL`);
        
        // Добавляем колонку reason если её нет
        if (!hasReasonColumn) {
          await connection.execute(`ALTER TABLE reviews ADD COLUMN reason VARCHAR(100) NULL AFTER course_id`);
        }
        
        // Восстанавливаем внешний ключ
        await connection.execute(`
          ALTER TABLE reviews 
          ADD CONSTRAINT fk_reviews_user_id 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        `);
        
        console.log('✅ Updated reviews table structure');
      } else {
        console.log('ℹ️ Reviews table already has correct structure');
      }
    } catch (error: any) {
      console.error('❌ Error updating reviews table:', error);
    }

    // Создаем таблицу review_likes для отслеживания лайков пользователей
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS review_likes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          review_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_review_like (user_id, review_id),
          INDEX idx_user_id (user_id),
          INDEX idx_review_id (review_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created review_likes table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table review_likes already exists');
      } else {
        console.error('❌ Error creating review_likes table:', error);
      }
    }
    
    // Создаем таблицу групп
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS \`groups\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          course_id INT NULL,
          instructor_id INT NOT NULL,
          start_date DATE NULL,
          end_date DATE,
          max_students INT DEFAULT 20,
          status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
          FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE RESTRICT,
          INDEX idx_course_id (course_id),
          INDEX idx_instructor_id (instructor_id),
          INDEX idx_status (status),
          INDEX idx_start_date (start_date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created groups table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table groups already exists');
      } else {
        console.error('❌ Error creating groups table:', error);
      }
    }

    // Создаем таблицу участников групп
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS group_students (
          id INT AUTO_INCREMENT PRIMARY KEY,
          group_id INT NOT NULL,
          student_id INT NOT NULL,
          enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status ENUM('active', 'completed', 'dropped') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_group_student (group_id, student_id),
          INDEX idx_group_id (group_id),
          INDEX idx_student_id (student_id),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created group_students table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table group_students already exists');
      } else {
        console.error('❌ Error creating group_students table:', error);
      }
    }

    // Создаем таблицу расписания
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS schedules (
          id INT AUTO_INCREMENT PRIMARY KEY,
          group_id INT NOT NULL,
          day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          lesson_type ENUM('theory', 'practice', 'exam') DEFAULT 'theory',
          classroom VARCHAR(100),
          notes TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
          INDEX idx_group_id (group_id),
          INDEX idx_day_of_week (day_of_week),
          INDEX idx_start_time (start_time),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created schedules table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table schedules already exists');
      } else {
        console.error('❌ Error creating schedules table:', error);
      }
    }

    // Создаем таблицу индивидуальных занятий
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS individual_lessons (
          id INT AUTO_INCREMENT PRIMARY KEY,
          student_id INT NOT NULL,
          instructor_id INT NOT NULL,
          lesson_date DATE NOT NULL,
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          lesson_type ENUM('theory', 'practice', 'exam') DEFAULT 'practice',
          status ENUM('scheduled', 'completed', 'cancelled', 'missed') DEFAULT 'scheduled',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_student_id (student_id),
          INDEX idx_instructor_id (instructor_id),
          INDEX idx_lesson_date (lesson_date),
          INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created individual_lessons table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table individual_lessons already exists');
      } else {
        console.error('❌ Error creating individual_lessons table:', error);
      }
    }

    // Добавляем поля location и subject в таблицу schedules
    try {
      await connection.execute(`
        ALTER TABLE schedules 
        ADD COLUMN location VARCHAR(100) DEFAULT '',
        ADD COLUMN subject VARCHAR(100) DEFAULT ''
      `);
      console.log('✅ Added location and subject columns to schedules table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns location and subject already exist in schedules table');
      } else {
        console.error('❌ Error adding columns to schedules table:', error);
      }
    }

    // Добавляем поля location и subject в таблицу individual_lessons  
    try {
      await connection.execute(`
        ALTER TABLE individual_lessons 
        ADD COLUMN location VARCHAR(100) DEFAULT '',
        ADD COLUMN subject VARCHAR(100) DEFAULT ''
      `);
      console.log('✅ Added location and subject columns to individual_lessons table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns location and subject already exist in individual_lessons table');
      } else {
        console.error('❌ Error adding columns to individual_lessons table:', error);
      }
    }

    // Добавляем поля title и description в таблицу individual_lessons
    try {
      await connection.execute(`
        ALTER TABLE individual_lessons 
        ADD COLUMN title VARCHAR(255) DEFAULT '',
        ADD COLUMN description TEXT
      `);
      console.log('✅ Added title and description columns to individual_lessons table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ Columns title and description already exist in individual_lessons table');
      } else {
        console.error('❌ Error adding title and description columns to individual_lessons table:', error);
      }
    }

    // Добавляем поля для одноразовых групповых занятий в таблицу schedules
    try {
      await connection.execute(`
        ALTER TABLE schedules 
        ADD COLUMN is_one_time BOOLEAN DEFAULT false,
        ADD COLUMN scheduled_date DATE NULL,
        ADD COLUMN instructor_id INT NULL,
        ADD FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
      `);
      console.log('✅ Added one-time group lesson fields to schedules table');
    } catch (error: any) {
      if (error.code === 'ER_DUP_FIELDNAME') {
        console.log('ℹ️ One-time group lesson fields already exist in schedules table');
      } else {
        console.error('❌ Error adding one-time group lesson fields to schedules table:', error);
      }
    }

    // Создаем таблицу instructor_profiles для дополнительной информации об инструкторах
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS instructor_profiles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL UNIQUE,
          categories JSON DEFAULT NULL,
          experience VARCHAR(100) DEFAULT '',
          description TEXT,
          schedule TEXT,
          rating DECIMAL(3,2) DEFAULT 0.00,
          reviews_count INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_rating (rating)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created instructor_profiles table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table instructor_profiles already exists');
      } else {
        console.error('❌ Error creating instructor_profiles table:', error);
      }
    }

    // Создаем таблицу instructor_ratings для рейтингов инструкторов от пользователей
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS instructor_ratings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          instructor_id INT NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY unique_user_instructor_rating (user_id, instructor_id),
          INDEX idx_instructor_id (instructor_id),
          INDEX idx_rating (rating)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created instructor_ratings table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table instructor_ratings already exists');
      } else {
        console.error('❌ Error creating instructor_ratings table:', error);
      }
    }

    // Очищаем некорректные avatar_url
    try {
      await connection.execute(`
        UPDATE users 
        SET avatar_url = NULL 
        WHERE avatar_url LIKE '%avatar-7-1756977659148-722204302.jpeg%' 
           OR avatar_url = ''
           OR avatar_url = 'null'
      `);
      console.log('✅ Cleaned up invalid avatar URLs');
    } catch (error: any) {
      console.error('❌ Error cleaning avatar URLs:', error);
    }

    // Изменяем поля course_id и start_date в таблице groups на необязательные
    try {
      // Сначала удаляем внешний ключ если он существует
      await connection.execute(`
        ALTER TABLE \`groups\` DROP FOREIGN KEY groups_ibfk_1
      `);
    } catch (error: any) {
      // Игнорируем ошибку если внешний ключ не существует
    }

    try {
      await connection.execute(`
        ALTER TABLE \`groups\` 
        MODIFY COLUMN course_id INT NULL,
        MODIFY COLUMN start_date DATE NULL
      `);
      
      // Добавляем внешний ключ обратно с правильным именем
      await connection.execute(`
        ALTER TABLE \`groups\` 
        ADD CONSTRAINT fk_groups_course_id 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      `);
      
      console.log('✅ Modified groups table: course_id and start_date are now nullable');
    } catch (error: any) {
      console.log('ℹ️ Groups table fields already nullable or error occurred:', error.message);
    }

    // ОТКЛЮЧЕНО: Создаем таблицу категорий для тарифных планов
    // Таблицы созданы через полный скрипт очистки с правильной структурой
    /*
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS price_categories (
          id VARCHAR(10) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          icon VARCHAR(50) NOT NULL,
          description TEXT,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_sort_order (sort_order),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created price_categories table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table price_categories already exists');
      } else {
        console.error('❌ Error creating price_categories table:', error);
      }
    }

    // Создаем таблицу тарифных планов
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS price_items (
          id VARCHAR(50) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category_id VARCHAR(10) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          old_price DECIMAL(10,2) NULL,
          duration VARCHAR(100) NOT NULL,
          lessons INT NOT NULL,
          features JSON NOT NULL,
          popular BOOLEAN DEFAULT false,
          description TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES price_categories(id) ON DELETE CASCADE,
          INDEX idx_category_id (category_id),
          INDEX idx_popular (popular),
          INDEX idx_sort_order (sort_order),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created price_items table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table price_items already exists');
      } else {
        console.error('❌ Error creating price_items table:', error);
      }
    }
    */

    // Создаем таблицу дополнительных услуг
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS additional_services (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_sort_order (sort_order),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created additional_services table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table additional_services already exists');
      } else {
        console.error('❌ Error creating additional_services table:', error);
      }
    }

    // Создаем таблицу скидок
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS price_discounts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(200) NOT NULL,
          discount_value DECIMAL(5,2) NOT NULL,
          description TEXT,
          conditions TEXT,
          is_active BOOLEAN DEFAULT true,
          start_date DATE,
          end_date DATE,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_sort_order (sort_order),
          INDEX idx_is_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Created price_discounts table');
    } catch (error: any) {
      if (error.code === 'ER_TABLE_EXISTS_ERROR') {
        console.log('ℹ️ Table price_discounts already exists');
      } else {
        console.error('❌ Error creating price_discounts table:', error);
      }
    }

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    throw error;
  }
};
