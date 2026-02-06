export interface Departamento {
    idDepartamento?: number;
    departamento: string;
    notas?: string;
    idEmpresa?: number;
    userAlta?: number;
    userMod?: number;
    fechaAlta?: Date;
    fechaMod?: Date;
}

export interface DepartamentoResponse {
    exito: number;
    mensaje: string;
    dato: number;
}
