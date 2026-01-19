// ============================================================
// SENTINEL-ML - THREAT DETECTION SERVICE
// Servicio de Detección de Amenazas
// Gestiona alertas, incidentes y respuesta a amenazas
// ============================================================

import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IOC, ThreatAction, ThreatAlert, ThreatNote, ThreatRule, ThreatStatistics } from '../models/threat/index-threat';
import { MitrePhase, ThreatCategory, ThreatSeverity, ThreatStatus } from '../types-emuns/index-te';

// ─────────────────────────────────────────────────────────────
// TIPOS Y ENUMS
// ─────────────────────────────────────────────────────────────



// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────



@Injectable({
  providedIn: 'root'
})
export class ThreatDetectionService {
  
  // ─────────────────────────────────────────────────────────────
  // ESTADO PRIVADO
  // ─────────────────────────────────────────────────────────────
  
  private readonly _alerts = signal<ThreatAlert[]>([]);
  private readonly _selectedAlert = signal<ThreatAlert | null>(null);
  private readonly _iocs = signal<IOC[]>([]);
  private readonly _rules = signal<ThreatRule[]>([]);
  private readonly _isMonitoring = signal<boolean>(false);
  
  // Para notificaciones en tiempo real
  private readonly alertsSubject = new BehaviorSubject<ThreatAlert[]>([]);
  private readonly newAlertSubject = new BehaviorSubject<ThreatAlert | null>(null);
  
  // Simulación
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  
  // ─────────────────────────────────────────────────────────────
  // ESTADO PÚBLICO
  // ─────────────────────────────────────────────────────────────
  
  readonly alerts = this._alerts.asReadonly();
  readonly selectedAlert = this._selectedAlert.asReadonly();
  readonly iocs = this._iocs.asReadonly();
  readonly rules = this._rules.asReadonly();
  readonly isMonitoring = this._isMonitoring.asReadonly();
  
  readonly alerts$ = this.alertsSubject.asObservable();
  readonly newAlert$ = this.newAlertSubject.asObservable();
  
  // ─────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────
  
