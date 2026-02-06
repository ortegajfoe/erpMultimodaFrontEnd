import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TrabajadorService } from '../../../services/trabajador.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { PuestoService } from '../../../services/puesto.service';
import { Departamento } from '../../../models/departamento.model';
import { Puesto } from '../../../models/puesto.model';
import { FormLayoutComponent } from '../../../../../shared/components/layout/form-layout/form-layout.component';

import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-trabajador-page',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatTabsModule,
        MatSelectModule,
        MatProgressSpinnerModule,
        FormLayoutComponent
    ],
    templateUrl: './trabajador.page.component.html',
    styleUrls: ['./trabajador.page.component.scss']
})
export class TrabajadorCreatePageComponent implements OnInit {

    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private trabajadorService = inject(TrabajadorService);
    private departamentoService = inject(DepartamentoService);
    private puestoService = inject(PuestoService);
    private snackBar = inject(MatSnackBar);

    loading = signal<boolean>(false);

    selectedTabIndex = 0;
    isEditMode = false;
    workerId: number | null = null;
    pageTitle = 'Nuevo Trabajador';

    apiUrl = environment.apiUrl;

    departamentos: Departamento[] = [];
    puestos: Puesto[] = [];

    form: FormGroup = this.fb.group({
        idTrabajador: [null],
        nombre: ['', Validators.required],
        apPaterno: ['', Validators.required],
        apMaterno: [''],
        fechaNacimiento: [null, Validators.required],
        rfc: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
        curp: ['', [Validators.maxLength(18)]],
        direccion: ['', Validators.required],
        direccion2: [''],
        numExt: ['', Validators.required],
        numInt: [''],
        colonia: ['', Validators.required],
        cp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
        ciudad: [1, Validators.required],
        estado: [1, Validators.required],
        pais: [1, Validators.required],

        nss: ['', Validators.maxLength(11)],
        fechaIngreso: [new Date(), Validators.required],
        idDepartamento: [1, Validators.required],
        idPuesto: [1, Validators.required],
        idNivel: [1, Validators.required],
        salarioMensual: [0, [Validators.required, Validators.min(0)]],
        tipoTrabajador: [1, Validators.required],
        notas: [''],

        idEmpresa: [1],
        userAlta: [1],
        fotoUrl: ['']
    });

    selectedFile: File | null = null;
    photoPreview = signal<string | null>(null);
    currentPhotoUrl: string | null = null;

    ngOnInit() {
        this.loadCatalogos();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.workerId = +params['id'];
                this.pageTitle = 'Editar Trabajador';
                this.loadWorker(this.workerId!);
            }
        });
    }

    loadCatalogos() {
        this.departamentoService.getAll(1).subscribe({
            next: (data) => this.departamentos = data,
            error: (err) => console.error('Error cargando departamentos', err)
        });

        this.puestoService.getAll(1).subscribe({
            next: (data) => this.puestos = data,
            error: (err) => console.error('Error cargando puestos', err)
        });
    }

    onPhotoSelected(event: any) {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];

            if (file.size > 2 * 1024 * 1024) {
                this.snackBar.open('La imagen es demasiado pesada (Máx 2MB)', 'Cerrar', { duration: 3000 });
                return;
            }

            this.selectedFile = file;
            this.form.markAsDirty();

            const reader = new FileReader();

            reader.onload = (e) => {
                this.photoPreview.set(e.target?.result as string);
            };

            reader.readAsDataURL(file);
        }
    }


    loadWorker(id: number) {
        this.loading.set(true);
        this.trabajadorService.getById(id).subscribe({
            next: (worker) => {
                setTimeout(() => {
                    this.loading.set(false);
                    if (worker) {
                        this.form.patchValue(worker);
                        this.currentPhotoUrl = worker.fotoUrl || null;
                    }
                }, 0);
            },
            error: (err) => {
                setTimeout(() => {
                    this.loading.set(false);
                    console.error(err);
                    this.snackBar.open('Error al cargar datos del trabajador', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/rh/trabajadores']);
                }, 0);
            }
        });
    }
    save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.detectErrorTab();
            return;
        }

        this.loading.set(true);
        const formValue = this.form.value;

        const trabajadorRaw = {
            ...formValue,
            ciudad: Number(formValue.ciudad) || 1,
            estado: Number(formValue.estado) || 1,
            pais: Number(formValue.pais) || 1,
            tipoTrabajador: Number(formValue.tipoTrabajador) || 1,
            idDepartamento: Number(formValue.idDepartamento) || 1,
            idPuesto: Number(formValue.idPuesto) || 1,
            idNivel: Number(formValue.idNivel) || 1,
            idEmpresa: Number(formValue.idEmpresa) || 1,
            userAlta: Number(formValue.userAlta) || 1,
            salarioMensual: Number(formValue.salarioMensual) || 0
        };

        let request$: any;

        if (this.selectedFile) {
            const formData = new FormData();
            formData.append('fotoPerfil', this.selectedFile);
            Object.keys(trabajadorRaw).forEach(key => {
                const value = trabajadorRaw[key];
                if (value instanceof Date) {
                    formData.append(key, value.toISOString());
                } else if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            request$ = this.isEditMode && this.workerId
                ? this.trabajadorService.update(this.workerId, formData)
                : this.trabajadorService.insert(formData);
        } else {
            request$ = this.isEditMode && this.workerId
                ? this.trabajadorService.update(this.workerId, trabajadorRaw)
                : this.trabajadorService.insert(trabajadorRaw);
        }

        request$.subscribe({
            next: (res: any) => {
                setTimeout(() => {
                    this.loading.set(false);

                    if (res.exito === 1 || res.status === 'success' || res.data) {
                        const msg = this.isEditMode ? 'Trabajador actualizado correctamente' : 'Trabajador creado correctamente';
                        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                        this.router.navigate(['/app/rh/trabajadores']);
                    } else {
                        this.snackBar.open(`Error: ${res.mensaje || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
                    }
                }, 0);
            },
            error: (err: any) => {
                setTimeout(() => {
                    this.loading.set(false);
                    console.error(err);
                    this.snackBar.open('Error de conexión al guardar', 'Cerrar', { duration: 5000 });
                }, 0);
            }
        });
    }

    cancel() {
        this.router.navigate(['/app/rh/trabajadores']);
    }

    private detectErrorTab() {
        const controls = this.form.controls;

        const personalFields = ['nombre', 'apPaterno', 'apMaterno', 'fechaNacimiento', 'rfc', 'curp'];
        for (const field of personalFields) {
            if (controls[field].invalid) {
                this.selectedTabIndex = 0;
                this.snackBar.open('Error en Datos Personales', 'Ver', { duration: 3000 });
                return;
            }
        }

        const addressFields = ['direccion', 'numExt', 'colonia', 'cp', 'ciudad', 'estado', 'pais'];
        for (const field of addressFields) {
            if (controls[field].invalid) {
                this.selectedTabIndex = 1;
                this.snackBar.open('Error en Domicilio', 'Ver', { duration: 3000 });
                return;
            }
        }

        const workFields = ['nss', 'fechaIngreso', 'salarioMensual', 'idDepartamento', 'idPuesto', 'idNivel', 'tipoTrabajador'];
        for (const field of workFields) {
            if (controls[field].invalid) {
                this.selectedTabIndex = 2;
                this.snackBar.open('Error en Información Laboral', 'Ver', { duration: 3000 });
                return;
            }
        }
    }
}