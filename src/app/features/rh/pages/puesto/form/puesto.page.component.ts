import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PuestoService } from '../../../services/puesto.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { Puesto } from '../../../models/puesto.model';
import { Departamento } from '../../../models/departamento.model';

@Component({
    selector: 'app-puesto-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './puesto.page.component.html',
    styleUrls: ['./puesto.page.component.scss']
})
export class PuestoPageComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private puestoService = inject(PuestoService);
    private departamentoService = inject(DepartamentoService);
    private snackBar = inject(MatSnackBar);

    loading = false;
    isEditMode = false;
    puestoId: number | null = null;
    pageTitle = 'Nuevo Puesto';

    departamentos: Departamento[] = [];

    form: FormGroup = this.fb.group({
        puesto: ['', [Validators.required, Validators.maxLength(100)]],
        idDepartamento: [1, Validators.required],
        notas: ['']
    });

    ngOnInit() {
        this.loadCatalogos();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.puestoId = +params['id'];
                this.pageTitle = 'Editar Puesto';
                this.loadPuesto(this.puestoId);
            }
        });
    }

    loadCatalogos() {
        this.departamentoService.getAll(1).subscribe({
            next: (data) => this.departamentos = data,
            error: (err) => console.error('Error cargando departamentos', err)
        });
    }

    loadPuesto(id: number) {
        this.loading = true;
        this.puestoService.getById(id).subscribe({
            next: (data) => {
                this.loading = false;
                if (data) {
                    this.form.patchValue(data);
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.snackBar.open('Error al cargar puesto', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/app/rh/puestos']);
            }
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        const formValue = this.form.value;

        const puesto: Puesto = {
            ...formValue,
            idDepartamento: Number(formValue.idDepartamento) || 1
        };

        const request$ = this.isEditMode && this.puestoId
            ? this.puestoService.update(this.puestoId, puesto)
            : this.puestoService.insert(puesto);

        request$.subscribe({
            next: (res) => {
                this.loading = false;
                if (res.exito === 1) {
                    const msg = this.isEditMode ? 'Puesto actualizado' : 'Puesto creado';
                    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/rh/puestos']);
                } else {
                    this.snackBar.open(`Error: ${res.mensaje}`, 'Cerrar', { duration: 5000 });
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.snackBar.open('Error de conexión al guardar', 'Cerrar', { duration: 5000 });
            }
        });
    }

    cancel() {
        this.router.navigate(['/app/rh/puestos']);
    }
}
