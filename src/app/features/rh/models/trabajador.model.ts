export interface Trabajador {
    idTrabajador?: number;
    apPaterno: string;
    apMaterno: string;
    nombre: string;
    fechaNacimiento: Date;
    rfc: string;
    curp: string;
    direccion: string;
    direccion2?: string;
    numExt: string;
    numInt?: string;
    colonia: string;
    cp: string;
    ciudad: string;
    estado: string;
    pais: string;
    nss: string;
    fechaIngreso: Date;
    idDepartamento: number;
    idPuesto: number;
    idNivel: number;
    salarioMensual: number;
    tipoTrabajador: string;
    notas?: string;
    idEmpresa: number;
    userAlta: number;
    fotoUrl?: string;
}

export interface TrabajadorResponse {
    exito: number;
    mensaje: string;
    dato: number;
}
