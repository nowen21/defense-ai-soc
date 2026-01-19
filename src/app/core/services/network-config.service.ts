// ============================================================
// SENTINEL-ML - NETWORK CONFIG SERVICE
// Servicio compartido para configuración de red
// Conecta Network Config con Network Flows y otros componentes
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Importar tipos desde el componente de configuración
import { 
  NetworkType, 
  DefenseConfiguration,
  ClasificacionSeguridad,
  ThreatProfile,
  MLModelConfig
} from '../../features/network-type-selector/pages/network-type-selector-page.component';

// ─────────────────────────────────────────────────────────────
// INTERFACES ADICIONALES PARA EL SERVICIO
// ─────────────────────────────────────────────────────────────

export interface NetworkNode {
  id: string;
  name: string;
  type: 'firewall' | 'router' | 'switch' | 'server' | 'workstation' | 'iot' | 'external' | 'attacker';
  ip: string;
  status: 'online' | 'offline' | 'compromised' | 'scanning';
  zone: string;
  x?: number;
  y?: number;
  connections?: string[];
}

export interface SecurityPolicy {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  nivel: 'basico' | 'avanzado' | 'maximo';
}

export interface FullNetworkConfiguration {
  // Configuración de red
  network: NetworkType | null;
  defenseConfig: DefenseConfiguration | null;
  
  // Políticas de seguridad
  activePolicies: SecurityPolicy[];
  alertLevel: 'bajo' | 'medio' | 'alto' | 'critico';
  
  // Nodos de red detectados
  networkNodes: NetworkNode[];
  
  // Estado del sistema
  isConfigured: boolean;
  isActive: boolean;
  configuredAt: Date | null;
  activatedAt: Date | null;
  
  // Clasificación
  clasificacion: ClasificacionSeguridad;
}

