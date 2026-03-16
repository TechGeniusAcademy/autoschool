import { API_BASE_URL } from '../constants/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string;
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

  // Назначить занятие
  scheduleLesson: async (lessonData: any): Promise<ApiResponse> => {
    const response = await fetch(`${API_BASE_URL}/instructor/schedule-lesson`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lessonData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Ошибка при назначении занятия');
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
  }
};

// API для аватарок
export const AvatarAPI = {
  upload: async (file: File): Promise<ApiResponse<{ avatar_url: string }>> => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = TokenStorage.get();
    const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
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
