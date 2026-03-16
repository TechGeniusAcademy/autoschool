import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

// Получить общую статистику
export const getGeneralStats = async (req: Request, res: Response) => {
  try {
    // Получаем общие статистики
    const [stats] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'instructor') as total_instructors,
        (SELECT COUNT(*) FROM \`groups\`) as total_groups,
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM schedules) as total_schedules,
        (SELECT COUNT(*) FROM individual_lessons WHERE status != 'cancelled') as total_individual_lessons,
        (SELECT COUNT(*) FROM reviews WHERE is_approved = true) as total_reviews,
        (SELECT AVG(rating) FROM reviews WHERE is_approved = true) as average_rating
    `);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching general stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении общей статистики'
    });
  }
};

// Получить статистику студентов
export const getStudentsStats = async (req: Request, res: Response) => {
  try {
    const [students] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at,
        g.name as group_name,
        c.title as course_title,
        COUNT(il.id) as individual_lessons_count,
        COALESCE(AVG(r.rating), 0) as average_rating
      FROM users u
      LEFT JOIN group_students gs ON u.id = gs.student_id
      LEFT JOIN \`groups\` g ON gs.group_id = g.id
      LEFT JOIN courses c ON g.course_id = c.id
      LEFT JOIN individual_lessons il ON u.id = il.student_id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE u.role = 'student'
      GROUP BY u.id, g.id, c.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики студентов'
    });
  }
};

// Получить статистику инструкторов
export const getInstructorsStats = async (req: Request, res: Response) => {
  try {
    const [instructors] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.created_at,
        COUNT(DISTINCT g.id) as groups_count,
        COUNT(DISTINCT il.id) as individual_lessons_count,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM users u
      LEFT JOIN \`groups\` g ON u.id = g.instructor_id
      LEFT JOIN individual_lessons il ON u.id = il.instructor_id
      LEFT JOIN reviews r ON u.id = r.user_id
      WHERE u.role = 'instructor'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: instructors
    });
  } catch (error) {
    console.error('Error fetching instructors stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики инструкторов'
    });
  }
};

// Получить статистику курсов
export const getCoursesStats = async (req: Request, res: Response) => {
  try {
    const [courses] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.created_at,
        COUNT(DISTINCT g.id) as groups_count,
        COUNT(DISTINCT gs.student_id) as students_count,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(DISTINCT r.id) as reviews_count
      FROM courses c
      LEFT JOIN \`groups\` g ON c.id = g.course_id
      LEFT JOIN group_students gs ON g.id = gs.group_id
      LEFT JOIN reviews r ON c.id = r.course_id
      GROUP BY c.id
      ORDER BY students_count DESC
    `);

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching courses stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики курсов'
    });
  }
};

