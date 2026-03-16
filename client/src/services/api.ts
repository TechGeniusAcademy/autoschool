import { API_BASE_URL } from '../constants/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description?: string;
  short_description?: string;
  featured_image?: string;
  price: number;
  instructor_id: number;
  category?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  prerequisites?: string;
  learning_outcomes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Дополнительные поля из JOIN
  instructor_name?: string;
  instructor_email?: string;
  lessons_count?: number;
  students_count?: number;
}

export interface GroupSchedule {
  id: number;
  group_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  instructor_name: string;
  instructor_surname: string;
}

export interface IndividualLesson {
  id: number;
  instructor_name: string;
  instructor_surname: string;
  lesson_date: string;
  start_time: string;
  end_time: string;
  location: string;
  subject: string;
  status: string;
}

export interface ScheduleData {
  groupSchedules: GroupSchedule[];
  individualLessons: IndividualLesson[];
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Утилита для работы с токенами
export const TokenStorage = {
  get: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },
  
  set: (token: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  },
  
  remove: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
};

// Утилита для создания заголовков с авторизацией
const getAuthHeaders = (): Record<string, string> => {
  const token = TokenStorage.get();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// API для аутентификации
export const AuthAPI = {
  login: async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при входе');
    }

    return result;
  },

  register: async (data: RegisterData): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при регистрации');
    }

    return result;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении профиля');
    }

    return result;
  },

  verifyToken: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при проверке токена');
    }

    return result;
  },

  updateProfile: async (data: { firstName: string; lastName: string; email: string; phone: string }): Promise<ApiResponse<{ user: User }>> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении профиля');
    }

    return result;
  },

  logout: async (): Promise<void> => {
    TokenStorage.remove();
  }
};

