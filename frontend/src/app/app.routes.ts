import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { SensorDetalhe } from './pages/sensor-detalhe/sensor-detalhe';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'sensor/:id', component: SensorDetalhe },
];