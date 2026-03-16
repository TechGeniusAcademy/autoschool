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
    const response = await fetch(`${API_BASE_URL}/schedules`, {
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
