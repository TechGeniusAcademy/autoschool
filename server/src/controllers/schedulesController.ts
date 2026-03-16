import { Request, Response } from 'express';
import { pool } from '../config/database';
import { RowDataPacket } from 'mysql2';

// Функция для преобразования title в lesson_type
const getLessonType = (title: string): 'theory' | 'practice' | 'exam' => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('практик') || lowerTitle.includes('вожден')) {
    return 'practice';
  } else if (lowerTitle.includes('экзамен') || lowerTitle.includes('тест')) {
    return 'exam';
  } else {
    return 'theory';
  }
};

interface Schedule extends RowDataPacket {
  id: number;
  group_id: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string;
  end_time: string;
  lesson_type: 'theory' | 'practice' | 'exam';
  classroom?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  group_name?: string;
  course_title?: string;
  instructor_name?: string;
}

interface IndividualLesson extends RowDataPacket {
  id: number;
  student_id: number;
  instructor_id: number;
  lesson_date: string;
  start_time: string;
  end_time: string;
  location?: string;
  subject?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  student_name?: string;
  instructor_name?: string;
}

// Получить расписание группы
export const getGroupSchedule = async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;

    const [schedules] = await pool.execute<Schedule[]>(`
      SELECT 
        s.*,
        g.name as group_name,
        c.title as course_title,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE s.group_id = ? AND s.is_active = true
      ORDER BY 
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, [groupId]);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching group schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении расписания группы'
    });
  }
};

// Получить расписание студента
export const getStudentSchedule = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Получаем расписание группы студента
    const [groupSchedules] = await pool.execute<Schedule[]>(`
      SELECT 
        s.id,
        s.day_of_week,
        s.start_time,
        s.end_time,
        s.classroom as location,
        s.lesson_type as subject,
        g.name as group_name,
        u.first_name as instructor_name,
        u.last_name as instructor_surname
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN group_students gs ON g.id = gs.group_id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE gs.student_id = ? AND gs.status = 'active' AND s.is_active = true
      ORDER BY 
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, [studentId]);

    // Получаем индивидуальные занятия студента
    const [individualLessons] = await pool.execute<IndividualLesson[]>(`
      SELECT 
        il.id,
        il.lesson_date,
        il.start_time,
        il.end_time,
        il.location,
        il.subject,
        il.status,
        u.first_name as instructor_name,
        u.last_name as instructor_surname
      FROM individual_lessons il
      JOIN users u ON il.instructor_id = u.id
      WHERE il.student_id = ? 
      AND il.lesson_date >= CURDATE()
      AND il.status IN ('scheduled', 'completed')
      ORDER BY il.lesson_date, il.start_time
    `, [studentId]);

    res.json({
      success: true,
      data: {
        groupSchedules,
        individualLessons
      }
    });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении расписания студента'
    });
  }
};

// Получить группу студента
export const getStudentGroup = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    const [groups] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        g.*,
        c.title as course_title,
        c.description as course_description,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        u.email as instructor_email,
        u.avatar_url as instructor_avatar_url,
        gs.enrolled_at,
        gs.status as enrollment_status,
        (
          SELECT COUNT(*) 
          FROM group_students gs_count 
          WHERE gs_count.group_id = g.id AND gs_count.status = 'active'
        ) as total_students
      FROM \`groups\` g
      JOIN group_students gs ON g.id = gs.group_id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE gs.student_id = ? AND gs.status = 'active'
    `, [studentId]);

    if (groups.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Студент не состоит ни в одной группе'
      });
    }

    const group = groups[0];

    // Получаем всех студентов в группе (включая текущего)
    const [allStudents] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        gs.enrolled_at
      FROM group_students gs
      JOIN users u ON gs.student_id = u.id
      WHERE gs.group_id = ? AND gs.status = 'active'
      ORDER BY gs.enrolled_at
    `, [group.id]);

    res.json({
      success: true,
      data: {
        ...group,
        students: allStudents
      }
    });
  } catch (error) {
    console.error('Error fetching student group:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении группы студента'
    });
  }
};

// Получить расписание группы студента
export const getStudentGroupSchedule = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    // Получаем группу студента и её расписание
    const [schedules] = await pool.execute<RowDataPacket[]>(`
      SELECT 
        s.*,
        g.name as group_name,
        c.title as course_title,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN group_students gs ON g.id = gs.group_id
      JOIN courses c ON g.course_id = c.id
      JOIN users u ON g.instructor_id = u.id
      WHERE gs.student_id = ? AND gs.status = 'active' AND s.is_active = true
      ORDER BY 
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, [studentId]);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching student group schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении расписания группы студента'
    });
  }
};

