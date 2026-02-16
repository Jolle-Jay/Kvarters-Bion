export interface UserData {
    name: string;
    email: string;
}

export interface RegisterFormData {
    email: string;
    password: string;
    name: string;
    lastName: string;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    user?: UserData;
    token?: string;
}