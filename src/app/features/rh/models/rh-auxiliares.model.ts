export interface DatosBancarios {
    idDatoBancario?: number;
    idTrabajador?: number; // Backend doesn't show idTrabajador in insert/update, assuming it might be linked or handled differently, but kept as per request
    idBanco: number;
    cuenta: string;
    clabeInterbancaria: string;
    tarjeta: string;
    preferida: boolean;
    notas?: string;
    activo?: boolean;
    idEmpresa?: number;
    userAlta?: number;
    userMod?: number;
    tipoVinculo: string;
    vinculo: number;
}

export interface DocumentoTrabajador {
    idDocumentoTrabajador?: number;
    idTrabajador?: number;
    idTipoDocumento?: number;
    documento: string;
    fechaExpedicion?: Date | string;
    fechaVence?: Date | string;
    avisoDias?: number;
    notas?: string;
    idEmpresa?: number;
    nombreArchivo?: string;
    contentType?: string;
}

export interface TipoDocumento {
    idTipoDocumento: number;
    nombre: string;
    obligatorio: boolean;
}
