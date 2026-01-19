// ============================================================
// SENTINEL-ML - THREAT DETECTION COMPONENT
// Panel de Detección y Gestión de Amenazas
// ============================================================

import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule } from '@angular/material/dialog';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger 
} from '@angular/animations';


import { NetworkConfigService } from '../../../core/services/network-config.service';
import { MitrePhase, ThreatCategory, ThreatSeverity, ThreatStatus } from '../../../core/types-emuns/index-te';
import { ThreatDetectionService } from '../../../core/services/threat-detection.service';
import { ThreatAlert } from '../../../core/models/threat/index-threat';


// ─────────────────────────────────────────────────────────────
// INTERFACES LOCALES
// ─────────────────────────────────────────────────────────────

interface FilterOptions {
  severity: ThreatSeverity | 'all';
  status: ThreatStatus | 'all';
  category: ThreatCategory | 'all';
  timeRange: '1h' | '24h' | '7d' | '30d' | 'all';
  searchTerm: string;
}

interface ConnectedComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  dataFlow: 'sends' | 'receives' | 'bidirectional';
  dataTypes: string[];
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-threat-detection',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatDialogModule
  ],
  templateUrl: './threat-detection-page.component.html',
  styleUrl: './threat-detection-page.component.scss',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ]),
    trigger('staggerList', [
      transition(':enter', [
        query('.alert-row', [
          style({ opacity: 0, transform: 'translateX(-20px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('slidePanel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ]),
    trigger('pulse', [
      transition(':enter', [
        style({ transform: 'scale(0.8)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class ThreatDetectionComponent implements OnInit, OnDestroy {
  
  private readonly _threatService = inject(ThreatDetectionService);
  
  public get threatService() : ThreatDetectionService {
    return this._threatService; 
  }
  
  private readonly networkConfigService = inject(NetworkConfigService);
  private readonly route = inject(ActivatedRoute);
  
  // ─────────────────────────────────────────────────────────────
  // ESTADO LOCAL
  // ─────────────────────────────────────────────────────────────
  
  private readonly _filters = signal<FilterOptions>({
    severity: 'all',
    status: 'all',
    category: 'all',
    timeRange: '24h',
    searchTerm: ''
  });
  
  private readonly _viewMode = signal<'list' | 'grid' | 'timeline'>('list');
  private readonly _showDetailPanel = signal<boolean>(false);
  private readonly _newNoteContent = signal<string>('');
  
  // Públicos
  readonly filters = this._filters.asReadonly();
  readonly viewMode = this._viewMode.asReadonly();
  readonly showDetailPanel = this._showDetailPanel.asReadonly();
  readonly newNoteContent = this._newNoteContent.asReadonly();
  
  // Del servicio
  readonly alerts = this.threatService.alerts;
  readonly selectedAlert = this.threatService.selectedAlert;
  readonly statistics = this.threatService.statistics;
  readonly isMonitoring = this.threatService.isMonitoring;
  readonly iocs = this.threatService.iocs;
  readonly criticalAlerts = this.threatService.criticalAlerts;
  
  // De Network Config
  readonly isSystemConfigured = computed(() => this.networkConfigService.isConfigured());
  readonly configuredNetwork = computed(() => this.networkConfigService.selectedNetwork());
  readonly clasificacion = computed(() => this.networkConfigService.clasificacion());
  
  // ─────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────
  
  readonly filteredAlerts = computed(() => {
    const alerts = this.alerts();
    const filters = this._filters();
    
    return alerts.filter(alert => {
      // Filtro por severidad
      if (filters.severity !== 'all' && alert.severity !== filters.severity) {
        return false;
      }
      
      // Filtro por estado
      if (filters.status !== 'all' && alert.status !== filters.status) {
        return false;
      }
      
      // Filtro por categoría
      if (filters.category !== 'all' && alert.category !== filters.category) {
        return false;
      }
      
      // Filtro por rango de tiempo
      if (filters.timeRange !== 'all') {
        const now = Date.now();
        const alertTime = alert.timestamp.getTime();
        const ranges: Record<string, number> = {
          '1h': 60 * 60 * 1000,
          '24h': 24 * 60 * 60 * 1000,
          '7d': 7 * 24 * 60 * 60 * 1000,
          '30d': 30 * 24 * 60 * 60 * 1000
        };
        if (now - alertTime > ranges[filters.timeRange]) {
          return false;
        }
      }
      
      // Filtro por búsqueda
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          alert.title.toLowerCase().includes(term) ||
          alert.sourceIP.includes(term) ||
          alert.destinationIP.includes(term) ||
          alert.category.includes(term)
        );
      }
      
      return true;
    });
  });
  
  readonly alertsByStatus = computed(() => {
    const alerts = this.alerts();
    return {
      new: alerts.filter(a => a.status === 'new').length,
      investigating: alerts.filter(a => a.status === 'investigating').length,
      contained: alerts.filter(a => a.status === 'contained').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    };
  });
  
  // ─────────────────────────────────────────────────────────────
  // COMPONENTES CONECTADOS
  // ─────────────────────────────────────────────────────────────
  
  readonly connectedComponents: ConnectedComponent[] = [
    {
      id: 'network-config',
      name: 'Network Config',
      description: 'Proporciona políticas de seguridad, nivel de alerta y clasificación',
      icon: 'settings_ethernet',
      route: '/network-config',
      dataFlow: 'receives',
      dataTypes: ['Políticas', 'Nivel de alerta', 'Clasificación'],
      status: 'active'
    },
    {
      id: 'network-flows',
      name: 'Network Flows',
      description: 'Envía flujos sospechosos y alertas en tiempo real',
      icon: 'swap_vert',
      route: '/network-flows',
      dataFlow: 'receives',
      dataTypes: ['Flujos sospechosos', 'IOCs', 'Eventos'],
      status: 'active'
    },
    {
      id: 'ml-engine',
      name: 'Motor ML',
      description: 'Envía muestras para análisis, recibe scores y predicciones',
      icon: 'psychology',
      route: '/ml-engine',
      dataFlow: 'bidirectional',
      dataTypes: ['Muestras', 'Predicciones', 'Scores ML'],
      status: 'active'
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Envía KPIs, métricas y estadísticas de amenazas',
      icon: 'dashboard',
      route: '/dashboard',
      dataFlow: 'sends',
      dataTypes: ['KPIs', 'Métricas', 'Tendencias'],
      status: 'active'
    },
    {
      id: 'siem',
      name: 'SIEM Integration',
      description: 'Exporta alertas, logs y IOCs para correlación externa',
      icon: 'hub',
      route: '/integrations/siem',
      dataFlow: 'sends',
      dataTypes: ['Alertas SIEM', 'Logs', 'IOCs'],
      status: 'active'
    },
    {
      id: 'incident-response',
      name: 'Incident Response',
      description: 'Envía incidentes para gestión y orquestación de respuesta',
      icon: 'support_agent',
      route: '/incidents',
      dataFlow: 'sends',
      dataTypes: ['Incidentes', 'Playbooks', 'Acciones'],
      status: 'active'
    }
  ];
  
  // ─────────────────────────────────────────────────────────────
  // OPCIONES DE FILTROS
  // ─────────────────────────────────────────────────────────────
  
  readonly severityOptions: { value: ThreatSeverity | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'critical', label: 'Crítica' },
    { value: 'high', label: 'Alta' },
    { value: 'medium', label: 'Media' },
    { value: 'low', label: 'Baja' },
    { value: 'info', label: 'Info' }
  ];
  
  readonly statusOptions: { value: ThreatStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'new', label: 'Nuevo' },
    { value: 'investigating', label: 'Investigando' },
    { value: 'contained', label: 'Contenido' },
    { value: 'resolved', label: 'Resuelto' },
    { value: 'false_positive', label: 'Falso Positivo' }
  ];
  
  readonly categoryOptions: { value: ThreatCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'malware', label: 'Malware' },
    { value: 'ransomware', label: 'Ransomware' },
    { value: 'apt', label: 'APT' },
    { value: 'ddos', label: 'DDoS' },
    { value: 'brute_force', label: 'Fuerza Bruta' },
    { value: 'data_exfiltration', label: 'Exfiltración' },
    { value: 'port_scan', label: 'Port Scan' },
    { value: 'c2_communication', label: 'C2' },
    { value: 'anomaly', label: 'Anomalía' }
  ];
  
  readonly timeRangeOptions = [
    { value: '1h', label: 'Última hora' },
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: 'all', label: 'Todo' }
  ];
  
  // ─────────────────────────────────────────────────────────────
  // LIFECYCLE
  // ─────────────────────────────────────────────────────────────
  
  ngOnInit(): void {
    // Iniciar monitoreo automáticamente
    this.threatService.startMonitoring();
    
    // Verificar parámetros de ruta (desde Network Flows)
    this.route.queryParams.subscribe(params => {
      if (params['flowId']) {
        console.log('Investigando flujo:', params['flowId']);
      }
      if (params['sourceIP']) {
        this._filters.update(f => ({ ...f, searchTerm: params['sourceIP'] }));
      }
    });
  }
  
  ngOnDestroy(): void {
    // No detener monitoreo al salir para mantener detección en background
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - FILTROS
  // ─────────────────────────────────────────────────────────────
  
  updateFilter<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]): void {
    this._filters.update(f => ({ ...f, [key]: value }));
  }
  
  clearFilters(): void {
    this._filters.set({
      severity: 'all',
      status: 'all',
      category: 'all',
      timeRange: '24h',
      searchTerm: ''
    });
  }
  
  setViewMode(mode: 'list' | 'grid' | 'timeline'): void {
    this._viewMode.set(mode);
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - ALERTAS
  // ─────────────────────────────────────────────────────────────
  
  selectAlert(alert: ThreatAlert): void {
    this.threatService.selectAlert(alert);
    this._showDetailPanel.set(true);
  }
  
  closeDetailPanel(): void {
    this._showDetailPanel.set(false);
    this.threatService.selectAlert(null);
  }
  
  updateAlertStatus(alertId: string, status: ThreatStatus): void {
    this.threatService.updateAlertStatus(alertId, status);
  }
  
  escalateAlert(alertId: string): void {
    this.threatService.escalateAlert(alertId);
  }
  
  addNote(): void {
    const alert = this.selectedAlert();
    const content = this._newNoteContent();
    
    if (alert && content.trim()) {
      this.threatService.addNoteToAlert(alert.id, content, 'Analyst');
      this._newNoteContent.set('');
    }
  }
  
  updateNoteContent(content: string): void {
    this._newNoteContent.set(content);
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - ACCIONES
  // ─────────────────────────────────────────────────────────────
  
  blockSourceIP(alert: ThreatAlert): void {
    this.threatService.executeAction(
      alert.id, 
      'block_ip', 
      `Bloquear IP origen: ${alert.sourceIP}`
    );
    
    // También bloquear el IOC
    const ipIOC = alert.iocs.find(i => i.type === 'ip' && i.value === alert.sourceIP);
    if (ipIOC) {
      this.threatService.blockIOC(ipIOC.id);
    }
  }
  
  isolateHost(alert: ThreatAlert): void {
    this.threatService.executeAction(
      alert.id,
      'isolate_host',
      `Aislar host: ${alert.destinationIP}`
    );
  }
  
  markAsFalsePositive(alertId: string): void {
    this.threatService.updateAlertStatus(alertId, 'false_positive');
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - MONITOREO
  // ─────────────────────────────────────────────────────────────
  
  toggleMonitoring(): void {
    if (this.isMonitoring()) {
      this.threatService.stopMonitoring();
    } else {
      this.threatService.startMonitoring();
    }
  }
  
  clearAllAlerts(): void {
    this.threatService.clearAlerts();
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - HELPERS
  // ─────────────────────────────────────────────────────────────
  
  getSeverityClass(severity: ThreatSeverity): string {
    const classes: Record<ThreatSeverity, string> = {
      'info': 'severity-info',
      'low': 'severity-low',
      'medium': 'severity-medium',
      'high': 'severity-high',
      'critical': 'severity-critical'
    };
    return classes[severity];
  }
  
  getSeverityLabel(severity: ThreatSeverity): string {
    const labels: Record<ThreatSeverity, string> = {
      'info': 'Info',
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return labels[severity];
  }
  
  getSeverityIcon(severity: ThreatSeverity): string {
    const icons: Record<ThreatSeverity, string> = {
      'info': 'info',
      'low': 'check_circle',
      'medium': 'warning',
      'high': 'error',
      'critical': 'dangerous'
    };
    return icons[severity];
  }
  
  getStatusClass(status: ThreatStatus): string {
    const classes: Record<ThreatStatus, string> = {
      'new': 'status-new',
      'investigating': 'status-investigating',
      'contained': 'status-contained',
      'resolved': 'status-resolved',
      'false_positive': 'status-false-positive'
    };
    return classes[status];
  }
  
  getStatusLabel(status: ThreatStatus): string {
    const labels: Record<ThreatStatus, string> = {
      'new': 'Nuevo',
      'investigating': 'Investigando',
      'contained': 'Contenido',
      'resolved': 'Resuelto',
      'false_positive': 'Falso Positivo'
    };
    return labels[status];
  }
  
  getStatusIcon(status: ThreatStatus): string {
    const icons: Record<ThreatStatus, string> = {
      'new': 'fiber_new',
      'investigating': 'search',
      'contained': 'shield',
      'resolved': 'check_circle',
      'false_positive': 'cancel'
    };
    return icons[status];
  }
  
  getCategoryIcon(category: ThreatCategory): string {
    const icons: Record<ThreatCategory, string> = {
      'malware': 'bug_report',
      'ransomware': 'lock',
      'phishing': 'phishing',
      'apt': 'psychology',
      'ddos': 'flash_on',
      'brute_force': 'vpn_key',
      'data_exfiltration': 'cloud_upload',
      'insider_threat': 'person_off',
      'port_scan': 'search',
      'privilege_escalation': 'trending_up',
      'lateral_movement': 'swap_horiz',
      'c2_communication': 'cell_tower',
      'anomaly': 'analytics',
      'policy_violation': 'gavel'
    };
    return icons[category];
  }
  
  getCategoryLabel(category: ThreatCategory): string {
    const labels: Record<ThreatCategory, string> = {
      'malware': 'Malware',
      'ransomware': 'Ransomware',
      'phishing': 'Phishing',
      'apt': 'APT',
      'ddos': 'DDoS',
      'brute_force': 'Fuerza Bruta',
      'data_exfiltration': 'Exfiltración',
      'insider_threat': 'Amenaza Interna',
      'port_scan': 'Port Scan',
      'privilege_escalation': 'Escalación',
      'lateral_movement': 'Mov. Lateral',
      'c2_communication': 'C2',
      'anomaly': 'Anomalía',
      'policy_violation': 'Violación'
    };
    return labels[category];
  }
  
  getMitreTacticLabel(tactic: MitrePhase): string {
    const labels: Record<MitrePhase, string> = {
      'reconnaissance': 'Reconocimiento',
      'resource_development': 'Desarrollo de Recursos',
      'initial_access': 'Acceso Inicial',
      'execution': 'Ejecución',
      'persistence': 'Persistencia',
      'privilege_escalation': 'Escalación de Privilegios',
      'defense_evasion': 'Evasión de Defensa',
      'credential_access': 'Acceso a Credenciales',
      'discovery': 'Descubrimiento',
      'lateral_movement': 'Movimiento Lateral',
      'collection': 'Colección',
      'command_and_control': 'Comando y Control',
      'exfiltration': 'Exfiltración',
      'impact': 'Impacto'
    };
    return labels[tactic];
  }
  
  getDataFlowIcon(dataFlow: ConnectedComponent['dataFlow']): string {
    const icons: Record<ConnectedComponent['dataFlow'], string> = {
      'sends': 'arrow_forward',
      'receives': 'arrow_back',
      'bidirectional': 'swap_horiz'
    };
    return icons[dataFlow];
  }
  
  formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }
  
  trackByAlertId(index: number, alert: ThreatAlert): string {
    return alert.id;
  }
  
  trackByComponentId(index: number, component: ConnectedComponent): string {
    return component.id;
  }
}