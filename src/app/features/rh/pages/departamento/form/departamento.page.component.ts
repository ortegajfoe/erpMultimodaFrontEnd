import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DepartamentoService } from '../../../services/departamento.service';
import { Departamento } from '../../../models/departamento.model';

@Component({
    selector: 'app-departamento-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './departamento.page.component.html',
    styleUrls: ['./departamento.page.component.scss']
})
export class DepartamentoPageComponent {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private departamentoService = inject(DepartamentoService);
    private snackBar = inject(MatSnackBar);

    loading = false;
    isEditMode = false;
    departamentoId: number | null = null;
    pageTitle = 'Nuevo Departamento';

    form: FormGroup = this.fb.group({
        departamento: ['', [Validators.required, Validators.maxLength(100)]],
        notas: ['']
    });

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.departamentoId = +params['id'];
                this.pageTitle = 'Editar Departamento';
                this.loadDepartamento(this.departamentoId);
            }
        });
    }

    loadDepartamento(id: number) {
        this.loading = true;
        this.departamentoService.getById(id).subscribe({
            next: (dept) => {
                this.loading = false;
                if (dept) {
                    this.form.patchValue(dept);
                }
            },
            error: (err) => {
                this.loading = false;
                console.error(err);
                this.snackBar.open('Error al cargar departamento', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/app/rh/departamentos']);
            }
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading = true;
        const departamento: Departamento = this.form.value;

        const request$ = this.isEditMode && this.departamentoId
            ? this.departamentoService.update(this.departamentoId, departamento)
            : this.departamentoService.insert(departamento);

        request$.subscribe({
            next: (res) => {
                this.loading = false;
                if (res.exito === 1) {
                    const msg = this.isEditMode ? 'Departamento actualizado' : 'Departamento creado';
                    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/rh/departamentos']);
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
        this.router.navigate(['/app/rh/departamentos']);
    }
}