// Экспорт отчета в CSV
export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    let data: any[] = [];
    let filename = '';
    let headers: string[] = [];

    switch (type) {
      case 'general':
        const [general] = await pool.execute<RowDataPacket[]>(`
          SELECT 
            'Общая статистика' as 'Тип',
            'Всего студентов' as 'Показатель',
            COUNT(DISTINCT CASE WHEN u.role = 'student' THEN u.id END) as 'Значение'
          FROM users u
          UNION ALL
          SELECT 
            'Общая статистика' as 'Тип',
            'Всего инструкторов' as 'Показатель',
            COUNT(DISTINCT CASE WHEN u.role = 'instructor' THEN u.id END) as 'Значение'
          FROM users u
          UNION ALL
          SELECT 
            'Общая статистика' as 'Тип',
            'Всего курсов' as 'Показатель',
            COUNT(DISTINCT c.id) as 'Значение'
          FROM courses c
          UNION ALL
          SELECT 
            'Общая статистика' as 'Тип',
            'Активных групп' as 'Показатель',
            COUNT(DISTINCT g.id) as 'Значение'
          FROM \`groups\` g
          WHERE g.is_active = true
        `);
        data = general;
        filename = 'general_report';
        headers = ['Тип', 'Показатель', 'Значение'];
        break;

      case 'students':
        const [students] = await pool.execute<RowDataPacket[]>(`
          SELECT 
            u.first_name as 'Имя',
            u.last_name as 'Фамилия',
            u.email as 'Email',
            u.phone as 'Телефон',
            u.created_at as 'Дата регистрации',
            COALESCE(g.name, 'Не назначена') as 'Группа',
            COALESCE(c.title, 'Не назначен') as 'Курс'
          FROM users u
          LEFT JOIN group_students gs ON u.id = gs.student_id
          LEFT JOIN \`groups\` g ON gs.group_id = g.id
          LEFT JOIN courses c ON g.course_id = c.id
          WHERE u.role = 'student'
          ORDER BY u.created_at DESC
        `);
        data = students;
        filename = 'students_report';
        headers = ['Имя', 'Фамилия', 'Email', 'Телефон', 'Дата регистрации', 'Группа', 'Курс'];
        break;

      case 'instructors':
        const [instructors] = await pool.execute<RowDataPacket[]>(`
          SELECT 
            u.first_name as 'Имя',
            u.last_name as 'Фамилия',
            u.email as 'Email',
            u.phone as 'Телефон',
            u.created_at as 'Дата регистрации',
            COUNT(DISTINCT g.id) as 'Количество групп',
            COUNT(DISTINCT il.id) as 'Индивидуальные занятия'
          FROM users u
          LEFT JOIN \`groups\` g ON u.id = g.instructor_id
          LEFT JOIN individual_lessons il ON u.id = il.instructor_id
          WHERE u.role = 'instructor'
          GROUP BY u.id
          ORDER BY u.created_at DESC
        `);
        data = instructors;
        filename = 'instructors_report';
        headers = ['Имя', 'Фамилия', 'Email', 'Телефон', 'Дата регистрации', 'Количество групп', 'Индивидуальные занятия'];
        break;

      case 'courses':
        const [courses] = await pool.execute<RowDataPacket[]>(`
          SELECT 
            c.title as 'Название курса',
            c.description as 'Описание',
            COUNT(DISTINCT g.id) as 'Количество групп',
            COUNT(DISTINCT gs.student_id) as 'Количество студентов',
            c.created_at as 'Дата создания'
          FROM courses c
          LEFT JOIN \`groups\` g ON c.id = g.course_id
          LEFT JOIN group_students gs ON g.id = gs.group_id
          GROUP BY c.id
          ORDER BY c.created_at DESC
        `);
        data = courses;
        filename = 'courses_report';
        headers = ['Название курса', 'Описание', 'Количество групп', 'Количество студентов', 'Дата создания'];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Неизвестный тип отчета'
        });
    }

    // Формируем CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Экранируем кавычки и переносы строк
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    // Устанавливаем заголовки для скачивания файла
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`);
    
    // Добавляем BOM для корректного отображения кириллицы в Excel
    res.write('\uFEFF');
    res.end(csvContent);

  } catch (error) {
    console.error('Error exporting report:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при экспорте отчета'
    });
  }
};

// Универсальный метод для получения отчетов
export const getReports = async (req: Request, res: Response) => {
  const { type } = req.params;
  
  try {
    switch (type) {
      case 'general':
        return await getGeneralStats(req, res);
      case 'students':
        return await getStudentsStats(req, res);
      case 'instructors':
        return await getInstructorsStats(req, res);
      case 'courses':
        return await getCoursesStats(req, res);
      case 'financial':
        // Пока вернем пустые данные для финансовых отчетов
        return res.json({
          success: true,
          data: {
            totalRevenue: 0,
            monthlyRevenue: [],
            paymentMethods: [],
            unpaidLessons: []
          }
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Неизвестный тип отчета'
        });
    }
  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении отчета'
    });
  }
};
