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

import { SHARED_DIRECTIVES } from '../../../../../../shared/directives';
import { DatosBancariosService } from '@features/rh/services/datos-bancarios.service';
import { DatosBancarios } from '@features/rh/models/rh-auxiliares.model';
import { Banco } from '@features/finanzas/models/banco.model';
import { BancoService } from '@features/finanzas/services/banco.services';
import { ConfirmDialogComponent, DialogData } from '../../../../../../shared/components/feedback/confirm-dialog/confirm-dialog.component';
import { UiAlertComponent, UiAlertData } from '@shared/ui/alert/ui-alert.component';
import { UiButtonComponent } from '@shared/ui/button/ui-button.component';

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
        SHARED_DIRECTIVES,
        UiButtonComponent
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
    private bancoService = inject(BancoService);
    private dialog = inject(MatDialog);

    datosBancarios = signal<DatosBancarios[]>([]);
    showForm = signal<boolean>(false);
    editingId = signal<number | null>(null);
    bancos = signal<Banco[]>([]);

    form: FormGroup = this.fb.group({
        idBanco: [null, Validators.required],
        cuenta: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]{10}$')]],
        clabeInterbancaria: ['', [Validators.required, Validators.minLength(18), Validators.maxLength(18), Validators.pattern('^[0-9]{18}$')]],
        tarjeta: ['', [Validators.minLength(16), Validators.maxLength(16), Validators.pattern('^[0-9]{16}$')]],
        preferida: [false],
        notas: [''],
        tipoVinculo: ['trabajador'],
    });

    constructor() {
        this.bancoService.getBancos().subscribe({
            next: (data) => { this.bancos.set(data) },
            error: () => { }
        });

        effect(() => {
            const id = this.idTrabajador();
            if (id) {
                this.loadDatosBancarios(id);
            }
        });
    }

    loadDatosBancarios(id: number) {
        this.datosBancariosService.getByTrabajador({ idTrabajador: id, tipoVinculo: 'trabajador', idDatoBancario: 0 }).subscribe({
            next: (res) => {
                console.log('Datos bancarios', res);
                const data = res.map((item: any) => ({
                    ...item,
                    preferida: String(item.preferida) === '1'
                }));
                this.datosBancarios.set(data)
            },
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
            vinculo: this.idTrabajador()
        };

        const request = this.editingId()
            ? this.datosBancariosService.update(this.editingId()!, datos)
            : this.datosBancariosService.create(datos);

        return request.pipe(
            tap((res) => {
                debugger
                if (res.exito === 1) {
                    this.loadDatosBancarios(this.idTrabajador());
                    this.cancelEdit();
                } else if (res.exito === 0) {
                    this.dialog.open(UiAlertComponent, {
                        data: {
                            title: 'Advertencia',
                            message: res.mensaje,
                            type: 'warning',
                            confirmText: 'Entendido'
                        } as UiAlertData,
                        width: '400px'
                    });
                } else {
                    console.log('Error al guardar los datos bancarios', res);
                    this.snackBar.open('Error al guardar los datos bancarios', 'Cerrar', { duration: 3000 });
                }
            })
        );
    }

    edit(item: DatosBancarios) {
        this.editingId.set(item.idDatoBancario!);
        this.form.patchValue({
            idBanco: item.idBanco,
            cuenta: item.cuenta,
            clabeInterbancaria: item.clabeInterbancaria,
            tarjeta: item.tarjeta,
            preferida: item.preferida,
            tipoVinculo: item.tipoVinculo,
            vinculo: item.vinculo,
            notas: item.notas
        });
        this.showForm.set(true);
    }

    delete(item: DatosBancarios) {
        const dialogData: DialogData = {
            title: 'Eliminar Cuenta Bancaria',
            message: `¿Estás seguro de eliminar la cuenta ${item.cuenta}?`,
            type: 'delete',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar'
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: dialogData,
            width: '400px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.datosBancariosService.delete(item.idDatoBancario!).subscribe({
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
        });
    }

    cancelEdit() {
        this.showForm.set(false);
        this.editingId.set(null);
        this.form.reset({ preferida: true });
    }

    getBancoNombre(id: number): string {
        return this.bancos().find(b => b.idBanco === id)?.banco || 'Desconocido';
    }
}