// Создать расписание для группы
export const createSchedule = async (req: Request, res: Response) => {
  try {
    const {
      group_id,
      day_of_week,
      start_time,
      end_time,
      lesson_type,
      classroom,
      location,
      subject,
      notes
    } = req.body;

    // Валидация обязательных полей
    if (!group_id || !day_of_week || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Группа, день недели, время начала и окончания обязательны'
      });
    }

    // Проверяем, существует ли группа
    const [groups] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM \`groups\` WHERE id = ?',
      [group_id]
    );

    if (groups.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Указанная группа не найдена'
      });
    }

    // Проверяем, нет ли конфликта времени
    const [conflicts] = await pool.execute<RowDataPacket[]>(`
      SELECT id FROM schedules 
      WHERE group_id = ? 
      AND day_of_week = ? 
      AND is_active = true
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [group_id, day_of_week, start_time, start_time, end_time, end_time, start_time, end_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Конфликт времени с существующим расписанием'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO schedules (group_id, day_of_week, start_time, end_time, lesson_type, classroom, location, subject, notes, is_one_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, false)
    `, [group_id, day_of_week, start_time, end_time, lesson_type || 'theory', classroom || null, location || '', subject || '', notes || null]);

    const insertResult = result as any;

    res.status(201).json({
      success: true,
      message: 'Расписание успешно создано',
      data: {
        id: insertResult.insertId
      }
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании расписания'
    });
  }
};

// Обновить расписание
export const updateSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      instructor_id,
      day_of_week,
      start_time,
      end_time,
      lesson_type,
      classroom,
      location,
      subject,
      notes,
      is_active
    } = req.body;

    console.log("🔧 updateSchedule received data:", {
      instructor_id,
      day_of_week,
      start_time,
      end_time,
      lesson_type,
      classroom,
      location,
      subject,
      notes,
      is_active
    });

    // Проверяем, существует ли расписание
    const [existingSchedule] = await pool.execute<Schedule[]>(
      'SELECT id, group_id FROM schedules WHERE id = ?',
      [id]
    );

    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Расписание не найдено'
      });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (instructor_id !== undefined) {
      updateFields.push('instructor_id = ?');
      updateValues.push(instructor_id);
    }
    if (day_of_week !== undefined) {
      updateFields.push('day_of_week = ?');
      updateValues.push(day_of_week);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (lesson_type !== undefined) {
      updateFields.push('lesson_type = ?');
      updateValues.push(lesson_type);
    }
    if (classroom !== undefined) {
      updateFields.push('classroom = ?');
      updateValues.push(classroom);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location);
    }
    if (subject !== undefined) {
      updateFields.push('subject = ?');
      updateValues.push(subject);
    }
    if (notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(notes);
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Нет данных для обновления'
      });
    }

    updateValues.push(id);

    // Проверяем конфликты только если изменяется время
    if (day_of_week !== undefined || start_time !== undefined || end_time !== undefined) {
      const schedule = existingSchedule[0];
      const checkDay = day_of_week || schedule.day_of_week;
      const checkStartTime = start_time || schedule.start_time;
      const checkEndTime = end_time || schedule.end_time;

      const [conflicts] = await pool.execute<RowDataPacket[]>(`
        SELECT id FROM schedules 
        WHERE group_id = ? 
        AND day_of_week = ? 
        AND is_active = true
        AND id != ?
        AND (
          (start_time <= ? AND end_time > ?) OR
          (start_time < ? AND end_time >= ?) OR
          (start_time >= ? AND end_time <= ?)
        )
      `, [schedule.group_id, checkDay, id, checkStartTime, checkStartTime, checkEndTime, checkEndTime, checkStartTime, checkEndTime]);

      if (conflicts.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Конфликт времени с существующим расписанием'
        });
      }
    }

    await pool.execute(`
      UPDATE schedules 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    res.json({
      success: true,
      message: 'Расписание успешно обновлено'
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении расписания'
    });
  }
};

