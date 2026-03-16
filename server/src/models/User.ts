export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password_hash: string;
  avatar_url?: string;
  role: 'student' | 'instructor' | 'admin';
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'student' | 'instructor' | 'admin';
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserSession {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  is_active: boolean;
}

export interface LoginAttempt {
  id: number;
  email: string;
  ip_address: string;
  success: boolean;
  attempted_at: Date;
}
