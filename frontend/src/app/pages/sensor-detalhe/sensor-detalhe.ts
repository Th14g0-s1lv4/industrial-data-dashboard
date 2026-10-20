import { DecimalPipe } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Subscription, catchError, forkJoin, of, switchMap, timer } from 'rxjs';

import { Agregado, Leitura, Sensor } from '../../models/sensor.model';
import { SensorService } from '../../services/sensor';

Chart.register(...registerables);

interface Dados {
  sensores: Sensor[];
  historico: Leitura[];
  agregado: Agregado;
  alertas: Leitura[];
}

@Component({
  selector: 'app-sensor-detalhe',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './sensor-detalhe.html',
  styleUrl: './sensor-detalhe.scss',
})
export class SensorDetalhe implements AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private sensorService = inject(SensorService);

  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('grafico');
  private chart?: Chart<'line'>;
  private polling?: Subscription;
  private sensorId = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly periodos = [
    { rotulo: '15 min', minutos: 15 },
    { rotulo: '1 hora', minutos: 60 },
    { rotulo: '6 horas', minutos: 360 },
  ];
  protected readonly minutos = signal(60);
  protected readonly sensor = signal<Sensor | null>(null);
  protected readonly agregado = signal<Agregado | null>(null);
  protected readonly totalAlertas = signal(0);
  protected readonly erro = signal(false);

  ngAfterViewInit() {
    this.chart = new Chart<'line'>(this.canvas().nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          { label: 'Leituras', data: [], borderColor: '#1565c0', borderWidth: 1.5, tension: 0.2, pointRadius: 0 },
          { label: 'Mínimo esperado', data: [], borderColor: '#9e9e9e', borderDash: [6, 4], borderWidth: 1, pointRadius: 0 },
          { label: 'Máximo esperado', data: [], borderColor: '#9e9e9e', borderDash: [6, 4], borderWidth: 1, pointRadius: 0 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: { x: { ticks: { maxTicksLimit: 8 } } },
        plugins: { legend: { position: 'bottom' } },
      },
    });
    this.iniciarPolling();
  }

  ngOnDestroy() {
    this.polling?.unsubscribe();
    this.chart?.destroy();
  }

  protected selecionarPeriodo(minutos: number) {
    this.minutos.set(minutos);
    this.iniciarPolling();
  }

  private iniciarPolling() {
    this.polling?.unsubscribe();
    this.polling = timer(0, 5000)
      .pipe(
        switchMap(() =>
          this.carregar().pipe(
            catchError(() => {
              this.erro.set(true);
              return of(null);
            }),
          ),
        ),
      )
      .subscribe(dados => {
        if (dados) {
          this.erro.set(false);
          this.atualizar(dados);
        }
      });
  }

  private carregar() {
    const minutos = this.minutos();
    // O backend grava timestamps em UTC sem fuso; por isso removemos o "Z" do filtro.
    const desde = new Date(Date.now() - minutos * 60_000).toISOString().replace('Z', '');
    return forkJoin({
      sensores: this.sensorService.listarSensores(),
      historico: this.sensorService.historico(this.sensorId, desde),
      agregado: this.sensorService.agregado(this.sensorId, minutos),
      alertas: this.sensorService.alertas(this.sensorId, minutos),
    });
  }

  private atualizar(d: Dados) {
    const sensor = d.sensores.find(s => s.id === this.sensorId) ?? null;
    this.sensor.set(sensor);
    this.agregado.set(d.agregado);
    this.totalAlertas.set(d.alertas.length);

    if (!sensor || !this.chart) {
      return;
    }
    const fora = (v: number) => v < sensor.valor_min_esperado || v > sensor.valor_max_esperado;
    const labels = d.historico.map(l => this.hora(l.timestamp));
    const [leituras, minimo, maximo] = this.chart.data.datasets;

    this.chart.data.labels = labels;
    leituras.label = `${sensor.nome} (${sensor.unidade})`;
    leituras.data = d.historico.map(l => l.valor);
    leituras.pointRadius = d.historico.map(l => (fora(l.valor) ? 4 : 0));
    leituras.pointBackgroundColor = d.historico.map(l => (fora(l.valor) ? '#c62828' : '#1565c0'));
    minimo.data = labels.map(() => sensor.valor_min_esperado);
    maximo.data = labels.map(() => sensor.valor_max_esperado);
    this.chart.update('none');
  }

  private hora(timestamp: string): string {
    // A API devolve UTC sem fuso; o "Z" faz o JS converter para o horário local.
    const utc = /Z|[+-]\d\d:\d\d$/.test(timestamp) ? timestamp : timestamp + 'Z';
    return new Date(utc).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}