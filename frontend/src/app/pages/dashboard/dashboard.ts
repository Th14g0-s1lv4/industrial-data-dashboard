import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of, switchMap, tap, timer } from 'rxjs';

import { Agregado, Sensor } from '../../models/sensor.model';
import { SensorService } from '../../services/sensor';

interface SensorCard {
  sensor: Sensor;
  agregado: Agregado;
  totalAlertas: number;
}

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private sensorService = inject(SensorService);

  protected readonly cards = signal<SensorCard[]>([]);
  protected readonly erro = signal(false);
  protected readonly carregando = signal(true);

  constructor() {
    timer(0, 5000)
      .pipe(
        switchMap(() =>
          this.carregarCards().pipe(
            tap(() => this.erro.set(false)),
            catchError(() => {
              this.erro.set(true);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe(cards => {
        if (cards) {
          this.cards.set(cards);
        }
        this.carregando.set(false);
      });
  }

  private carregarCards() {
    return this.sensorService.listarSensores().pipe(
      switchMap(sensores =>
        sensores.length === 0
          ? of([] as SensorCard[])
          : forkJoin(
              sensores.map(sensor =>
                forkJoin({
                  agregado: this.sensorService.agregado(sensor.id, 60),
                  alertas: this.sensorService.alertas(sensor.id, 60),
                }).pipe(
                  map(r => ({ sensor, agregado: r.agregado, totalAlertas: r.alertas.length })),
                ),
              ),
            ),
      ),
    );
  }
}