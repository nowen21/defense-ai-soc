import { Routes } from '@angular/router';
import { ThreatDetectionComponent } from './pages/threat-detection-page.component';


export default [
  {
    path: '',
    component: ThreatDetectionComponent,
    title: 'Detección de Amenazas | SENTINEL-ML'
  }
] as Routes;