// Удалить расписание
export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем, существует ли расписание
    const [existingSchedule] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM schedules WHERE id = ?',
      [id]
    );

    if (existingSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Расписание не найдено'
      });
    }

    await pool.execute('DELETE FROM schedules WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Расписание успешно удалено'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении расписания'
    });
  }
};

// Получить все расписания (для админа)
export const getAllSchedules = async (req: Request, res: Response) => {
  try {
    const { group_id, day_of_week } = req.query;

    let whereConditions: string[] = ['s.is_active = true'];
    const queryParams: any[] = [];

    if (group_id) {
      whereConditions.push('s.group_id = ?');
      queryParams.push(parseInt(group_id as string));
    }

    if (day_of_week) {
      whereConditions.push('s.day_of_week = ?');
      queryParams.push(day_of_week);
    }

    const whereClause = whereConditions.join(' AND ');

    const [schedules] = await pool.execute<Schedule[]>(`
      SELECT 
        s.id,
        CONCAT(s.lesson_type, ' - ', g.name) as title,
        s.notes as description,
        COALESCE(s.instructor_id, g.instructor_id) as instructor_id,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        s.group_id,
        g.name as group_name,
        DATE_FORMAT(
          DATE_ADD(
            CURDATE() - WEEKDAY(CURDATE()),
            INTERVAL 
            CASE s.day_of_week
              WHEN 'monday' THEN 0
              WHEN 'tuesday' THEN 1
              WHEN 'wednesday' THEN 2
              WHEN 'thursday' THEN 3
              WHEN 'friday' THEN 4
              WHEN 'saturday' THEN 5
              WHEN 'sunday' THEN 6
            END DAY
          ), '%Y-%m-%d'
        ) as scheduled_date,
        s.start_time,
        s.end_time,
        s.classroom as location,
        s.lesson_type as subject,
        s.is_active,
        s.is_one_time,
        s.created_at,
        c.title as course_title
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      LEFT JOIN courses c ON g.course_id = c.id
      LEFT JOIN users u ON COALESCE(s.instructor_id, g.instructor_id) = u.id
      WHERE ${whereClause}
      ORDER BY 
        g.name,
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, queryParams);

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching all schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении расписаний'
    });
  }
};

// Получить все индивидуальные занятия (для админов)
export const getAllIndividualLessons = async (req: Request, res: Response) => {
  try {
    const { student_id, instructor_id, status, date_from, date_to } = req.query;
    
    let whereConditions: string[] = [];
    const queryParams: any[] = [];

    if (student_id) {
      whereConditions.push('il.student_id = ?');
      queryParams.push(parseInt(student_id as string));
    }

    if (instructor_id) {
      whereConditions.push('il.instructor_id = ?');
      queryParams.push(parseInt(instructor_id as string));
    }

    if (status) {
      whereConditions.push('il.status = ?');
      queryParams.push(status);
    }

    if (date_from) {
      whereConditions.push('il.lesson_date >= ?');
      queryParams.push(date_from);
    }

    if (date_to) {
      whereConditions.push('il.lesson_date <= ?');
      queryParams.push(date_to);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [lessons] = await pool.execute<IndividualLesson[]>(`
      SELECT 
        il.id,
        CONCAT('Индивидуальное занятие - ', il.subject) as title,
        il.notes as description,
        il.instructor_id,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        il.student_id,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        il.lesson_date as scheduled_date,
        il.start_time,
        il.end_time,
        il.location,
        il.subject,
        il.status,
        il.created_at
      FROM individual_lessons il
      JOIN users s ON il.student_id = s.id
      JOIN users i ON il.instructor_id = i.id
      ${whereClause}
      ORDER BY il.lesson_date, il.start_time
    `, queryParams);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching individual lessons:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении индивидуальных занятий'
    });
  }
};

// Создать индивидуальное занятие
export const createIndividualLesson = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      student_id,
      instructor_id,
      scheduled_date, // Клиент отправляет scheduled_date
      start_time,
      end_time,
      location,
      subject,
      status
    } = req.body;

    console.log("🆕 Создание индивидуального занятия на сервере:", req.body);

    // Валидация обязательных полей
    if (!student_id || !instructor_id || !scheduled_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Студент, инструктор, дата и время обязательны'
      });
    }

    // Проверяем, существует ли студент
    const [students] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = "student" AND is_active = true',
      [student_id]
    );

    if (students.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Указанный студент не найден'
      });
    }

    // Проверяем, существует ли инструктор
    const [instructors] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role IN ("instructor", "admin") AND is_active = true',
      [instructor_id]
    );

    if (instructors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Указанный инструктор не найден'
      });
    }

    // Проверяем конфликты времени для инструктора
    const [conflicts] = await pool.execute<RowDataPacket[]>(`
      SELECT id FROM individual_lessons 
      WHERE instructor_id = ? 
      AND lesson_date = ? 
      AND status != 'cancelled'
      AND (
        (start_time <= ? AND end_time > ?) OR
        (start_time < ? AND end_time >= ?) OR
        (start_time >= ? AND end_time <= ?)
      )
    `, [instructor_id, scheduled_date, start_time, start_time, end_time, end_time, start_time, end_time]);

    if (conflicts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Конфликт времени с существующим занятием инструктора'
      });
    }

    const [result] = await pool.execute(`
      INSERT INTO individual_lessons (student_id, instructor_id, lesson_date, start_time, end_time, location, subject, title, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [student_id, instructor_id, scheduled_date, start_time, end_time, location || '', subject || '', title || '', description || '', status || 'scheduled']);

    const insertResult = result as any;

    res.status(201).json({
      success: true,
      message: 'Индивидуальное занятие успешно создано',
      data: {
        id: insertResult.insertId
      }
    });
  } catch (error) {
    console.error('Error creating individual lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании индивидуального занятия'
    });
  }
};

