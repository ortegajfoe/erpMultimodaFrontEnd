export interface Pais {
    idPais: number;
    pais: string;
}

export interface Estado {
    idEstado: number;
    Estado: string;
}

export interface Ciudad {
    idCiudad: number;
    Ciudad: string;
}

export interface CodigoPostalResult {
    idCodigoPostal: number;
    codigo: string;
    colonia: string;
    estado: string;
    municipio: string;
    ciudad: string;
    idPais: number;
    idEstado: number;
    idMunicipio: number;
    idCiudad: number;
}
