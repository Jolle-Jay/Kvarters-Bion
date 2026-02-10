export interface UserData {
  name: string;
  email: string;
}

export interface LoginFormData {
  email: string;
  password: string;

}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserData;
  token?: string;
}