// Обновить статус индивидуального занятия
export const updateIndividualLessonStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Недопустимый статус занятия'
      });
    }

    // Проверяем, существует ли занятие
    const [existingLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM individual_lessons WHERE id = ?',
      [id]
    );

    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    await pool.execute(`
      UPDATE individual_lessons 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [status, id]);

    res.json({
      success: true,
      message: 'Статус занятия успешно обновлен'
    });
  } catch (error) {
    console.error('Error updating individual lesson status:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении статуса занятия'
    });
  }
};

// Получить расписание инструктора (групповые занятия)
export const getInstructorSchedule = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).user.id;

    // Сначала получаем регулярные групповые занятия
    const [schedules] = await pool.execute<Schedule[]>(`
      SELECT 
        s.*,
        g.name as group_name,
        'Групповое занятие' as course_title,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        'group' as lesson_type
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN users u ON g.instructor_id = u.id
      WHERE g.instructor_id = ? AND s.is_active = true AND (s.is_one_time = false OR s.is_one_time IS NULL)
      ORDER BY 
        FIELD(s.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        s.start_time
    `, [instructorId]);

    // Получаем одноразовые групповые занятия
    const [oneTimeGroupLessons] = await pool.execute<any[]>(`
      SELECT 
        s.id,
        s.scheduled_date as lesson_date,
        s.start_time,
        s.end_time,
        s.location,
        s.subject,
        'scheduled' as status,
        g.name as group_name,
        'Одноразовое групповое занятие' as course_title,
        CONCAT(u.first_name, ' ', u.last_name) as instructor_name,
        'one_time_group' as lesson_type
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      JOIN users u ON s.instructor_id = u.id
      WHERE s.instructor_id = ? AND s.is_one_time = true
      ORDER BY s.scheduled_date DESC, s.start_time ASC
    `, [instructorId]);

    // Затем получаем индивидуальные занятия
    const [individualLessons] = await pool.execute<any[]>(`
      SELECT 
        il.id,
        il.lesson_date,
        il.start_time,
        il.end_time,
        il.location,
        il.subject,
        il.status,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        'Индивидуальное занятие' as course_title,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name,
        'individual' as lesson_type
      FROM individual_lessons il
      JOIN users s ON il.student_id = s.id
      JOIN users i ON il.instructor_id = i.id
      WHERE il.instructor_id = ?
      ORDER BY il.lesson_date DESC, il.start_time ASC
    `, [instructorId]);

    res.json({
      success: true,
      data: {
        schedules: schedules,
        individualLessons: individualLessons,
        oneTimeGroupLessons: oneTimeGroupLessons
      }
    });
  } catch (error) {
    console.error('Error fetching instructor schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении расписания инструктора'
    });
  }
};

// Получить индивидуальные занятия инструктора
export const getInstructorIndividualLessons = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).user.id;

    const [lessons] = await pool.execute<IndividualLesson[]>(`
      SELECT 
        il.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name
      FROM individual_lessons il
      JOIN users s ON il.student_id = s.id
      JOIN users i ON il.instructor_id = i.id
      WHERE il.instructor_id = ?
      ORDER BY il.lesson_date DESC, il.start_time ASC
    `, [instructorId]);

    res.json({
      success: true,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching instructor individual lessons:', error);
    res.status(500).json({
      success: false,
    });
  }
};

// Обновить индивидуальное занятие
export const updateIndividualLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      instructor_id,
      student_id,
      scheduled_date, // Получаем как scheduled_date
      start_time,
      end_time,
      location,
      subject,
      status
    } = req.body;

    console.log("🔄 Обновление индивидуального занятия на сервере:", req.body);

    // Валидация обязательных полей
    if (!instructor_id || !student_id || !scheduled_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Студент, инструктор, дата и время обязательны'
      });
    }

    // Проверяем существование занятия
    const [existingLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM individual_lessons WHERE id = ?',
      [id]
    );

    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Индивидуальное занятие не найдено'
      });
    }

    // Обновляем занятие
    await pool.execute(`
      UPDATE individual_lessons 
      SET title = ?, description = ?, instructor_id = ?, student_id = ?, 
          lesson_date = ?, start_time = ?, end_time = ?, location = ?, 
          subject = ?, status = ?, updated_at = NOW()
      WHERE id = ?
    `, [title, description, instructor_id, student_id, scheduled_date, start_time, end_time, location, subject, status, id]);

    // Получаем обновленное занятие с информацией о студенте и инструкторе
    const [updatedLesson] = await pool.execute<IndividualLesson[]>(`
      SELECT 
        il.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        CONCAT(i.first_name, ' ', i.last_name) as instructor_name
      FROM individual_lessons il
      JOIN users s ON il.student_id = s.id
      JOIN users i ON il.instructor_id = i.id
      WHERE il.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Индивидуальное занятие успешно обновлено',
      data: { lesson: updatedLesson[0] }
    });
  } catch (error) {
    console.error('Error updating individual lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении индивидуального занятия'
    });
  }
};

