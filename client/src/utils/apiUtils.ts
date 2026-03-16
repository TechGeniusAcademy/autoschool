import { TokenStorage } from '../services/api';
import { API_BASE_URL } from '../constants/api';

// Централизованная функция для API запросов с правильной обработкой токенов
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = TokenStorage.get();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Если ошибка аутентификации, перенаправляем на логин
      if (response.status === 401) {
        TokenStorage.remove();
        window.location.href = '/login';
        return;
      }
      
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Специализированные функции для различных типов запросов
export const studentAPI = {
  // Проверка аутентификации студента
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await apiRequest('/auth/verify');
      return response.success && response.data?.user?.role === 'student';
    } catch (error) {
      return false;
    }
  },

  // Получение расписания студента
  getSchedule: async () => {
    return apiRequest('/schedules/student/schedule');
  },

  // Получение группы студента
  getGroup: async () => {
    return apiRequest('/schedules/student/group');
  },

  // Получение расписания группы студента
  getGroupSchedule: async () => {
    return apiRequest('/schedules/student/group-schedule');
  },
};

// Утилиты для проверки аутентификации
export const authUtils = {
  // Проверка и перенаправление при необходимости
  requireAuth: async (requiredRole?: string): Promise<boolean> => {
    const token = TokenStorage.get();
    if (!token) {
      window.location.href = '/login';
      return false;
    }

    try {
      const response = await apiRequest('/auth/verify');
      if (!response.success || !response.data?.user) {
        TokenStorage.remove();
        window.location.href = '/login';
        return false;
      }

      if (requiredRole && response.data.user.role !== requiredRole) {
        window.location.href = '/access-denied';
        return false;
      }

      return true;
    } catch (error) {
      TokenStorage.remove();
      window.location.href = '/login';
      return false;
    }
  },

  // Проверка админских прав
  requireAdmin: async (): Promise<boolean> => {
    return authUtils.requireAuth('admin');
  },

  // Получение текущего пользователя
  getCurrentUser: async () => {
    try {
      const response = await apiRequest('/auth/verify');
      return response.success ? response.data.user : null;
    } catch (error) {
      return null;
    }
  },
};

// API для админских операций
export const adminAPI = {
  // Проверка админских прав
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await apiRequest('/auth/verify');
      return response.success && response.data?.user?.role === 'admin';
    } catch (error) {
      return false;
    }
  },

  // Получение всех расписаний
  getAllSchedules: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/schedules${query}`);
  },

  // Создание расписания
  createSchedule: async (scheduleData: any) => {
    return apiRequest('/schedules', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  },

  // Обновление расписания
  updateSchedule: async (id: number, scheduleData: any) => {
    return apiRequest(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  },

  // Удаление расписания
  deleteSchedule: async (id: number) => {
    return apiRequest(`/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  // Получение всех групп
  getAllGroups: async () => {
    return apiRequest('/groups');
  },

  // Создание группы
  createGroup: async (groupData: any) => {
    return apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  },

  // Обновление группы
  updateGroup: async (id: number, groupData: any) => {
    return apiRequest(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
  },

  // Удаление группы
  deleteGroup: async (id: number) => {
    return apiRequest(`/groups/${id}`, {
      method: 'DELETE',
    });
  },

  // Получение индивидуальных занятий
  getIndividualLessons: async (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/schedules/individual${query}`);
  },

  // Создание индивидуального занятия
  createIndividualLesson: async (lessonData: any) => {
    return apiRequest('/schedules/individual', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  },

  // Обновление статуса индивидуального занятия
  updateIndividualLessonStatus: async (id: number, status: string) => {
    return apiRequest(`/schedules/individual/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};