// API для инструкторов
export const InstructorAPI = {
  // Получить всех учеников
  getAllStudents: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/instructor/all-students`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении списка учеников');
    }

    return result;
  },

  // Получить детальную информацию об ученике
  getStudentDetails: async (studentId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/instructor/student/${studentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении информации об ученике');
    }

    return result;
  },

  // Назначить индивидуальное занятие
  scheduleLesson: async (lessonData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/schedules/individual`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при назначении занятия');
    }

    return result;
  },

  // Создать групповое занятие
  createGroupLesson: async (lessonData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/schedules/group-lesson`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании группового занятия');
    }

    return result;
  }
};

// API для администраторов
export const AdminAPI = {
  // Получить всех пользователей
  getAllUsers: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении списка пользователей');
    }

    return result;
  },

  // Получить все курсы
  getAllCourses: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении списка курсов');
    }

    return result;
  },

  // Создать курс
  createCourse: async (courseData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании курса');
    }

    return result;
  },

  // Обновить курс
  updateCourse: async (courseId: number, courseData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении курса');
    }

    return result;
  },

  // Удалить курс
  deleteCourse: async (courseId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении курса');
    }

    return { success: true, message: 'Курс успешно удален' };
  },

  // Получить статистику
  getStats: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении статистики');
    }

    return result;
  },

  // Создать пользователя
  createUser: async (userData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании пользователя');
    }

    return result;
  },

  // Обновить пользователя
  updateUser: async (userId: number, userData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении пользователя');
    }

    return result;
  },

  // Удалить пользователя
  deleteUser: async (userId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при удалении пользователя');
    }

    return result;
  },

  // Получить расписания
  getSchedules: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/schedules`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении расписаний');
    }

    return result;
  },

  // Получить индивидуальные занятия
  getIndividualLessons: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/individual-lessons`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении индивидуальных занятий');
    }

    return result;
  },

  // Получить группы
  getGroups: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/groups`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении групп');
    }

    return result;
  },

  createGroup: async (groupData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании группы');
    }

    return result;
  },

  updateGroup: async (id: number, groupData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(groupData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении группы');
    }

    return result;
  },

  deleteGroup: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении группы');
    }

    return { success: true, message: 'Группа успешно удалена' };
  },

  // Price Categories methods
  getPriceCategories: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-categories`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении категорий цен');
    }

    return result;
  },

  createPriceCategory: async (categoryData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании категории цен');
    }

    return result;
  },

  updatePriceCategory: async (id: number, categoryData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(categoryData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении категории цен');
    }

    return result;
  },

  deletePriceCategory: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении категории цен');
    }

    return { success: true, message: 'Категория цен успешно удалена' };
  },

  // Price Plans methods
  getPricePlans: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-plans`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении тарифных планов');
    }

    return result;
  },

  createPricePlan: async (planData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-plans`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании тарифного плана');
    }

    return result;
  },

  updatePricePlan: async (id: number, planData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(planData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении тарифного плана');
    }

    return result;
  },

  deletePricePlan: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении тарифного плана');
    }

    return { success: true, message: 'Тарифный план успешно удален' };
  },

  // Additional Services methods
  getAdditionalServices: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/additional-services`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении дополнительных услуг');
    }

    return result;
  },

  createAdditionalService: async (serviceData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/additional-services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании дополнительной услуги');
    }

    return result;
  },

  updateAdditionalService: async (id: number, serviceData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/additional-services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении дополнительной услуги');
    }

    return result;
  },

  deleteAdditionalService: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/additional-services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении дополнительной услуги');
    }

    return { success: true, message: 'Дополнительная услуга успешно удалена' };
  },

  // Price Discounts methods
  getPriceDiscounts: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-discounts`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении скидок');
    }

    return result;
  },

  createPriceDiscount: async (discountData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-discounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(discountData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании скидки');
    }

    return result;
  },

  updatePriceDiscount: async (id: number, discountData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-discounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(discountData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении скидки');
    }

    return result;
  },

  deletePriceDiscount: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/price-discounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении скидки');
    }

    return { success: true, message: 'Скидка успешно удалена' };
  },

  // Reports methods
  getReports: async (type: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${type}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении отчетов');
    }

    return result;
  },

  exportReport: async (type: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/${type}/export`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при экспорте отчета');
    }

    // Для экспорта файлов возвращаем blob
    const blob = await response.blob();
    return { success: true, data: blob, message: 'Отчет успешно экспортирован' };
  },

  // Получить инструкторов с полными профилями
  getInstructors: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/instructor/list`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении списка инструкторов');
    }

    return result;
  },

  // Назначить курс студенту
  assignCourseToStudent: async (courseId: number, studentId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/courses/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ courseId, studentId }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при назначении курса студенту');
    }

    return result;
  },

  // Обновить профиль пользователя
  updateUserProfile: async (data: { firstName?: string; lastName?: string; email?: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении профиля');
    }

    return result;
  },

  // Изменить пароль
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при изменении пароля');
    }

    return result;
  }
};

// API для аватарок
export const AvatarAPI = {
  upload: async (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = TokenStorage.get();
    const response = await fetch(`${API_BASE_URL}/avatar/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при загрузке аватарки');
    }

    return result;
  },

  // Методы для работы с расписаниями
  createSchedule: async (scheduleData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/schedules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании расписания');
    }

    return result;
  },

  updateSchedule: async (id: number, scheduleData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/schedules/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheduleData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении расписания');
    }

    return result;
  },

  deleteSchedule: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/schedules/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении расписания');
    }

    return { success: true, message: 'Расписание успешно удалено' };
  },

  // Методы для работы с индивидуальными занятиями
  createIndividualLesson: async (lessonData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/individual-lessons`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при создании индивидуального занятия');
    }

    return result;
  },

  updateIndividualLesson: async (id: number, lessonData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/individual-lessons/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при обновлении индивидуального занятия');
    }

    return result;
  },

  deleteIndividualLesson: async (id: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/admin/individual-lessons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'Ошибка при удалении индивидуального занятия');
    }

    return { success: true, message: 'Индивидуальное занятие успешно удалено' };
  }
};

// API для студентов
export const StudentAPI = {
  // Получить данные для дашборда
  getDashboard: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении данных дашборда');
    }

    return result;
  },

  // Получить предстоящие занятия
  getUpcomingLessons: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/student/upcoming-lessons`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении предстоящих занятий');
    }

    return result;
  },

  // Получить уведомления
  getNotifications: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/student/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении уведомлений');
    }

    return result;
  },

  // Получить курсы студента
  getCourses: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/student/courses`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении курсов');
    }

    return result;
  },

  // Получить расписание студента
  getSchedule: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/schedules/student/schedule`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении расписания');
    }

    return result;
  },

  // Получить группу студента  
  getGroup: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/schedules/student/group`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении группы');
    }

    return result;
  }
};

// Утилита для обработки ошибок аутентификации
export const handleAuthError = (error: any): void => {
  console.error("Authentication error:", error);
  
  // Удаляем токен при ошибках аутентификации
  TokenStorage.remove();
  
  // Перенаправляем на страницу входа для ошибок аутентификации
  if (typeof window !== 'undefined') {
    // Используем window.location для надежного перенаправления
    window.location.href = '/login';
  }
};

// Интерфейсы для контактных сообщений
export interface CreateContactMessageData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  is_read: boolean;
  admin_response?: string;
  responded_at?: string;
  responded_by?: number;
  created_at: string;
  updated_at: string;
}

// API для контактных сообщений
export const ContactAPI = {
  sendMessage: async (data: CreateContactMessageData): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при отправке сообщения');
    }

    return result;
  },

  // Админские методы для управления сообщениями
  getAllMessages: async (params?: { 
    page?: number; 
    limit?: number; 
    filter?: string; 
    search?: string; 
  }): Promise<ApiResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.filter) queryParams.append('filter', params.filter);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(
      `${API_BASE_URL}/contact?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении сообщений');
    }

    return result;
  },

  getStats: async (): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/contact/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при получении статистики');
    }

    return result;
  },

  markAsRead: async (messageId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/contact/${messageId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при отметке сообщения как прочитанного');
    }

    return result;
  },

  respondToMessage: async (messageId: number, adminResponse: string): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/contact/${messageId}/respond`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ admin_response: adminResponse }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при отправке ответа');
    }

    return result;
  },

  deleteMessage: async (messageId: number): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/contact/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при удалении сообщения');
    }

    return result;
  }
};
