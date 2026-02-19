import { Component, inject, input, signal, effect } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { SHARED_DIRECTIVES } from '../../../../../../shared/directives'; // Absolute relative path
import { DatosBancariosService } from '../../../../services/datos-bancarios.service';
import { DatosBancarios } from '../../../../models/rh-auxiliares.model';

@Component({
    selector: 'app-trabajador-bancos',
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
        MatSlideToggleModule,
        MatDialogModule,
        MatTooltipModule,
        SHARED_DIRECTIVES
    ],
    templateUrl: './trabajador-bancos.component.html',
    styles: [`
    .bank-card {
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
    }
    .bank-card.active {
      border-left-color: #4caf50;
      background-color: #f1f8e9;
    }
    .bank-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
  `]
})
export class TrabajadorBancosComponent {
    idTrabajador = input.required<number>();

    private datosBancariosService = inject(DatosBancariosService);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);

    datosBancarios = signal<DatosBancarios[]>([]);
    showForm = signal<boolean>(false);
    editingId = signal<number | null>(null);

    bancos = [
        { id: 1, nombre: 'BBVA' },
        { id: 2, nombre: 'Santander' },
        { id: 3, nombre: 'Banamex' },
        { id: 4, nombre: 'Banorte' },
        { id: 5, nombre: 'HSBC' },
        { id: 6, nombre: 'Scotiabank' },
        { id: 7, nombre: 'Inbursa' },
        { id: 8, nombre: 'Banco Azteca' }
    ];

    form: FormGroup = this.fb.group({
        idBanco: [null, Validators.required],
        cuenta: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]],
        clabeInterbancaria: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18), Validators.pattern('^[0-9]{18}$')]],
        preferida: [true],
        notas: ['']
    });

    constructor() {
        effect(() => {
            const id = this.idTrabajador();
            if (id) {
                this.loadDatosBancarios(id);
            }
        });
    }

    loadDatosBancarios(id: number) {
        this.datosBancariosService.getByTrabajador(id).subscribe({
            next: (data) => this.datosBancarios.set(data),
            error: (err) => console.error('Error cargando datos bancarios', err)
        });
    }

    toggleForm() {
        this.showForm.update(v => !v);
        if (!this.showForm()) {
            this.cancelEdit();
        }
    }

    save(): Observable<any> | null {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return null;
        }

        const formValue = this.form.value;
        const datos: DatosBancarios = {
            ...formValue,
            idTrabajador: this.idTrabajador(),
            idBanco: Number(formValue.idBanco)
        };

        const request$ = this.editingId()
            ? this.datosBancariosService.update(this.editingId()!, datos)
            : this.datosBancariosService.create(datos);

        return request$.pipe(
            tap((res) => {
                if (res.exito === 1) {
                    this.loadDatosBancarios(this.idTrabajador());
                    this.cancelEdit();
                }
            })
        );
    }

    edit(item: DatosBancarios) {
        this.editingId.set(item.idDatosBancarios!);
        this.form.patchValue({
            idBanco: item.idBanco,
            cuenta: item.cuenta,
            clabeInterbancaria: item.clabeInterbancaria,
            preferida: item.preferida,
            notas: item.notas
        });
        this.showForm.set(true);
    }

    delete(item: DatosBancarios) {
        if (confirm('¿Estás seguro de eliminar esta cuenta?')) {
            this.datosBancariosService.delete(item.idDatosBancarios!).subscribe({
                next: (res) => {
                    if (res.exito === 1) {
                        this.snackBar.open('Cuenta eliminada', 'Cerrar', { duration: 3000 });
                        this.loadDatosBancarios(this.idTrabajador());
                    }
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
                }
            });
        }
    }

    cancelEdit() {
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset({ preferida: true });
    }

    getBancoNombre(id: number): string {
        return this.bancos.find(b => b.id === id)?.nombre || 'Desconocido';
    }
}
