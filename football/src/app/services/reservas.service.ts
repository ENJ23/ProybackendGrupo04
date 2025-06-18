import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {

  private apiUrl = 'http://localhost:3000/reservas'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getReservas() {
    return this.http.get(this.apiUrl);
  }

  getReservaById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createReserva(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateReserva(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteReserva(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
