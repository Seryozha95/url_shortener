export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  passwordConfirm: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  data?: {
    user: User;
    token: string;
  };
  message?: string;
} 