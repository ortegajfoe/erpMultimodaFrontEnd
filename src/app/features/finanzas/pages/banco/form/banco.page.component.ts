import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormLayoutComponent } from '../../../../../shared/components/layout/form-layout/form-layout.component';
import { SHARED_DIRECTIVES } from '../../../../../shared/directives';
import { BancoService } from '../../../services/banco.services';

@Component({
    selector: 'app-banco-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatSnackBarModule,
        FormLayoutComponent,
        SHARED_DIRECTIVES
    ],
    templateUrl: './banco.page.component.html'
})
export class BancoPageComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private bancoService = inject(BancoService);
    private snackBar = inject(MatSnackBar);

    loading = signal<boolean>(false);
    id = signal<number | null>(null);

    isEditMode = false;
    bancoId: number | null = null;
    pageTitle = 'Nuevo Banco';

    form: FormGroup = this.fb.group({
        idBanco: [null],
        banco: ['', Validators.required],
        notas: ['']
    });

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.bancoId = +params['id'];
                this.id.set(this.bancoId);
                this.pageTitle = 'Editar Banco';
                this.loadBanco(this.bancoId!);
            }
        });
    }

    loadBanco(id: number) {
        this.loading.set(true);
        this.bancoService.getById(id).subscribe({
            next: (banco) => {
                this.loading.set(false);
                if (banco) {
                    console.log('banco', banco)
                    this.form.patchValue(banco);
                }
            },
            error: (err) => {
                this.loading.set(false);
                console.error(err);
                this.snackBar.open('Error al cargar datos del banco', 'Cerrar', { duration: 3000 });
                this.router.navigate(['/app/finanzas/bancos']);
            }
        });
    }

    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        const bancoRaw = this.form.value;

        const request$ = this.isEditMode && this.bancoId
            ? this.bancoService.update(this.bancoId, bancoRaw)
            : this.bancoService.create(bancoRaw);

        request$.subscribe({
            next: (res: any) => {
                this.loading.set(false);
                if (res.exito === 1 || res.status === 'success' || res.data) {
                    const msg = this.isEditMode ? 'Banco actualizado correctamente' : 'Banco creado correctamente';
                    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                    if (!this.isEditMode) {
                        this.router.navigate(['/app/finanzas/bancos']);
                    }
                } else {
                    this.snackBar.open(`Error: ${res.mensaje || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
                }
            },
            error: (err: any) => {
                this.loading.set(false);
                console.error(err);
                this.snackBar.open('Error al guardar banco', 'Cerrar', { duration: 5000 });
            }
        });
    }

    cancel() {
        this.router.navigate(['/app/finanzas/bancos']);
    }
}
