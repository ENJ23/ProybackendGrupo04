import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Importa esto
import { CanchasService } from '../../../services/canchas.service';
import { HorariosService } from '../../../services/horarios.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Agrega FormsModule aquí
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.css'
})
export class CanchasComponent implements OnInit {
  canchas: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  selectedCancha: any = null;
  horariosDisponibles: string[] = [];
  selectedFecha: string = ''; // formato 'YYYY-MM-DD'
  loadingHorarios = false;

  minFecha: string = '';
  maxFecha: string = '';

  horaSeleccionada: string | null = null;
  cantidadHoras: number = 1; // Nuevo campo

  horariosReservados: string[] = [];

  constructor(
    private canchasService: CanchasService,
    private horariosService: HorariosService,
    private router: Router, // <-- agrega esto
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
        this.canchas = data.data || []; // Asegura que sea un array
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
    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
  }

  onFechaChange() {
    this.loadingHorarios = true;
    this.horariosDisponibles = [];
    this.cargarHorarios();
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
      }
    });
  }

  generarHorariosDisponibles(reservados: string[]): string[] {
    const bloques: string[] = [];
    for (let h = 10; h <= 22 - this.cantidadHoras; h++) {
      let disponible = true;
      for (let offset = 0; offset < this.cantidadHoras; offset++) {
        const hora = (h + offset).toString().padStart(2, '0') + ':00';
        if (reservados.map(r => r.slice(0,5)).includes(hora)) {
          disponible = false;
          break;
        }
      }
      if (disponible) {
        bloques.push(h.toString().padStart(2, '0') + ':00');
      }
    }
    return bloques;
  }

  getHoy(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0]; // 'YYYY-MM-DD'
  }

  abrirModalHorarios(cancha: any) {
    this.selectedCancha = cancha;
    this.setFechasLimite();
    this.selectedFecha = ''; // No hay fecha seleccionada aún
    this.horariosDisponibles = [];
    this.loadingHorarios = false;
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

  onSeleccionarCanchaYFecha(canchaId: string, fecha: string) {
    this.http.get<any>(`/api/horarios/filtrar?canchaId=${canchaId}&fecha=${fecha}`)
      .subscribe(resp => {
        // Extrae solo las horas de inicio de los horarios ocupados
        this.horariosReservados = resp.data.map((h: any) => h.horaInicio);
      });
  }
}