  readonly statistics = computed<ThreatStatistics>(() => {
    const alerts = this._alerts();
    
    const byStatus = {
      new: alerts.filter(a => a.status === 'new').length,
      investigating: alerts.filter(a => a.status === 'investigating').length,
      contained: alerts.filter(a => a.status === 'contained').length,
      resolved: alerts.filter(a => a.status === 'resolved').length,
      false_positive: alerts.filter(a => a.status === 'false_positive').length
    };
    
    const bySeverity = {
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      info: alerts.filter(a => a.severity === 'info').length
    };
    
    // Top categorías
    const categoryCount = new Map<ThreatCategory, number>();
    alerts.forEach(a => {
      categoryCount.set(a.category, (categoryCount.get(a.category) || 0) + 1);
    });
    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top IPs origen
    const ipCount = new Map<string, number>();
    alerts.forEach(a => {
      ipCount.set(a.sourceIP, (ipCount.get(a.sourceIP) || 0) + 1);
    });
    const topSourceIPs = Array.from(ipCount.entries())
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Top tácticas MITRE
    const tacticCount = new Map<MitrePhase, number>();
    alerts.filter(a => a.mitreTactic).forEach(a => {
      tacticCount.set(a.mitreTactic!, (tacticCount.get(a.mitreTactic!) || 0) + 1);
    });
    const topMitreTactics = Array.from(tacticCount.entries())
      .map(([tactic, count]) => ({ tactic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    return {
      totalAlerts: alerts.length,
      newAlerts: byStatus.new,
      investigatingAlerts: byStatus.investigating,
      containedAlerts: byStatus.contained,
      resolvedAlerts: byStatus.resolved,
      falsePositives: byStatus.false_positive,
      
      criticalCount: bySeverity.critical,
      highCount: bySeverity.high,
      mediumCount: bySeverity.medium,
      lowCount: bySeverity.low,
      infoCount: bySeverity.info,
      
      averageResponseTime: 15 + Math.random() * 30,
      mttr: 45 + Math.random() * 60,
      
      topCategories,
      topSourceIPs,
      topMitreTactics,
      
      alertsPerHour: Array.from({ length: 24 }, () => Math.floor(Math.random() * 20)),
      trendsLastWeek: this.generateWeeklyTrends()
    };
  });
  
  readonly criticalAlerts = computed(() => 
    this._alerts().filter(a => a.severity === 'critical' && a.status === 'new')
  );
  
  readonly activeAlerts = computed(() => 
    this._alerts().filter(a => ['new', 'investigating'].includes(a.status))
  );
  
  readonly blockedIOCs = computed(() => 
    this._iocs().filter(i => i.isBlocked)
  );
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - GESTIÓN DE ALERTAS
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Agrega una nueva alerta al sistema
   */
  addAlert(alert: Omit<ThreatAlert, 'id' | 'timestamp' | 'notes' | 'actions' | 'isEscalated' | 'relatedAlerts'>): ThreatAlert {
    const newAlert: ThreatAlert = {
      ...alert,
      id: this.generateId('ALERT'),
      timestamp: new Date(),
      notes: [],
      actions: [],
      isEscalated: false,
      relatedAlerts: []
    };
    
    this._alerts.update(alerts => [newAlert, ...alerts]);
    this.alertsSubject.next(this._alerts());
    this.newAlertSubject.next(newAlert);
    
    // Extraer IOCs automáticamente
    if (alert.iocs) {
      alert.iocs.forEach(ioc => this.addIOC(ioc));
    }
    
    return newAlert;
  }
  
  /**
   * Crea alerta desde un flujo de red sospechoso
   */
  createAlertFromFlow(flow: {
    id: string;
    sourceIP: string;
    sourcePort: number;
    destinationIP: string;
    destinationPort: number;
    protocol: string;
    threatType: string;
    threatScore: number;
    mlPrediction?: { confidence: number; modelUsed: string };
  }): ThreatAlert {
    
    const category = this.mapThreatTypeToCategory(flow.threatType);
    const severity = this.calculateSeverity(flow.threatScore);
    const mitre = this.mapCategoryToMitre(category);
    
    return this.addAlert({
      severity,
      status: 'new',
      category,
      title: this.generateAlertTitle(category, flow.sourceIP),
      description: this.generateAlertDescription(category, flow),
      sourceIP: flow.sourceIP,
      sourcePort: flow.sourcePort,
      sourceGeo: this.getRandomGeo(),
      destinationIP: flow.destinationIP,
      destinationPort: flow.destinationPort,
      mlScore: flow.threatScore,
      mlModel: flow.mlPrediction?.modelUsed || 'SENTINEL-ML',
      confidence: flow.mlPrediction?.confidence || 0.85,
      mitreTactic: mitre.tactic,
      mitreTechnique: mitre.technique,
      mitreTechniqueId: mitre.id,
      iocs: this.extractIOCs(flow),
      flowId: flow.id
    });
  }
  
  /**
   * Actualiza el estado de una alerta
   */
  updateAlertStatus(alertId: string, status: ThreatStatus): void {
    this._alerts.update(alerts => 
      alerts.map(a => a.id === alertId ? { ...a, status } : a)
    );
    this.alertsSubject.next(this._alerts());
  }
  
  /**
   * Selecciona una alerta para ver detalles
   */
  selectAlert(alert: ThreatAlert | null): void {
    this._selectedAlert.set(alert);
  }
  
  /**
   * Agrega una nota a una alerta
   */
  addNoteToAlert(alertId: string, content: string, author: string = 'Analyst'): void {
    const note: ThreatNote = {
      id: this.generateId('NOTE'),
      timestamp: new Date(),
      author,
      content
    };
    
    this._alerts.update(alerts => 
      alerts.map(a => a.id === alertId 
        ? { ...a, notes: [...a.notes, note] } 
        : a
      )
    );
  }
  
  /**
   * Ejecuta una acción de respuesta
   */
  executeAction(alertId: string, actionType: ThreatAction['type'], description: string): ThreatAction {
    const action: ThreatAction = {
      id: this.generateId('ACTION'),
      timestamp: new Date(),
      type: actionType,
      description,
      status: 'in_progress',
      executedBy: 'System'
    };
    
    this._alerts.update(alerts => 
      alerts.map(a => a.id === alertId 
        ? { ...a, actions: [...a.actions, action] } 
        : a
      )
    );
    
    // Simular ejecución
    setTimeout(() => {
      this._alerts.update(alerts => 
        alerts.map(a => {
          if (a.id === alertId) {
            return {
              ...a,
              actions: a.actions.map(act => 
                act.id === action.id 
                  ? { ...act, status: 'completed' as const, result: 'Acción ejecutada exitosamente' }
                  : act
              )
            };
          }
          return a;
        })
      );
    }, 2000);
    
    return action;
  }
  
  /**
   * Escala una alerta
   */
  escalateAlert(alertId: string): void {
    this._alerts.update(alerts => 
      alerts.map(a => a.id === alertId 
        ? { ...a, isEscalated: true, severity: 'critical' as ThreatSeverity } 
        : a
      )
    );
  }
  
  /**
   * Relaciona alertas entre sí
   */
  relateAlerts(alertId: string, relatedIds: string[]): void {
    this._alerts.update(alerts => 
      alerts.map(a => a.id === alertId 
        ? { ...a, relatedAlerts: [...new Set([...a.relatedAlerts, ...relatedIds])] } 
        : a
      )
    );
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - GESTIÓN DE IOCs
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Agrega un IOC
   */
  addIOC(ioc: Omit<IOC, 'id' | 'firstSeen' | 'lastSeen'>): IOC {
    const existing = this._iocs().find(i => i.type === ioc.type && i.value === ioc.value);
    
    if (existing) {
      this._iocs.update(iocs => 
        iocs.map(i => i.id === existing.id ? { ...i, lastSeen: new Date() } : i)
      );
      return existing;
    }
    
    const newIOC: IOC = {
      ...ioc,
      id: this.generateId('IOC'),
      firstSeen: new Date(),
      lastSeen: new Date()
    };
    
    this._iocs.update(iocs => [...iocs, newIOC]);
    return newIOC;
  }
  
  /**
   * Bloquea un IOC
   */
  blockIOC(iocId: string): void {
    this._iocs.update(iocs => 
      iocs.map(i => i.id === iocId ? { ...i, isBlocked: true } : i)
    );
  }
  
  /**
   * Desbloquea un IOC
   */
  unblockIOC(iocId: string): void {
    this._iocs.update(iocs => 
      iocs.map(i => i.id === iocId ? { ...i, isBlocked: false } : i)
    );
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - MONITOREO
  // ─────────────────────────────────────────────────────────────
  
  /**
   * Inicia el monitoreo de amenazas
   */
  startMonitoring(): void {
    if (this._isMonitoring()) return;
    
    this._isMonitoring.set(true);
    
    // Simular detección de amenazas periódica
    this.monitoringInterval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% probabilidad de nueva alerta
        this.generateSimulatedAlert();
      }
    }, 5000);
  }
  
  /**
   * Detiene el monitoreo
   */
  stopMonitoring(): void {
    this._isMonitoring.set(false);
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  /**
   * Limpia todas las alertas
   */
  clearAlerts(): void {
    this._alerts.set([]);
    this.alertsSubject.next([]);
  }
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS - HELPERS
  // ─────────────────────────────────────────────────────────────
  
  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private mapThreatTypeToCategory(threatType: string): ThreatCategory {
    const mapping: Record<string, ThreatCategory> = {
      'port_scan': 'port_scan',
      'ddos': 'ddos',
      'exfiltration': 'data_exfiltration',
      'malware': 'malware',
      'brute_force': 'brute_force',
      'apt': 'apt',
      'anomaly': 'anomaly'
    };
    return mapping[threatType] || 'anomaly';
  }
  
  private calculateSeverity(score: number): ThreatSeverity {
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 50) return 'medium';
    if (score >= 30) return 'low';
    return 'info';
  }
  
  private mapCategoryToMitre(category: ThreatCategory): { tactic: MitrePhase; technique: string; id: string } {
    const mapping: Record<ThreatCategory, { tactic: MitrePhase; technique: string; id: string }> = {
      'malware': { tactic: 'execution', technique: 'User Execution', id: 'T1204' },
      'ransomware': { tactic: 'impact', technique: 'Data Encrypted for Impact', id: 'T1486' },
      'phishing': { tactic: 'initial_access', technique: 'Phishing', id: 'T1566' },
      'apt': { tactic: 'persistence', technique: 'Create Account', id: 'T1136' },
      'ddos': { tactic: 'impact', technique: 'Network Denial of Service', id: 'T1498' },
      'brute_force': { tactic: 'credential_access', technique: 'Brute Force', id: 'T1110' },
      'data_exfiltration': { tactic: 'exfiltration', technique: 'Exfiltration Over C2 Channel', id: 'T1041' },
      'insider_threat': { tactic: 'collection', technique: 'Data from Local System', id: 'T1005' },
      'port_scan': { tactic: 'reconnaissance', technique: 'Active Scanning', id: 'T1595' },
      'privilege_escalation': { tactic: 'privilege_escalation', technique: 'Exploitation for Privilege Escalation', id: 'T1068' },
      'lateral_movement': { tactic: 'lateral_movement', technique: 'Remote Services', id: 'T1021' },
      'c2_communication': { tactic: 'command_and_control', technique: 'Application Layer Protocol', id: 'T1071' },
      'anomaly': { tactic: 'discovery', technique: 'System Information Discovery', id: 'T1082' },
      'policy_violation': { tactic: 'defense_evasion', technique: 'Indicator Removal', id: 'T1070' }
    };
    return mapping[category];
  }
  
  private generateAlertTitle(category: ThreatCategory, sourceIP: string): string {
    const titles: Record<ThreatCategory, string> = {
      'malware': `Malware detectado desde ${sourceIP}`,
      'ransomware': `Actividad de Ransomware desde ${sourceIP}`,
      'phishing': `Intento de Phishing desde ${sourceIP}`,
      'apt': `Comportamiento APT detectado - ${sourceIP}`,
      'ddos': `Ataque DDoS desde ${sourceIP}`,
      'brute_force': `Ataque de Fuerza Bruta desde ${sourceIP}`,
      'data_exfiltration': `Posible Exfiltración de Datos hacia ${sourceIP}`,
      'insider_threat': `Amenaza Interna detectada - ${sourceIP}`,
      'port_scan': `Escaneo de Puertos desde ${sourceIP}`,
      'privilege_escalation': `Escalación de Privilegios - ${sourceIP}`,
      'lateral_movement': `Movimiento Lateral detectado - ${sourceIP}`,
      'c2_communication': `Comunicación C2 sospechosa - ${sourceIP}`,
      'anomaly': `Anomalía de Tráfico desde ${sourceIP}`,
      'policy_violation': `Violación de Política - ${sourceIP}`
    };
    return titles[category];
  }
  
  private generateAlertDescription(category: ThreatCategory, flow: any): string {
    return `Se detectó actividad sospechosa de tipo "${category}" originada desde ${flow.sourceIP}:${flow.sourcePort} ` +
           `hacia ${flow.destinationIP}:${flow.destinationPort} usando protocolo ${flow.protocol}. ` +
           `Score de amenaza ML: ${flow.threatScore}%. Requiere investigación inmediata.`;
  }
  
  private extractIOCs(flow: any): IOC[] {
    const iocs: IOC[] = [];
    
    // IP origen como IOC si es externo/malicioso
    if (!flow.sourceIP.startsWith('10.') && !flow.sourceIP.startsWith('192.168.')) {
      iocs.push({
        id: '',
        type: 'ip',
        value: flow.sourceIP,
        confidence: 0.8,
        source: 'SENTINEL-ML Flow Analysis',
        firstSeen: new Date(),
        lastSeen: new Date(),
        isBlocked: false
      });
    }
    
    return iocs;
  }
  
  private getRandomGeo(): string {
    const countries = ['Rusia', 'China', 'Corea del Norte', 'Irán', 'Estados Unidos', 'Brasil', 'Alemania', 'Desconocido'];
    return countries[Math.floor(Math.random() * countries.length)];
  }
  
  private generateWeeklyTrends(): { date: string; count: number }[] {
    const trends = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 10
      });
    }
    
    return trends;
  }
  
  private generateSimulatedAlert(): void {
    const categories: ThreatCategory[] = [
      'malware', 'port_scan', 'brute_force', 'anomaly', 
      'data_exfiltration', 'c2_communication', 'ddos'
    ];
    
    const category = categories[Math.floor(Math.random() * categories.length)];
    const score = 40 + Math.floor(Math.random() * 60);
    const sourceIP = `${Math.floor(Math.random() * 200) + 50}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    this.createAlertFromFlow({
      id: this.generateId('FLOW'),
      sourceIP,
      sourcePort: 1024 + Math.floor(Math.random() * 64000),
      destinationIP: `10.0.${Math.floor(Math.random() * 5)}.${Math.floor(Math.random() * 255)}`,
      destinationPort: [22, 80, 443, 3389, 445][Math.floor(Math.random() * 5)],
      protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
      threatType: category,
      threatScore: score,
      mlPrediction: {
        confidence: 0.7 + Math.random() * 0.3,
        modelUsed: 'SENTINEL-ML Threat Detector v2.1'
      }
    });
  }
}