export interface FlowGenerationConfig {
  baseIPs: string[];
  externalIPs: string[];
  attackerIPs: string[];
  protocols: string[];
  threatProbability: number;
  criticalProbability: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetworkConfigService {
  
  // ─────────────────────────────────────────────────────────────
  // ESTADO PRIVADO
  // ─────────────────────────────────────────────────────────────
  
  private readonly _configuration = signal<FullNetworkConfiguration>({
    network: null,
    defenseConfig: null,
    activePolicies: [],
    alertLevel: 'medio',
    networkNodes: [],
    isConfigured: false,
    isActive: false,
    configuredAt: null,
    activatedAt: null,
    clasificacion: 'restringido'
  });
  
  // BehaviorSubject para compatibilidad con RxJS si es necesario
  private readonly configurationSubject = new BehaviorSubject<FullNetworkConfiguration>(this._configuration());
  
  // ─────────────────────────────────────────────────────────────
  // ESTADO PÚBLICO (READONLY)
  // ─────────────────────────────────────────────────────────────
  
  readonly configuration = this._configuration.asReadonly();
  readonly configuration$ = this.configurationSubject.asObservable();
  
  // ─────────────────────────────────────────────────────────────
  // COMPUTED SIGNALS
  // ─────────────────────────────────────────────────────────────
  
  readonly isConfigured = computed(() => this._configuration().isConfigured);
  readonly isActive = computed(() => this._configuration().isActive);
  readonly selectedNetwork = computed(() => this._configuration().network);
  readonly clasificacion = computed(() => this._configuration().clasificacion);
  readonly alertLevel = computed(() => this._configuration().alertLevel);
  readonly activePolicies = computed(() => this._configuration().activePolicies);
  readonly networkNodes = computed(() => this._configuration().networkNodes);
  readonly mlModels = computed(() => this._configuration().network?.modelosML || []);
  readonly threats = computed(() => this._configuration().network?.amenazasPrioritarias || []);
  
  // Configuración para generación de flujos
  readonly flowGenerationConfig = computed<FlowGenerationConfig>(() => {
    const config = this._configuration();
    const network = config.network;
    
    if (!network) {
      return this.getDefaultFlowConfig();
    }
    
    return this.buildFlowConfigFromNetwork(network, config);
  });
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - CONFIGURACIÓN DE RED
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Establece la red seleccionada (Paso 1 del wizard)
   */
  setSelectedNetwork(network: NetworkType): void {
    this._configuration.update(config => ({
      ...config,
      network,
      clasificacion: network.clasificacion,
      networkNodes: this.generateNodesForNetwork(network)
    }));
    this.emitChange();
  }
  
  /**
   * Establece la configuración de defensa completa
   */
  setDefenseConfiguration(defenseConfig: DefenseConfiguration): void {
    this._configuration.update(config => ({
      ...config,
      defenseConfig,
      clasificacion: defenseConfig.clasificacion
    }));
    this.emitChange();
  }
  
  /**
   * Establece las políticas de seguridad activas (Paso 3 del wizard)
   */
  setActivePolicies(policies: SecurityPolicy[]): void {
    this._configuration.update(config => ({
      ...config,
      activePolicies: policies
    }));
    this.emitChange();
  }
  
  /**
   * Establece el nivel de alerta
   */
  setAlertLevel(level: 'bajo' | 'medio' | 'alto' | 'critico'): void {
    this._configuration.update(config => ({
      ...config,
      alertLevel: level
    }));
    this.emitChange();
  }
  
  /**
   * Marca la configuración como completada (Paso 4 del wizard)
   */
  completeConfiguration(): void {
    this._configuration.update(config => ({
      ...config,
      isConfigured: true,
      configuredAt: new Date()
    }));
    this.emitChange();
  }
  
  /**
   * Activa el sistema de monitoreo
   */
  activateSystem(): void {
    this._configuration.update(config => ({
      ...config,
      isActive: true,
      activatedAt: new Date()
    }));
    this.emitChange();
  }
  
  /**
   * Desactiva el sistema de monitoreo
   */
  deactivateSystem(): void {
    this._configuration.update(config => ({
      ...config,
      isActive: false
    }));
    this.emitChange();
  }
  
  /**
   * Reinicia toda la configuración
   */
  resetConfiguration(): void {
    this._configuration.set({
      network: null,
      defenseConfig: null,
      activePolicies: [],
      alertLevel: 'medio',
      networkNodes: [],
      isConfigured: false,
      isActive: false,
      configuredAt: null,
      activatedAt: null,
      clasificacion: 'restringido'
    });
    this.emitChange();
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - NODOS DE RED
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Actualiza el estado de un nodo específico
   */
  updateNodeStatus(nodeId: string, status: NetworkNode['status']): void {
    this._configuration.update(config => ({
      ...config,
      networkNodes: config.networkNodes.map(node => 
        node.id === nodeId ? { ...node, status } : node
      )
    }));
    this.emitChange();
  }
  
  /**
   * Agrega un nuevo nodo a la red
   */
  addNode(node: NetworkNode): void {
    this._configuration.update(config => ({
      ...config,
      networkNodes: [...config.networkNodes, node]
    }));
    this.emitChange();
  }
  
  /**
   * Elimina un nodo de la red
   */
  removeNode(nodeId: string): void {
    this._configuration.update(config => ({
      ...config,
      networkNodes: config.networkNodes.filter(n => n.id !== nodeId)
    }));
    this.emitChange();
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS - GENERACIÓN DE NODOS
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Genera nodos de red basados en el tipo de red seleccionado
   */
  private generateNodesForNetwork(network: NetworkType): NetworkNode[] {
    const baseNodes: NetworkNode[] = [
      { id: 'fw1', name: 'Firewall Principal', type: 'firewall', ip: '10.0.0.1', status: 'online', zone: 'perimeter', x: 50, y: 10 },
      { id: 'ext1', name: 'Internet', type: 'external', ip: '0.0.0.0', status: 'online', zone: 'external', x: 50, y: 0 }
    ];
    
    switch (network.id) {
      case 'tactical':
        return [
          ...baseNodes,
          { id: 'r1', name: 'Router Táctico', type: 'router', ip: '10.1.0.1', status: 'online', zone: 'tactical', x: 50, y: 25 },
          { id: 'sw1', name: 'Switch Campo', type: 'switch', ip: '10.1.1.1', status: 'online', zone: 'tactical', x: 30, y: 40 },
          { id: 'sw2', name: 'Switch Comando', type: 'switch', ip: '10.1.2.1', status: 'online', zone: 'command', x: 70, y: 40 },
          { id: 'srv1', name: 'Servidor C2', type: 'server', ip: '10.1.2.10', status: 'online', zone: 'command', x: 60, y: 55 },
          { id: 'srv2', name: 'Servidor Comm', type: 'server', ip: '10.1.2.11', status: 'online', zone: 'command', x: 80, y: 55 },
          { id: 'ws1', name: 'Terminal Táctico 1', type: 'workstation', ip: '10.1.1.101', status: 'online', zone: 'tactical', x: 20, y: 55 },
          { id: 'ws2', name: 'Terminal Táctico 2', type: 'workstation', ip: '10.1.1.102', status: 'online', zone: 'tactical', x: 40, y: 55 },
          { id: 'iot1', name: 'Sensor RF', type: 'iot', ip: '10.1.1.200', status: 'online', zone: 'tactical', x: 10, y: 70 },
          { id: 'iot2', name: 'Sensor GPS', type: 'iot', ip: '10.1.1.201', status: 'online', zone: 'tactical', x: 30, y: 70 }
        ];
        
      case 'strategic':
        return [
          ...baseNodes,
          { id: 'r1', name: 'Router Core A', type: 'router', ip: '10.2.0.1', status: 'online', zone: 'core', x: 35, y: 25 },
          { id: 'r2', name: 'Router Core B', type: 'router', ip: '10.2.0.2', status: 'online', zone: 'core', x: 65, y: 25 },
          { id: 'sw1', name: 'Switch DMZ', type: 'switch', ip: '10.2.1.1', status: 'online', zone: 'dmz', x: 20, y: 40 },
          { id: 'sw2', name: 'Switch Comando', type: 'switch', ip: '10.2.2.1', status: 'online', zone: 'command', x: 50, y: 40 },
          { id: 'sw3', name: 'Switch Clasificado', type: 'switch', ip: '10.2.3.1', status: 'online', zone: 'classified', x: 80, y: 40 },
          { id: 'srv1', name: 'Servidor Web', type: 'server', ip: '10.2.1.10', status: 'online', zone: 'dmz', x: 15, y: 55 },
          { id: 'srv2', name: 'Servidor C4ISR', type: 'server', ip: '10.2.2.10', status: 'online', zone: 'command', x: 45, y: 55 },
          { id: 'srv3', name: 'Servidor Intel', type: 'server', ip: '10.2.3.10', status: 'online', zone: 'classified', x: 75, y: 55 },
          { id: 'srv4', name: 'Base de Datos', type: 'server', ip: '10.2.3.11', status: 'online', zone: 'classified', x: 90, y: 55 },
          { id: 'ws1', name: 'Consola Comando', type: 'workstation', ip: '10.2.2.101', status: 'online', zone: 'command', x: 55, y: 70 }
        ];
        
      case 'intelligence':
        return [
          ...baseNodes,
          { id: 'r1', name: 'Router ISR', type: 'router', ip: '10.3.0.1', status: 'online', zone: 'isr', x: 50, y: 25 },
          { id: 'sw1', name: 'Switch Sensores', type: 'switch', ip: '10.3.1.1', status: 'online', zone: 'sensors', x: 25, y: 40 },
          { id: 'sw2', name: 'Switch Procesamiento', type: 'switch', ip: '10.3.2.1', status: 'online', zone: 'processing', x: 50, y: 40 },
          { id: 'sw3', name: 'Switch Análisis', type: 'switch', ip: '10.3.3.1', status: 'online', zone: 'analysis', x: 75, y: 40 },
          { id: 'srv1', name: 'Servidor SIGINT', type: 'server', ip: '10.3.1.10', status: 'online', zone: 'sensors', x: 15, y: 55 },
          { id: 'srv2', name: 'Servidor IMINT', type: 'server', ip: '10.3.1.11', status: 'online', zone: 'sensors', x: 35, y: 55 },
          { id: 'srv3', name: 'Procesador ML', type: 'server', ip: '10.3.2.10', status: 'online', zone: 'processing', x: 50, y: 55 },
          { id: 'srv4', name: 'Servidor Fusión', type: 'server', ip: '10.3.3.10', status: 'online', zone: 'analysis', x: 70, y: 55 },
          { id: 'srv5', name: 'Base Datos Intel', type: 'server', ip: '10.3.3.11', status: 'online', zone: 'analysis', x: 85, y: 55 },
          { id: 'iot1', name: 'Sensor Radar', type: 'iot', ip: '10.3.1.200', status: 'online', zone: 'sensors', x: 10, y: 70 },
          { id: 'iot2', name: 'Sensor SAR', type: 'iot', ip: '10.3.1.201', status: 'online', zone: 'sensors', x: 25, y: 70 }
        ];
        
      case 'cyber_defense':
        return [
          ...baseNodes,
          { id: 'r1', name: 'Router SOC', type: 'router', ip: '10.5.0.1', status: 'online', zone: 'soc', x: 50, y: 25 },
          { id: 'sw1', name: 'Switch Monitoreo', type: 'switch', ip: '10.5.1.1', status: 'online', zone: 'monitoring', x: 30, y: 40 },
          { id: 'sw2', name: 'Switch Análisis', type: 'switch', ip: '10.5.2.1', status: 'online', zone: 'analysis', x: 70, y: 40 },
          { id: 'srv1', name: 'SIEM Principal', type: 'server', ip: '10.5.1.10', status: 'online', zone: 'monitoring', x: 20, y: 55 },
          { id: 'srv2', name: 'Threat Intel', type: 'server', ip: '10.5.1.11', status: 'online', zone: 'monitoring', x: 40, y: 55 },
          { id: 'srv3', name: 'Sandbox Malware', type: 'server', ip: '10.5.2.10', status: 'online', zone: 'analysis', x: 60, y: 55 },
          { id: 'srv4', name: 'Forense Digital', type: 'server', ip: '10.5.2.11', status: 'online', zone: 'analysis', x: 80, y: 55 },
          { id: 'ws1', name: 'Analista SOC 1', type: 'workstation', ip: '10.5.1.101', status: 'online', zone: 'monitoring', x: 25, y: 70 },
          { id: 'ws2', name: 'Analista SOC 2', type: 'workstation', ip: '10.5.1.102', status: 'online', zone: 'monitoring', x: 45, y: 70 },
          { id: 'ws3', name: 'Analista Threat', type: 'workstation', ip: '10.5.2.101', status: 'online', zone: 'analysis', x: 75, y: 70 }
        ];
        
      default:
        return [
          ...baseNodes,
          { id: 'r1', name: 'Router Principal', type: 'router', ip: '10.0.1.1', status: 'online', zone: 'core', x: 50, y: 25 },
          { id: 'sw1', name: 'Switch Core', type: 'switch', ip: '10.0.2.1', status: 'online', zone: 'core', x: 50, y: 40 },
          { id: 'srv1', name: 'Servidor 1', type: 'server', ip: '10.0.2.10', status: 'online', zone: 'servers', x: 35, y: 55 },
          { id: 'srv2', name: 'Servidor 2', type: 'server', ip: '10.0.2.11', status: 'online', zone: 'servers', x: 65, y: 55 },
          { id: 'ws1', name: 'Workstation 1', type: 'workstation', ip: '10.0.3.101', status: 'online', zone: 'users', x: 30, y: 70 },
          { id: 'ws2', name: 'Workstation 2', type: 'workstation', ip: '10.0.3.102', status: 'online', zone: 'users', x: 50, y: 70 },
          { id: 'ws3', name: 'Workstation 3', type: 'workstation', ip: '10.0.3.103', status: 'online', zone: 'users', x: 70, y: 70 }
        ];
    }
  }
  
  /**
   * Configuración por defecto para generación de flujos
   */
  private getDefaultFlowConfig(): FlowGenerationConfig {
    return {
      baseIPs: ['10.0.3.101', '10.0.3.102', '10.0.2.10', '10.0.2.11', '192.168.1.50'],
      externalIPs: ['8.8.8.8', '1.1.1.1', '208.67.222.222', '93.184.216.34'],
      attackerIPs: ['185.220.101.45', '45.155.205.233', '194.26.29.113'],
      protocols: ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'],
      threatProbability: 0.1,
      criticalProbability: 0.05
    };
  }
  
  /**
   * Construye configuración de flujos basada en la red seleccionada
   */
  private buildFlowConfigFromNetwork(
    network: NetworkType, 
    config: FullNetworkConfiguration
  ): FlowGenerationConfig {
    
    // Extraer IPs de los nodos configurados
    const baseIPs = config.networkNodes
      .filter(n => ['server', 'workstation', 'iot'].includes(n.type))
      .map(n => n.ip);
    
    // Protocolos según tipo de red
    let protocols: string[] = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS'];
    
    if (network.id === 'tactical') {
      protocols = ['TCP', 'UDP', 'HTTPS', 'DNS', 'SSH'];
    } else if (network.id === 'intelligence') {
      protocols = ['TCP', 'HTTPS', 'SSH', 'FTP'];
    } else if (network.id === 'industrial' || network.id === 'logistics') {
      protocols = ['TCP', 'UDP', 'MODBUS', 'DNP3', 'HTTP'];
    } else if (network.id === 'cyber_defense') {
      protocols = ['TCP', 'UDP', 'HTTPS', 'DNS', 'SSH', 'SMTP'];
    }
    
    // Probabilidades según nivel de alerta
    let threatProbability = 0.1;
    let criticalProbability = 0.05;
    
    switch (config.alertLevel) {
      case 'bajo':
        threatProbability = 0.05;
        criticalProbability = 0.02;
        break;
      case 'medio':
        threatProbability = 0.1;
        criticalProbability = 0.05;
        break;
      case 'alto':
        threatProbability = 0.15;
        criticalProbability = 0.08;
        break;
      case 'critico':
        threatProbability = 0.25;
        criticalProbability = 0.12;
        break;
    }
    
    // Ajustar según nivel de riesgo de la red
    if (network.nivelRiesgo === 'critico') {
      threatProbability *= 1.5;
      criticalProbability *= 1.5;
    } else if (network.nivelRiesgo === 'alto') {
      threatProbability *= 1.25;
      criticalProbability *= 1.25;
    }
    
    return {
      baseIPs: baseIPs.length > 0 ? baseIPs : this.getDefaultFlowConfig().baseIPs,
      externalIPs: ['8.8.8.8', '1.1.1.1', '208.67.222.222', '93.184.216.34', '104.26.10.78'],
      attackerIPs: ['185.220.101.45', '45.155.205.233', '194.26.29.113', '91.121.87.18', '185.100.87.202'],
      protocols,
      threatProbability: Math.min(threatProbability, 0.4),
      criticalProbability: Math.min(criticalProbability, 0.2)
    };
  }
  
  /**
   * Emite cambio a través del BehaviorSubject
   */
  private emitChange(): void {
    this.configurationSubject.next(this._configuration());
  }
}