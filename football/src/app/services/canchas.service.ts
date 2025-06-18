import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CanchasService {

  private apiUrl = 'http://localhost:3000/canchas'; // Replace with your actual API URL

  constructor(private http: HttpClient) { }

  getCanchas() {
    return this.http.get(this.apiUrl);
  }

  getCanchaById(id: string) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createCancha(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateCancha(id: string, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCancha(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
