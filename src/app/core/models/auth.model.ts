export interface User {
    idUsuario: number;
    usuario: string;
    idEmpresa?: number;
    idRol?: number;
    idTrabajador?: number;
    [key: string]: any;
}

export interface AuthResponse {
    exito: number;
    data: {
        token: string;
        refreshToken?: string;
        [key: string]: any;
    };
}