// Удалить индивидуальное занятие
export const deleteIndividualLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверяем существование занятия
    const [existingLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM individual_lessons WHERE id = ?',
      [id]
    );

    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Индивидуальное занятие не найдено'
      });
    }

    // Удаляем занятие
    await pool.execute('DELETE FROM individual_lessons WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Индивидуальное занятие успешно удалено'
    });
  } catch (error) {
    console.error('Error deleting individual lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при удалении индивидуального занятия'
    });
  }
};

// Получить ближайшее занятие инструктора
export const getInstructorUpcomingLesson = async (req: Request, res: Response) => {
  try {
    const instructorId = (req as any).user.id;

    // Сначала ищем ближайшее индивидуальное занятие
    const [individualLessons] = await pool.execute<any[]>(`
      SELECT 
        il.id,
        il.lesson_date,
        il.start_time,
        il.end_time,
        il.location,
        il.subject,
        il.status,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.avatar_url as student_photo,
        'individual' as lesson_type,
        'Индивидуальное' as type_display,
        CONCAT(il.lesson_date, ' ', il.start_time) as datetime_sort
      FROM individual_lessons il
      JOIN users s ON il.student_id = s.id
      WHERE il.instructor_id = ? 
      AND il.lesson_date >= CURDATE()
      AND (
        il.lesson_date > CURDATE() 
        OR (il.lesson_date = CURDATE() AND il.start_time >= CURTIME())
      )
      AND il.status = 'scheduled'
      ORDER BY il.lesson_date ASC, il.start_time ASC
      LIMIT 1
    `, [instructorId]);

    // Затем ищем ближайшее групповое занятие на текущей неделе
    const [groupLessons] = await pool.execute<any[]>(`
      SELECT 
        s.id,
        CASE s.day_of_week
          WHEN 'monday' THEN DATE_ADD(CURDATE(), INTERVAL (1 - WEEKDAY(CURDATE())) DAY)
          WHEN 'tuesday' THEN DATE_ADD(CURDATE(), INTERVAL (2 - WEEKDAY(CURDATE())) DAY)
          WHEN 'wednesday' THEN DATE_ADD(CURDATE(), INTERVAL (3 - WEEKDAY(CURDATE())) DAY)
          WHEN 'thursday' THEN DATE_ADD(CURDATE(), INTERVAL (4 - WEEKDAY(CURDATE())) DAY)
          WHEN 'friday' THEN DATE_ADD(CURDATE(), INTERVAL (5 - WEEKDAY(CURDATE())) DAY)
          WHEN 'saturday' THEN DATE_ADD(CURDATE(), INTERVAL (6 - WEEKDAY(CURDATE())) DAY)
          WHEN 'sunday' THEN DATE_ADD(CURDATE(), INTERVAL (7 - WEEKDAY(CURDATE())) DAY)
        END as lesson_date,
        s.start_time,
        s.end_time,
        s.classroom as location,
        CASE s.lesson_type
          WHEN 'theory' THEN 'Теория'
          WHEN 'practice' THEN 'Практика'
          WHEN 'exam' THEN 'Экзамен'
          ELSE 'Занятие'
        END as subject,
        g.name as student_name,
        null as student_photo,
        'group' as lesson_type,
        'Групповое' as type_display,
        CONCAT(
          CASE s.day_of_week
            WHEN 'monday' THEN DATE_ADD(CURDATE(), INTERVAL (1 - WEEKDAY(CURDATE())) DAY)
            WHEN 'tuesday' THEN DATE_ADD(CURDATE(), INTERVAL (2 - WEEKDAY(CURDATE())) DAY)
            WHEN 'wednesday' THEN DATE_ADD(CURDATE(), INTERVAL (3 - WEEKDAY(CURDATE())) DAY)
            WHEN 'thursday' THEN DATE_ADD(CURDATE(), INTERVAL (4 - WEEKDAY(CURDATE())) DAY)
            WHEN 'friday' THEN DATE_ADD(CURDATE(), INTERVAL (5 - WEEKDAY(CURDATE())) DAY)
            WHEN 'saturday' THEN DATE_ADD(CURDATE(), INTERVAL (6 - WEEKDAY(CURDATE())) DAY)
            WHEN 'sunday' THEN DATE_ADD(CURDATE(), INTERVAL (7 - WEEKDAY(CURDATE())) DAY)
          END, ' ', s.start_time
        ) as datetime_sort
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      WHERE g.instructor_id = ? AND s.is_active = true
      HAVING lesson_date >= CURDATE()
      AND (
        lesson_date > CURDATE() 
        OR (lesson_date = CURDATE() AND s.start_time >= CURTIME())
      )
      ORDER BY lesson_date ASC, s.start_time ASC
      LIMIT 1
    `, [instructorId]);

    // Ищем ближайшее одноразовое групповое занятие
    const [oneTimeGroupLessons] = await pool.execute<any[]>(`
      SELECT 
        s.id,
        s.scheduled_date as lesson_date,
        s.start_time,
        s.end_time,
        s.location,
        s.subject,
        g.name as student_name,
        g.name as group_name,
        null as student_photo,
        'one_time_group' as lesson_type,
        'Одноразовое групповое' as type_display,
        CONCAT(s.scheduled_date, ' ', s.start_time) as datetime_sort
      FROM schedules s
      JOIN \`groups\` g ON s.group_id = g.id
      WHERE s.instructor_id = ? AND s.is_one_time = true
      AND s.scheduled_date >= CURDATE()
      AND (
        s.scheduled_date > CURDATE() 
        OR (s.scheduled_date = CURDATE() AND s.start_time >= CURTIME())
      )
      ORDER BY s.scheduled_date ASC, s.start_time ASC
      LIMIT 1
    `, [instructorId]);

    // Объединяем результаты и выбираем ближайшее
    const allLessons = [...individualLessons, ...groupLessons, ...oneTimeGroupLessons];
    
    if (allLessons.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'Нет предстоящих занятий'
      });
    }

    // Сортируем по дате и времени и берем первое
    const upcomingLesson = allLessons.sort((a, b) => 
      new Date(a.datetime_sort).getTime() - new Date(b.datetime_sort).getTime()
    )[0];

    res.json({
      success: true,
      data: upcomingLesson
    });
  } catch (error) {
    console.error('Error fetching instructor upcoming lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении ближайшего занятия'
    });
  }
};

