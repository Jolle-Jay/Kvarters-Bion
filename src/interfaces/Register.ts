import type { UserData, AuthResponse } from './Authentication';

export interface RegisterFormData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export type { UserData, AuthResponse };