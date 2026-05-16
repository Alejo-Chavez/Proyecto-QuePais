export interface UserProfile {
    id?: string;
    nombre: string;
    apellido: string; 
    edad: number;
}

export interface AuthUser {
    id: string,
    email: string
}