import { Component, inject, input, signal, effect, ElementRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';

import { SHARED_DIRECTIVES } from '../../../../../../shared/directives';
import { DocumentoTrabajadorService } from '../../../../services/documento-trabajador.service';
import { DocumentoTrabajador, TipoDocumento } from '../../../../models/rh-auxiliares.model';

@Component({
    selector: 'app-trabajador-documentos',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatTableModule,
        DatePipe,
        SHARED_DIRECTIVES
    ],
    templateUrl: './trabajador-documentos.component.html',
    styles: [`
    .expired {
      color: #f44336;
      font-weight: bold;
    }
    .warning {
      color: #ff9800;
      font-weight: bold;
    }
    .valid {
      color: #4caf50;
    }
  `]
})
export class TrabajadorDocumentosComponent {
    idTrabajador = input.required<number>();

    private documentoService = inject(DocumentoTrabajadorService);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);

    @ViewChild('fileInput') fileInput!: ElementRef;

    documentos = signal<DocumentoTrabajador[]>([]);
    tiposDocumento = signal<TipoDocumento[]>([]);
    selectedFile: File | null = null;
    loading = signal<boolean>(false);

    displayedColumns: string[] = ['tipo', 'nombreArchivo', 'fechaVence', 'acciones'];

    form: FormGroup = this.fb.group({
        idTipoDocumento: [null, Validators.required],
        file: [null, Validators.required],
        fechaVence: [null],
        avisoDias: [null],
        notas: ['']
    });

    constructor() {
        effect(() => {
            const id = this.idTrabajador();
            if (id) {
                this.loadDocumentos(id);
            }
        });

        this.loadTiposDocumento();
    }

    loadDocumentos(id: number) {
        this.documentoService.getByTrabajador(id).subscribe({
            next: (data) => this.documentos.set(data),
            error: (err) => console.error('Error cargando documentos', err)
        });
    }

    loadTiposDocumento() {
        this.documentoService.getTiposDocumento().subscribe({
            next: (data) => this.tiposDocumento.set(data)
        });
    }

    onFileSelected(event: any) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            this.selectedFile = file;
            this.form.patchValue({ file: file.name });
        }
    }

    upload(): Observable<any> | null {
        if (this.form.invalid || !this.selectedFile) {
            this.form.markAllAsTouched();
            return null;
        }

        this.loading.set(true);
        const formValue = this.form.value;
        const formData = new FormData();

        formData.append('idTrabajador', this.idTrabajador().toString());
        formData.append('archivo', this.selectedFile);
        formData.append('idTipoDocumento', formValue.idTipoDocumento);
        formData.append('documento', this.getNombreTipoDocumento(formValue.idTipoDocumento));

        if (formValue.fechaVence) {
            formData.append('fechaVence', formValue.fechaVence.toISOString());
        }
        if (formValue.avisoDias) {
            formData.append('avisoDias', formValue.avisoDias.toString());
        }
        if (formValue.notas) {
            formData.append('notas', formValue.notas);
        }

        formData.append('idEmpresa', '1');
        formData.append('userAlta', '1');


        return this.documentoService.upload(formData).pipe(
            tap((res) => {
                this.loading.set(false);
                if (res.exito === 1) {
                    this.loadDocumentos(this.idTrabajador());
                    this.resetForm();
                }
            })
        );
    }

    delete(doc: DocumentoTrabajador) {
        if (confirm('¿Estás seguro de eliminar este documento?')) {
            this.documentoService.delete(doc.idDocumentoTrabajador!).subscribe({
                next: (res) => {
                    if (res.exito === 1) {
                        this.snackBar.open('Documento eliminado', 'Cerrar', { duration: 3000 });
                        this.loadDocumentos(this.idTrabajador());
                    } else {
                        this.snackBar.open(`Error: ${res.mensaje}`, 'Cerrar', { duration: 3000 });
                    }
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
                }
            });
        }
    }

    resetForm() {
        this.form.reset();
        this.selectedFile = null;
        if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
    }

    getNombreTipoDocumento(id: number): string {
        return this.tiposDocumento().find(t => t.idTipoDocumento === id)?.nombre || '';
    }

    getExpirationStatus(fechaVence: Date | string | undefined): string {
        if (!fechaVence) return '';
        const today = new Date();
        const expiry = new Date(fechaVence);

        if (expiry < today) {
            return 'expired';
        }

        const diffTime = Math.abs(expiry.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 30) {
            return 'warning';
        }

        return 'valid';
    }
}
