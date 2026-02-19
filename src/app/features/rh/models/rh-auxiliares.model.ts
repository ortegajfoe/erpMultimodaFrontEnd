export interface DatosBancarios {
    idDatosBancarios?: number;
    idTrabajador?: number; // Backend doesn't show idTrabajador in insert/update, assuming it might be linked or handled differently, but kept as per request
    idBanco: number;
    cuenta: string;
    clabeInterbancaria: string;
    preferida: boolean;
    notas?: string;
    activo?: boolean;
    idEmpresa?: number;
    userAlta?: number;
    userMod?: number;
}

export interface DocumentoTrabajador {
    idDocumentoTrabajador?: number;
    idTrabajador?: number; // Same note as above
    idTipoDocumento?: number; // Backend has 'documento' as varchar(50), seemingly the name directly?
    documento: string; // The file name or type name? Backend input is 'documento' varchar(50)
    fechaExpedicion?: Date | string;
    fechaVence?: Date | string;
    avisoDias?: number;
    notas?: string;
    idEmpresa?: number;
    nombreArchivo?: string;
}

export interface TipoDocumento {
    idTipoDocumento: number;
    nombre: string;
    obligatorio: boolean;
}
