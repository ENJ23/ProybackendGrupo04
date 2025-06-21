import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanchasService } from '../../../services/canchas.service';
import { HorariosService } from '../../../services/horarios.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.css'
})
export class CanchasComponent implements OnInit {
  canchas: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  selectedCancha: any = null;
  horariosDisponibles: string[] = [];
  selectedFecha: string = '';
  loadingHorarios = false;

  minFecha: string = '';
  maxFecha: string = '';

  horaSeleccionada: string | null = null;
  cantidadHoras: number = 1;

  horariosReservados: string[] = [];

  nowHour = new Date().getHours();

  constructor(
    private canchasService: CanchasService,
    private horariosService: HorariosService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.obtenerCanchas();
    this.setFechasLimite();
  }

  setFechasLimite() {
    const hoy = new Date();
    const max = new Date();
    max.setDate(hoy.getDate() + 7);

    this.minFecha = hoy.toISOString().split('T')[0];
    this.maxFecha = max.toISOString().split('T')[0];
  }

  obtenerCanchas(): void {
    this.loading = true;
    this.error = null;
    this.canchasService.getCanchas().subscribe({
      next: (data: any) => {
        this.canchas = data.data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al obtener canchas';
        this.loading = false;
        console.error('Error al obtener canchas:', err);
      }
    });
  }

  verHorarios(cancha: any) {
    this.selectedCancha = cancha;
    this.setFechasLimite();
    this.selectedFecha = this.getHoy();
    this.horaSeleccionada = null;
    this.cantidadHoras = 1;
    this.updateNowHour();
    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
  }

  onFechaChange() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSeleccionada = new Date(this.selectedFecha);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    this.horaSeleccionada = null;
    this.updateNowHour();

    if (fechaSeleccionada < hoy) {
      this.horariosDisponibles = [];
      this.horariosReservados = [];
      this.loadingHorarios = false;
      return;
    }

    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
  }

  updateNowHour() {
    // Actualiza la hora actual solo si la fecha seleccionada es hoy
    if (this.selectedFecha === this.getHoy()) {
      this.nowHour = new Date().getHours();
    } else {
      this.nowHour = 0;
    }
  }

  cargarHorarios() {
    this.horariosService.getHorariosReservados(this.selectedCancha._id, this.selectedFecha).subscribe({
      next: (resp: any) => {
        // Extrae solo las horas de inicio de los horarios ocupados
        this.horariosReservados = resp.data
          .filter((h: any) => h.estado !== 'disponible')
          .map((h: any) => h.horaInicio);

        this.horariosDisponibles = this.generarHorariosDisponibles(this.horariosReservados);
        this.loadingHorarios = false;
        // Abre el modal solo si no está abierto aún
        const modalElement = document.getElementById('horariosModal');
        if (modalElement && !modalElement.classList.contains('show')) {
          // @ts-ignore
          const modal = new window.bootstrap.Modal(modalElement);
          modal.show();
        }
      },
      error: () => {
        this.horariosDisponibles = [];
        this.horariosReservados = [];
        this.loadingHorarios = false;
        this.error = 'No se pudieron cargar los horarios. Intenta nuevamente.';
      }
    });
  }

  // Genera todos los bloques horarios posibles (de 10:00 a 21:00)
  getBloquesHorarios(): string[] {
    const bloques: string[] = [];
    for (let h = 10; h < 22; h++) {
      bloques.push(h.toString().padStart(2, '0') + ':00');
    }
    return bloques;
  }

  // Solo los horarios disponibles para reservar (para las tarjetas)
  generarHorariosDisponibles(reservados: string[]): string[] {
    const bloques: string[] = [];
    const esHoy = this.selectedFecha === this.getHoy();
    const horaActual = new Date().getHours();
    const cantidad = Math.max(1, Number(this.cantidadHoras) || 1);

    for (let h = 10; h < 23 - cantidad; h++) { // < en vez de <=
      if (esHoy && h <= horaActual) continue;

      let disponible = true;
      for (let offset = 0; offset < cantidad; offset++) {
        const hora = (h + offset).toString().padStart(2, '0') + ':00';
        if (reservados.includes(hora)) {
          disponible = false;
          break;
        }
      }
      if (disponible) {
        bloques.push(h.toString().padStart(2, '0') + ':00');
      }
    }
    console.log("cantidad", cantidad);
    console.log("reservados", reservados);
    console.log("bloques", bloques);
    console.log('selectedFecha', this.selectedFecha, 'getHoy()', this.getHoy(), 'esHoy', esHoy);
    return bloques;
  }

  getHoy(): string {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    // Ajusta a la zona local, no UTC
    const year = hoy.getFullYear();
    const month = (hoy.getMonth() + 1).toString().padStart(2, '0');
    const day = hoy.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  abrirModalHorarios(cancha: any) {
    this.selectedCancha = cancha;
    this.setFechasLimite();
    this.selectedFecha = '';
    this.horaSeleccionada = null;
    this.cantidadHoras = 1;
    this.horariosDisponibles = [];
    this.loadingHorarios = false;
    this.updateNowHour();
    // Abre el modal
    const modalElement = document.getElementById('horariosModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  seleccionarHora(hora: string) {
    this.horaSeleccionada = hora;
  }

  reservar() {
    if (!this.selectedCancha || !this.selectedFecha || !this.horaSeleccionada) {
      alert('Selecciona una fecha y un horario');
      return;
    }
    const horaInicio = this.horaSeleccionada;
    const cantidadHorasNum = Number(this.cantidadHoras) || 1;
    const horaInicioNum = parseInt(horaInicio.split(':')[0], 10);
    const horaFinNum = horaInicioNum + cantidadHorasNum;
    const horaFin = horaFinNum.toString().padStart(2, '0') + ':00';

    // Validar que todos los bloques del rango estén disponibles
    for (let h = horaInicioNum; h < horaFinNum; h++) {
      const bloque = h.toString().padStart(2, '0') + ':00';
      if (this.horariosReservados.includes(bloque)) {
        alert(`El bloque ${bloque} ya está ocupado. Por favor, elige otro rango.`);
        return;
      }
      // Si es hoy, no permitir reservar bloques pasados
      if (this.selectedFecha === this.getHoy() && h <= this.nowHour) {
        alert(`No puedes reservar bloques pasados para hoy.`);
        return;
      }
    }

    // Cierra el modal de Bootstrap si está abierto
    const modalElement = document.getElementById('horariosModal');
    if (modalElement) {
      // @ts-ignore
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // Redirige pasando horaInicio y horaFin
    this.router.navigate(['/reservas'], {
      queryParams: {
        canchaId: this.selectedCancha._id,
        fecha: this.selectedFecha,
        hora: horaInicio,
        horaFin: horaFin,
        cantidadHoras: cantidadHorasNum
      }
    });
  }
}
