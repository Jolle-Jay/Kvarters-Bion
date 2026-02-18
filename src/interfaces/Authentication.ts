export interface UserData {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  error?: string;
  user?: UserData;
  token?: string;
}