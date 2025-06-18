import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagosService {

  private apiUrl = 'http://localhost:3000/pagos'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getPagos() {
    return this.http.get(this.apiUrl);
  }

  getPagoById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createPago(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  createPagoMercadoPago(data: any) {
    return this.http.post(`${this.apiUrl}/mercadopago`, data);
  }

  updatePago(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deletePago(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
