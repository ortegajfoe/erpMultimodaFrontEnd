import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


export interface VisorDocumentoDialogData {
    url: string;
    nombre?: string;
}

@Component({
    selector: 'app-visor-documento-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    template: `
        <div class="flex flex-col h-full" style="height: 85vh;">
            <div class="flex items-center justify-between px-4 py-3 bg-gray-900 text-white flex-shrink-0">
                <div class="flex items-center gap-2">
                    @if (isImage()) {
                        <mat-icon>image</mat-icon>
                    } @else {
                        <mat-icon>picture_as_pdf</mat-icon>
                    }
                    <h2 class="text-base font-semibold m-0">{{ data.nombre || 'Visualizador de Documento' }}</h2>
                </div>
                <button mat-icon-button mat-dialog-close class="text-white hover:text-gray-300">
                    <mat-icon>close</mat-icon>
                </button>
            </div>

            <div class="flex-grow overflow-hidden bg-gray-100 relative">
                @if (loading()) {
                    <div class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white">
                        <mat-spinner diameter="48"></mat-spinner>
                        <p class="text-gray-500 text-sm">Cargando documento...</p>
                    </div>
                } @else if (error()) {
                    <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-red-600">
                        <mat-icon style="font-size: 48px; width:48px; height:48px;">error_outline</mat-icon>
                        <p class="font-medium">No se pudo cargar el documento</p>
                        <p class="text-sm text-gray-500">{{ error() }}</p>
                    </div>
                } @else if (pdfUrl()) {
                    @if (isImage()) {
                        <div class="w-full h-full flex items-center justify-center p-4 bg-gray-200">
                            <img [src]="pdfUrl()!" class="max-w-full max-h-full object-contain shadow-md" alt="Documento">
                        </div>
                    } @else {
                        <iframe
                            [src]="pdfUrl()!"
                            class="w-full h-full border-0"
                            type="application/pdf">
                        </iframe>
                    }
                }
            </div>
        </div>
    `,
    styles: [`:host { display: flex; flex-direction: column; height: 100%; }`]
})
export class VisorDocumentoDialogComponent implements OnInit, OnDestroy {
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);
    readonly dialogRef = inject(MatDialogRef<VisorDocumentoDialogComponent>);
    readonly data = inject<VisorDocumentoDialogData>(MAT_DIALOG_DATA);

    loading = signal<boolean>(true);
    error = signal<string | null>(null);
    pdfUrl = signal<SafeResourceUrl | null>(null);
    isImage = signal<boolean>(false);

    private objectUrl: string | null = null;

    ngOnInit() {
        debugger;

        this.http.get(this.data.url, { responseType: 'blob' }).subscribe({
            next: (blob) => {
                debugger;
                const isImg = blob.type.startsWith('image/');
                this.isImage.set(isImg);

                this.objectUrl = URL.createObjectURL(blob);
                this.pdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl));
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(err?.message || 'Error desconocido al cargar el archivo');
                this.loading.set(false);
            }
        });
    }

    ngOnDestroy() {
        if (this.objectUrl) {
            URL.revokeObjectURL(this.objectUrl);
        }
    }
}
