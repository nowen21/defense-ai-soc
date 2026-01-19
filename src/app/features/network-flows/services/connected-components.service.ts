import { Injectable } from '@angular/core';
import { ConnectedComponent } from '../models';

@Injectable({ providedIn: 'root' })
export class ConnectedComponentsService {

  private readonly components: ConnectedComponent[] = [
    {
      id: 'network-config',
      name: 'Network Config',
      description: 'Proporciona la configuración de la topología de red y los parámetros de monitoreo',
      icon: 'settings_ethernet',
      route: '/network-config',
      dataFlow: 'sends',
      dataTypes: ['Topología de red', 'Configuración de nodos', 'Políticas de seguridad'],
      status: 'active'
    },
    {
      id: 'ml-engine',
      name: 'Motor ML',
      description: 'Recibe flujos para análisis y devuelve predicciones de anomalías',
      icon: 'psychology',
      route: '/ml-engine',
      dataFlow: 'bidirectional',
      dataTypes: ['Flujos de red', 'Predicciones ML', 'Scores de amenaza'],
      status: 'active'
    },
    {
      id: 'threat-detection',
      name: 'Detección de Amenazas',
      description: 'Recibe alertas de flujos sospechosos para correlación y análisis',
      icon: 'gpp_bad',
      route: '/threats',
      dataFlow: 'sends',
      dataTypes: ['Alertas de amenazas', 'IOCs detectados', 'Eventos de seguridad'],
      status: 'active'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Muestra métricas y estadísticas de flujos en tiempo real',
      icon: 'dashboard',
      route: '/dashboard',
      dataFlow: 'sends',
      dataTypes: ['Estadísticas', 'Métricas de tráfico', 'KPIs de seguridad'],
      status: 'active'
    },
    {
      id: 'siem-integration',
      name: 'Integración SIEM',
      description: 'Exporta eventos y logs para correlación externa',
      icon: 'hub',
      route: '/settings/integrations',
      dataFlow: 'sends',
      dataTypes: ['Logs de eventos', 'Alertas SIEM', 'Datos forenses'],
      status: 'active'
    },
    {
      id: 'reports',
      name: 'Reportes',
      description: 'Genera reportes históricos de flujos y análisis de tráfico',
      icon: 'assessment',
      route: '/reports',
      dataFlow: 'sends',
      dataTypes: ['Datos históricos', 'Análisis de tendencias', 'Reportes de incidentes'],
      status: 'active'
    }
  ];

  getAll(): ConnectedComponent[] {
    return structuredClone(this.components);
  }

  getById(id: string): ConnectedComponent | undefined {
    return this.components.find(c => c.id === id);
  }

  setStatus(id: string, status: ConnectedComponent['status']): void {
    const c = this.components.find(x => x.id === id);
    if (c) c.status = status;
  }
}
