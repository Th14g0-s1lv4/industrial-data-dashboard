import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SensorService } from './services/sensor';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('frontend');
  private sensorService = inject(SensorService);

  ngOnInit() {
    this.sensorService.listarSensores().subscribe(s => console.log('sensores', s));
  }
}