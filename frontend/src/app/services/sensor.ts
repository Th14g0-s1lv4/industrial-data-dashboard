import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Agregado, Leitura, Sensor } from '../models/sensor.model';

@Injectable({ providedIn: 'root' })
export class SensorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';

  listarSensores(): Observable<Sensor[]> {
    return this.http.get<Sensor[]>(`${this.apiUrl}/sensores/`);
  }

  historico(sensorId: number, desde?: string): Observable<Leitura[]> {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    return this.http.get<Leitura[]>(`${this.apiUrl}/leituras/${sensorId}`, { params });
  }

  agregado(sensorId: number, minutos = 60): Observable<Agregado> {
    const params = new HttpParams().set('minutos', minutos);
    return this.http.get<Agregado>(`${this.apiUrl}/leituras/${sensorId}/agregado`, { params });
  }

  alertas(sensorId: number, minutos = 60): Observable<Leitura[]> {
    const params = new HttpParams().set('minutos', minutos);
    return this.http.get<Leitura[]>(`${this.apiUrl}/leituras/${sensorId}/alertas`, { params });
  }
}