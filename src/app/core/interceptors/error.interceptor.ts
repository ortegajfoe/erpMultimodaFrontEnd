import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { DialogService } from '../services/dialog.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const dialogService = inject(DialogService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Ocurrió un error inesperado.';

            // Prioritize error messages based on status code
            switch (error.status) {
                case 0:
                    errorMessage = 'No hay conexión con el servidor';
                    break;
                case 401:
                    errorMessage = 'Tu sesión ha expirado.';
                    break;
                case 403:
                    errorMessage = 'No tienes permisos para realizar esta acción.';
                    break;
                case 404:
                    errorMessage = 'Recurso no encontrado.';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor. Intenta más tarde.';
                    break;
                default:
                    errorMessage = error.error?.message || error.message || errorMessage;
                    break;
            }

            dialogService.showWarning('Error', errorMessage);
            return throwError(() => error);
        })
    );
};
