// ============================================================
// SENTINEL-ML - NETWORK FLOWS COMPONENT
// Simulador de Flujos de Red en Tiempo Real
// Sistema de Detección de Amenazas para Entornos de Defensa
// ============================================================

import { Component, OnInit, OnDestroy, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ConnectedComponent, FlowStatus, NetworkFlow, NetworkNode } from '../models';
import { NetworkTopologyService } from '../services/network-topology.service';
import { ConnectedComponentsService } from '../services/connected-components.service';
import { FlowProtocolsService } from '../services/flow-protocols.service';
import { FlowStatusService } from '../services/flow-status.service';
import { MonitorStore } from '../state/monitor.store';
import { NetworkConfigStore } from '../state/network-config.store';
import { FlowSimulatorService } from '../services/flow-simulator.service';
import { FlowStatisticsService } from '../services/flow-statistics.service';
import { MonitorUiStore } from '../state/monitor-ui.store';
import { FlowUiHelperService } from '../services/flow-ui-helper.service';
import { flowAnimations } from '../animations/flow.animations';

@Component({
  selector: 'app-network-flow-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule,
    RouterLink
  ],
  templateUrl: './network-flow-page.component.html',
  styleUrl: './network-flow-page.component.scss',
  animations: flowAnimations
})
export class NetworkFlowPageComponent implements OnInit, OnDestroy {

  private readonly router = inject(Router);

  // ─────────────────────────────────────────────────────────────
  // GENERACIÓN DE FLUJOS SIMULADOS
  // ─────────────────────────────────────────────────────────────
  private simulator = inject(FlowSimulatorService);

  // ─────────────────────────────────────────────────────────────
  // ESTADÍSTICAS
  // ─────────────────────────────────────────────────────────────
  private flowStatisticsService = inject(FlowStatisticsService);

  // ─────────────────────────────────────────────────────────────
  // ESTADO
  // ─────────────────────────────────────────────────────────────
  private _ui = inject(MonitorUiStore);

  public get ui(): MonitorUiStore {
    return this._ui;
  }

  // Timers
  private simulationInterval: ReturnType<typeof setInterval> | null = null;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  // ─────────────────────────────────────────────────────────────
  // NODOS DE RED SIMULADOS
  // ─────────────────────────────────────────────────────────────
  private topology = inject(NetworkTopologyService);
  readonly networkNodes: NetworkNode[] = this.topology.getNodes();

  // ─────────────────────────────────────────────────────────────
  // COMPONENTES CONECTADOS
  // ─────────────────────────────────────────────────────────────

  private componentsService = inject(ConnectedComponentsService);

  get connectedComponents() {
    return this.componentsService.getAll();
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────
  private _uiHelper = inject(FlowUiHelperService);
  
  public get uiHelper() : FlowUiHelperService {
    return this._uiHelper;
  }
  
  // ─────────────────────────────────────────────────────────────
  // PROTOCOLOS Y CONFIGURACIÓN
  // ─────────────────────────────────────────────────────────────
  private protocolsService = inject(FlowProtocolsService);
  get protocols() {
    return this.protocolsService.getAll();
  }
  private statusService = inject(FlowStatusService);

  get statuses() {
    return this.statusService.getAll();
  }

  // ─────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────

  private _store = inject(MonitorStore);

  public get store(): MonitorStore {
    return this._store;
  }

  // ─────────────────────────────────────────────────────────────
  // ESTADO DESDE EL SERVICIO DE CONFIGURACIÓN
  // ─────────────────────────────────────────────────────────────

  private _configStore = inject(NetworkConfigStore);

  public get configStore(): NetworkConfigStore {
    return this._configStore;
  }

  // ─────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Iniciar simulación automáticamente
    this.startSimulation();
  }

  ngOnDestroy(): void {
    this.stopSimulation();
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS DE SIMULACIÓN
  // ─────────────────────────────────────────────────────────────

  startSimulation(): void {
    if (this.ui.isSimulating()) return;

    this.ui.setSimulating(false);
    this.ui.setPaused(false);

    // Generar flujos periódicamente
    this.simulationInterval = setInterval(() => {
      if (!this.ui.isPaused()) {
        this.simulator.generateFlow();
      }
    }, this.ui.simulationSpeed());

    // Actualizar estadísticas
    this.statsInterval = setInterval(() => {
      this.flowStatisticsService.updateStatistics();
    }, 1000);
  }

  stopSimulation(): void {
    this.ui.setSimulating(false);
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  togglePause(): void {
    this.ui.getIsPaused().update(p => !p);
  }

  clearFlows(): void {
    this.simulator.clearFlows();
    this.flowStatisticsService.resetStatistics();
  }

  setSimulationSpeed(speed: number): void {
    this.ui.setSimulationSpeed(speed);

    // Reiniciar intervalo con nueva velocidad
    if (this.ui.getIsSimulating() && this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = setInterval(() => {
        if (!this.ui.getIsPaused()) {
          this.simulator.generateFlow();
        }
      }, speed);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // FILTROS
  // ─────────────────────────────────────────────────────────────

  toggleShowOnlyThreats(): void {
    this.ui.getsHowOnlyThreats().update(v => !v);
  }

  // ─────────────────────────────────────────────────────────────
  // SELECCIÓN Y NAVEGACIÓN
  // ─────────────────────────────────────────────────────────────

  navigateToComponent(component: ConnectedComponent): void {
    this.router.navigate([component.route]);
  }

  investigateFlow(flow: NetworkFlow): void {
    // Navegar al componente de amenazas con el flujo seleccionado
    this.router.navigate(['/threats'], {
      queryParams: { flowId: flow.id, sourceIP: flow.sourceIP }
    });
  }

  blockIP(ip: string): void {
    console.log('Bloqueando IP:', ip);
    // Aquí iría la lógica para bloquear la IP

    // Actualizar flujos relacionados
    this.simulator.flows.update(flows =>
      flows.map(f => {
        if (f.sourceIP === ip || f.destinationIP === ip) {
          return { ...f, status: 'blocked' as FlowStatus };
        }
        return f;
      })
    );
  }  
}