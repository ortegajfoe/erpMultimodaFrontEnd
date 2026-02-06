import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService } from '../../../services/usuario.service';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
    selector: 'app-usuario-form',
    // ... imports remain the same
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatCardModule,
        MatIconModule,
        MatSnackBarModule
    ],
    templateUrl: './usuario-form.page.component.html',
    styleUrls: ['./usuario-form.page.component.scss']
})
export class UsuarioFormPageComponent implements OnInit {
    private fb = inject(FormBuilder);
    private usuarioService = inject(UsuarioService);
    private empresaService = inject(EmpresaService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private snackBar = inject(MatSnackBar);

    isEditing = signal(false);
    isLoading = signal(false);
    usuarioId: number | null = null;
    hidePassword = signal(true);

    // Mocks for dropdowns as requested
    roles = [{ id: 1, nombre: 'Admin' }, { id: 2, nombre: 'Usuario' }];
    trabajadores = [{ id: 1, nombre: 'Juan Perez' }, { id: 2, nombre: 'Maria Lopez' }];
    empresas: any[] = []; // Array to hold companies

    form = this.fb.group({
        usuario: ['', Validators.required],
        passw: [''],
        notas: [''],
        idRol: [1, Validators.required],
        idTrabajador: [1, Validators.required],
        idEmpresa: [null as number | null, Validators.required] // Required now
    });

    ngOnInit() {
        this.loadEmpresas();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing.set(true);
                this.usuarioId = +params['id'];
                this.loadUsuario(this.usuarioId);
            } else {
                // New User: Password required
                this.form.controls.passw.setValidators([Validators.required]);
                this.form.controls.passw.updateValueAndValidity();
            }
        });
    }

    loadEmpresas() {
        this.empresaService.getAll().subscribe({
            next: (res) => {
                this.empresas = res.data;
            },
            error: (err) => console.error('Error loading companies', err)
        });
    }

    loadUsuario(id: number) {
        this.isLoading.set(true);
        this.usuarioService.getById(id).subscribe({
            next: (response) => {
                const u = response.data;
                this.form.patchValue({
                    usuario: u.usuario,
                    notas: u.notas,
                    idRol: u.idRol,
                    idTrabajador: u.idTrabajador,
                    idEmpresa: u.idEmpresa
                });
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.snackBar.open('Error al cargar usuario', 'Cerrar', { duration: 3000 });
                this.isLoading.set(false);
                this.router.navigate(['/app/sistema/usuarios']);
            }
        });
    }

    togglePassword(event: Event) {
        event.preventDefault();
        this.hidePassword.update(val => !val);
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.isLoading.set(true);
        const formData: any = this.form.value;

        // Adjust payload: userAlta/userMod will be handled by backend from token ideally,
        // but service expects them in body if not handled.
        // Controller we wrote uses req.user or body.
        // We will send basic data.

        const payload = {
            ...formData,
            userAlta: 1, // Fallback
            userMod: 1   // Fallback
        };

        if (this.isEditing()) {
            this.usuarioService.update(this.usuarioId!, payload).subscribe({
                next: () => {
                    this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/sistema/usuarios']);
                },
                error: (err) => {
                    console.error(err);
                    this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 3000 });
                    this.isLoading.set(false);
                }
            });
        } else {
            this.usuarioService.create(payload).subscribe({
                next: () => {
                    this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/sistema/usuarios']);
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
        this.router.navigate(['/app/sistema/usuarios']);
    }
}
