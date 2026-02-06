export interface Puesto {
    idPuesto?: number;
    puesto: string;
    idDepartamento: number;
    notas?: string;
    idEmpresa?: number;
    userAlta?: number;
    userMod?: number;
    fechaAlta?: Date;
    fechaMod?: Date;
}

export interface PuestoResponse {
    exito: number;
    mensaje: string;
    dato: number;
}