// Создать одноразовое групповое занятие на конкретную дату
export const createOneTimeGroupLesson = async (req: Request, res: Response) => {
  try {
    const {
      group_id,
      instructor_id,
      scheduled_date,
      start_time,
      end_time,
      subject,
      location,
      description,
      title
    } = req.body;

    console.log("📝 createOneTimeGroupLesson received data:", {
      group_id,
      instructor_id,
      scheduled_date,
      start_time,
      end_time,
      subject,
      location,
      description,
      title
    });

    // Валидация обязательных полей
    if (!group_id || !instructor_id || !scheduled_date || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message: 'Группа, инструктор, дата, время начала и окончания обязательны'
      });
    }

    // Проверяем, существует ли группа
    const [groups] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name FROM `groups` WHERE id = ?',
      [group_id]
    );

    if (groups.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Указанная группа не найдена'
      });
    }

    // Проверяем, существует ли инструктор
    const [instructors] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role IN ("instructor", "admin") AND is_active = true',
      [instructor_id]
    );

    if (instructors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Указанный инструктор не найден'
      });
    }

    // Определяем день недели из даты
    const date = new Date(scheduled_date);
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

    // Создаем запись в таблице schedules с дополнительными полями
    const lessonType = title ? getLessonType(title) : 'theory';
    console.log("🎯 Using lesson_type:", lessonType, "from title:", title);
    
    const [result] = await pool.execute(`
      INSERT INTO schedules (group_id, day_of_week, start_time, end_time, lesson_type, location, subject, notes, is_one_time, scheduled_date, instructor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, ?, ?)
    `, [group_id, dayOfWeek, start_time, end_time, lessonType, location || '', subject || '', description || null, scheduled_date, instructor_id]);

    const insertResult = result as any;

    res.status(201).json({
      success: true,
      message: 'Групповое занятие успешно создано',
      data: {
        id: insertResult.insertId
      }
    });
  } catch (error) {
    console.error('Error creating one-time group lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при создании группового занятия'
    });
  }
};

