import { Routes } from '@angular/router';
import { InicioComponent } from './components/pages/inicio/inicio.component';
import { ReservasComponent } from './components/pages/reservas/reservas.component';
import { CanchasComponent } from './components/pages/canchas/canchas.component';
import { RegistrarClienteComponent } from './components/pages/registrar-cliente/registrar-cliente.component';
import { BloquearHorariosComponent } from './components/pages/encargado/bloquear-horarios/bloquear-horarios.component';
import { CompletarPagoComponent } from './components/pages/encargado/completar-pago/completar-pago.component';
import { ReasignarReservaComponent } from './components/pages/encargado/reasignar-reserva/reasignar-reserva.component';
import { VerAntecedentesComponent } from './components/pages/encargado/ver-antecedentes/ver-antecedentes.component';
import { AgregarAntecedenteComponent } from './components/pages/encargado/agregar-antecedente/agregar-antecedente.component';

export const routes: Routes = [
    { path: '', component: InicioComponent },
    { path: 'reservas', component: ReservasComponent },
    { path: 'canchas', component: CanchasComponent },
    { path: 'registrar-cliente', component: RegistrarClienteComponent },
    { path: 'bloquear-horarios', component: BloquearHorariosComponent },
    { path: 'completar-pago', component: CompletarPagoComponent },
    { path: 'reasignar-reserva', component: ReasignarReservaComponent },
    { path: 'ver-antecedentes', component: VerAntecedentesComponent },
    { path: 'agregar-antecedente', component: AgregarAntecedenteComponent },
];  
