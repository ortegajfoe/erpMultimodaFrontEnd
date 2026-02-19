import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormLayoutComponent } from '../../../../../shared/components/layout/form-layout/form-layout.component';
import { UpperCaseInputDirective } from '@shared/ui';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
    selector: 'app-empresa-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        FormLayoutComponent,
        UpperCaseInputDirective
    ],
    templateUrl: './empresa-form.page.component.html',
    styleUrls: ['./empresa-form.page.component.scss']
})
export class EmpresaFormPageComponent implements OnInit {
    private fb = inject(FormBuilder);
    private empresaService = inject(EmpresaService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    isEditing = signal(false);
    isLoading = signal(false);
    empresaId: number | null = null;

    form = this.fb.group({
        nombre: ['', Validators.required],
        rfc: ['', Validators.required],
        direccion: [''],
        telefono: [''],
        email: ['', [Validators.email]],
        idRegimenFiscal: [null as number | null],
        logoUrl: [''],
        estado: ['Activo'],
        idMoneda: [1],
        idPais: [1],
        idCiudad: [null as number | null],
        cp: [''],
        notas: ['']
    });

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing.set(true);
                this.empresaId = +params['id'];
                this.loadEmpresa(this.empresaId);
            }
        });
    }

    loadEmpresa(id: number) {
        this.isLoading.set(true);
        this.empresaService.getById(id).subscribe({
            next: (response) => {
                const d = response.data;
                this.form.patchValue({
                    nombre: d.nombre,
                    rfc: d.rfc,
                    direccion: d.direccion,
                    telefono: d.telefono,
                    email: d.email,
                    idRegimenFiscal: d.idRegimenFiscal,
                    logoUrl: d.logoUrl,
                    estado: d.estado,
                    idMoneda: d.idMoneda,
                    idPais: d.idPais,
                    idCiudad: d.idCiudad,
                    cp: d.cp,
                    notas: d.notas
                });
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error loading company', 'Close', { duration: 3000 });
                this.router.navigate(['/app/sistema/empresas']);
            }
        });
    }

    save() {
        this.onSubmit();
    }

    cancel() {
        this.onCancel();
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading.set(true);
        const payload = this.form.value as any;

        if (this.isEditing()) {
            this.empresaService.update(this.empresaId!, payload).subscribe({
                next: () => {
                    this.snackBar.open('Empresa actualizada', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/sistema/empresas']);
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
                    this.isLoading.set(false);
                }
            });
        } else {
            this.empresaService.create(payload).subscribe({
                next: () => {
                    this.snackBar.open('Empresa creada', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/sistema/empresas']);
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Error al crear', 'Cerrar', { duration: 3000 });
                    this.isLoading.set(false);
                }
            });
        }
    }

    onCancel() {
        this.router.navigate(['/app/sistema/empresas']);
    }
}
