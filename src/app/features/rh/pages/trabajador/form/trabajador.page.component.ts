import { Component, inject, signal, OnInit, ViewChild, computed } from '@angular/core';
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { TrabajadorService } from '../../../services/trabajador.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { PuestoService } from '../../../services/puesto.service';
import { NivelService } from '../../../services/nivel.service';
import { TipoTrabajadorService } from '../../../services/tipo-trabajador.service';
import { Departamento } from '../../../models/departamento.model';
import { Puesto } from '../../../models/puesto.model';
import { Nivel, TipoTrabajador } from '../../../models/rh-catalogos.model';
import { Pais, Estado, Ciudad, CodigoPostalResult } from '@core/master-data/geografia/geografia.model';
import { FormLayoutComponent } from '../../../../../shared/components/layout/form-layout/form-layout.component';
import { MxValidators } from '@shared/ui';
import { SHARED_DIRECTIVES } from '../../../../../shared/directives';
import { TrabajadorBancosComponent } from '../components/bancos/trabajador-bancos.component';
import { TrabajadorDocumentosComponent } from '../components/documentos/trabajador-documentos.component';

import { environment } from 'src/environments/environment';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { Subject, of } from 'rxjs';
import { GeografiaService } from '@core/master-data/geografia/geografia.service';

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
        MatAutocompleteModule,
        FormLayoutComponent,
        SHARED_DIRECTIVES,
        TrabajadorBancosComponent,
        TrabajadorDocumentosComponent
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
    private nivelService = inject(NivelService);
    private tipoTrabajadorService = inject(TipoTrabajadorService);
    private geografiaService = inject(GeografiaService);
    private snackBar = inject(MatSnackBar);

    loading = signal<boolean>(false);
    loadingCp = signal<boolean>(false);
    id = signal<number | null>(null);

    selectedTabIndex = 0;
    isEditMode = false;
    workerId: number | null = null;
    pageTitle = 'Nuevo Trabajador';

    apiUrl = environment.apiUrl;

    departamentos = signal<Departamento[]>([]);
    puestos = signal<Puesto[]>([]);
    niveles = signal<Nivel[]>([]);
    tiposTrabajador = signal<TipoTrabajador[]>([]);

    selectedDepartamentoId = signal<number | null>(null);

    puestosFiltrados = computed(() => {
        const idDep = this.selectedDepartamentoId();
        if (!idDep) return this.puestos();
        return this.puestos().filter(p => p.idDepartamento === idDep);
    });

    paises = this.geografiaService.paises;
    estados = this.geografiaService.estados;
    ciudades = this.geografiaService.ciudades;
    colonias = signal<CodigoPostalResult[]>([]);
    @ViewChild(TrabajadorBancosComponent) bancosComponent!: TrabajadorBancosComponent;
    @ViewChild(TrabajadorDocumentosComponent) documentosComponent!: TrabajadorDocumentosComponent;
    private cpSearch = new Subject<string>();

    form: FormGroup = this.fb.group({
        idTrabajador: [null],
        nombre: ['', Validators.required],
        apPaterno: ['', Validators.required],
        apMaterno: [''],
        fechaNacimiento: [null, Validators.required],
        rfc: ['', [Validators.required, Validators.maxLength(13), MxValidators.rfc]],
        curp: ['', [Validators.required, MxValidators.curp, Validators.maxLength(18)]],
        direccion: ['', Validators.required],
        direccion2: [''],
        numExt: ['', [Validators.required, Validators.maxLength(5)]],
        numInt: [''],
        colonia: ['', Validators.required],
        cp: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
        ciudad: [null, Validators.required],
        estado: [null, Validators.required],
        pais: [null, Validators.required],

        nss: ['', [Validators.required, Validators.maxLength(11), Validators.minLength(11)]],
        fechaIngreso: [new Date(), Validators.required],
        idDepartamento: [1, Validators.required],
        idPuesto: [1, Validators.required],
        idNivel: [1, Validators.required],
        salarioMensual: [0, [Validators.required, Validators.min(0)]],
        tipoTrabajador: [1, Validators.required],
        notas: [''],
        fotoUrl: ['']
    });

    selectedFile: File | null = null;
    photoPreview = signal<string | null>(null);
    currentPhotoUrl: string | null = null;

    ngOnInit() {
        this.loadCatalogos();
        this.setupCpAutofill();
        this.setupUbicacionCascade();
        this.listDepartamento();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditMode = true;
                this.workerId = +params['id'];
                this.id.set(this.workerId);
                this.pageTitle = 'Editar Trabajador';
                this.loadWorker(this.workerId!);
            }
        });
    }

    private listDepartamento() {
        const current = this.form.get('idDepartamento')?.value;
        if (current) this.selectedDepartamentoId.set(Number(current));

        this.form.get('idDepartamento')!.valueChanges.pipe(
            distinctUntilChanged()
        ).subscribe(idDep => {
            this.selectedDepartamentoId.set(idDep ? Number(idDep) : null);
            const currentPuesto = this.form.get('idPuesto')?.value;
            const puestoValido = this.puestos().some(
                p => p.idPuesto === Number(currentPuesto) && p.idDepartamento === Number(idDep)
            );
            if (!puestoValido) {
                this.form.patchValue({ idPuesto: null }, { emitEvent: false });
            }
        });
    }

    private setupUbicacionCascade() {
        this.geografiaService.loadPaises();

        this.form.get('pais')!.valueChanges.pipe(
            distinctUntilChanged()
        ).subscribe(idPais => {
            if (idPais) {
                this.form.patchValue({ estado: null, ciudad: null }, { emitEvent: false });
                this.geografiaService.loadEstados(Number(idPais));
                const currentCp = this.form.get('cp')?.value;
                if (currentCp && currentCp.length === 5) {
                    this.cpSearch.next(currentCp);
                }
            }
        });

        this.form.get('estado')!.valueChanges.pipe(
            distinctUntilChanged()
        ).subscribe(idEstado => {
            if (idEstado) {
                this.form.patchValue({ ciudad: null }, { emitEvent: false });
                this.geografiaService.loadCiudades(Number(idEstado));
            }
        });
    }

    private setupCpAutofill() {
        this.cpSearch.pipe(
            debounceTime(600),
            distinctUntilChanged(),
            switchMap(cp => {
                if (cp && cp.length === 5) {
                    const idPais = this.form.get('pais')?.value;
                    if (!idPais) {
                        this.colonias.set([]);
                        return of([]);
                    }

                    this.loadingCp.set(true);
                    return this.geografiaService.getColoniasByCp(cp).pipe(
                        map((data: CodigoPostalResult[]) => data.filter((c: any) => c.idPais === idPais)),
                        catchError(() => {
                            this.loadingCp.set(false);
                            this.colonias.set([]);
                            return of([]);
                        })
                    );
                }
                this.colonias.set([]);
                return of([]);
            })
        ).subscribe(data => {
            this.loadingCp.set(false);
            this.colonias.set(data);
            if (data && data.length > 0) {
                const first = data[0];
                setTimeout(() => {
                    if (first.idEstado) {
                        this.form.patchValue({ estado: first.idEstado }, { emitEvent: true });
                    }
                    setTimeout(() => {
                        if (first.idCiudad) {
                            this.form.patchValue({ ciudad: first.idCiudad }, { emitEvent: false });
                        }
                        if (data.length === 1) {
                            this.form.patchValue({ colonia: first.colonia }, { emitEvent: false });
                        }
                    }, 400);
                }, 400);
            }
        });

        this.form.get('cp')!.valueChanges.subscribe(value => {
            this.cpSearch.next(value);
        });
    }

    onCpInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.cpSearch.next(value);
    }

    loadCatalogos() {
        this.departamentoService.getAll(1).subscribe({
            next: (data) => this.departamentos.set(data),
            error: (err) => console.error('Error cargando departamentos', err)
        });

        this.puestoService.getAll(1).subscribe({
            next: (data) => this.puestos.set(data),
            error: (err) => console.error('Error cargando puestos', err)
        });

        this.nivelService.getAll(1).subscribe({
            next: (data) => this.niveles.set(data),
            error: (err) => console.error('Error cargando niveles', err)
        });

        this.tipoTrabajadorService.getAll(1).subscribe({
            next: (data) => this.tiposTrabajador.set(data),
            error: (err) => console.error('Error cargando tipos de trabajador', err)
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

                        if (worker.pais) {
                            this.geografiaService.loadEstados(Number(worker.pais));
                            if (worker.estado) {
                                this.geografiaService.loadCiudades(Number(worker.estado));
                            }
                        }
                    }
                }, 0);
            },
            error: (err) => {
                setTimeout(() => {
                    this.loading.set(false);
                    console.error(err);
                    this.snackBar.open('Error al cargar datos del trabajador', 'Cerrar', { duration: 3000 });
                    this.router.navigate(['/app/rh/trabajador']);
                }, 0);
            }
        });
    }
    save() {
        switch (this.selectedTabIndex) {
            case 0:
                this.saveWorker();
                break;
            case 1:
                this.saveBanco();
                break;
            case 2:
                this.saveDocumento();
                break;
        }
    }

    private saveWorker() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        const formValue = this.form.value;

        const trabajadorRaw = {
            ...formValue,
            ciudad: Number(formValue.ciudad) || null,
            estado: Number(formValue.estado) || null,
            pais: Number(formValue.pais) || null,
            tipoTrabajador: Number(formValue.tipoTrabajador) || 1,
            idDepartamento: Number(formValue.idDepartamento) || 1,
            idPuesto: Number(formValue.idPuesto) || 1,
            idNivel: Number(formValue.idNivel) || 1,
            salarioMensual: Number(formValue.salarioMensual) || 0
        };

        let request: any;

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
            request = this.isEditMode && this.workerId
                ? this.trabajadorService.update(this.workerId, formData)
                : this.trabajadorService.insert(formData);
        } else {
            request = this.isEditMode && this.workerId
                ? this.trabajadorService.update(this.workerId, trabajadorRaw)
                : this.trabajadorService.insert(trabajadorRaw);
        }

        request.subscribe({
            next: (res: any) => {
                this.loading.set(false);
                if (res.exito === 1 || res.status === 'success' || res.data) {
                    const msg = this.isEditMode ? 'Trabajador actualizado correctamente' : 'Trabajador creado correctamente';
                    this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
                    if (!this.isEditMode) {
                        this.router.navigate(['/app/rh/trabajador']);
                    }
                } else {
                    this.snackBar.open(`Error: ${res.mensaje || 'Error desconocido'}`, 'Cerrar', { duration: 5000 });
                }
            },
            error: (err: any) => {
                this.loading.set(false);
                console.error(err);
                this.snackBar.open('Error al guardar trabajador', 'Cerrar', { duration: 5000 });
            }
        });
    }

    private saveBanco() {
        if (!this.bancosComponent || !this.bancosComponent.showForm()) {
            return;
        }

        const request$ = this.bancosComponent.save();

        if (request$) {
            this.loading.set(true);
            request$.subscribe({
                next: (res: any) => {
                    this.loading.set(false);
                    if (res && (res.exito === 1 || res.status === 'success')) {
                        this.snackBar.open('Cuenta guardada correctamente', 'Cerrar', { duration: 3000 });
                    }
                },
                error: (err: any) => {
                    this.loading.set(false);
                    console.error(err);
                    this.snackBar.open('Error al guardar cuenta', 'Cerrar', { duration: 3000 });
                }
            });
        } else {
            this.snackBar.open('Formulario bancario inválido', 'Cerrar', { duration: 3000 });
        }
    }

    private saveDocumento() {
        if (!this.documentosComponent) return;

        const request$ = this.documentosComponent.upload();

        if (request$) {
            this.loading.set(true);
            request$.subscribe({
                next: (res: any) => {
                    this.loading.set(false);
                    if (res && (res.exito === 1 || res.status === 'success')) {
                        this.snackBar.open('Documento subido correctamente', 'Cerrar', { duration: 3000 });
                    }
                },
                error: (err: any) => {
                    this.loading.set(false);
                    console.error(err);
                    this.snackBar.open('Error al subir documento', 'Cerrar', { duration: 3000 });
                }
            });
        } else {
            this.snackBar.open('Debe seleccionar un archivo válido', 'Cerrar', { duration: 3000 });
        }
    }

    cancel() {
        this.router.navigate(['/app/rh/trabajador']);
    }
}