// Обновить одноразовое групповое занятие
export const updateOneTimeGroupLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      group_id,
      instructor_id,
      scheduled_date,
      start_time,
      end_time,
      subject,
      location,
      description,
      title,
      is_active
    } = req.body;

    // Проверяем, существует ли занятие и является ли оно одноразовым
    const [existingLesson] = await pool.execute<RowDataPacket[]>(
      'SELECT id, is_one_time FROM schedules WHERE id = ?',
      [id]
    );

    if (existingLesson.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    if (!existingLesson[0].is_one_time) {
      return res.status(400).json({
        success: false,
        message: 'Это не одноразовое групповое занятие'
      });
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Обрабатываем поля, которые могут быть обновлены
    if (group_id !== undefined) {
      updateFields.push('group_id = ?');
      updateValues.push(group_id);
    }
    if (instructor_id !== undefined) {
      updateFields.push('instructor_id = ?');
      updateValues.push(instructor_id);
    }
    if (scheduled_date !== undefined) {
      updateFields.push('scheduled_date = ?');
      updateValues.push(scheduled_date);
      
      // Обновляем день недели на основе новой даты
      const date = new Date(scheduled_date);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
      updateFields.push('day_of_week = ?');
      updateValues.push(dayOfWeek);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }
    if (subject !== undefined) {
      updateFields.push('subject = ?');
      updateValues.push(subject || null);
    }
    if (location !== undefined) {
      updateFields.push('location = ?');
      updateValues.push(location || null);
    }
    if (description !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(description || null);
    }
    if (title !== undefined) {
      updateFields.push('lesson_type = ?');
      updateValues.push(getLessonType(title || 'theory'));
    }
    if (is_active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Нет данных для обновления'
      });
    }

    updateValues.push(id);

    await pool.execute(`
      UPDATE schedules 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    res.json({
      success: true,
      message: 'Групповое занятие успешно обновлено'
    });
  } catch (error) {
    console.error('Error updating one-time group lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении группового занятия'
    });
  }
};
