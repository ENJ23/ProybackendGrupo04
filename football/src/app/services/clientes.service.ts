import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {

  private apiUrl = 'http://localhost:3000/clientes'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getClientes() {
    return this.http.get(this.apiUrl);
  }

  getClienteById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCliente(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateCliente(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCliente(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
