import { Injectable } from '@angular/core';
import { MitrePhase, ThreatCategory, ThreatSeverity, ThreatStatus } from '../types-emuns/index-te';
import { ConnectedComponent } from '../../features/network-flows/models';
import { ThreatAlert } from '../models/threat/threat-alert';


@Injectable({ providedIn: 'root' })
export class ThreatUiHelper {

  getSeverityClass(severity: ThreatSeverity): string {
    return {
      info: 'severity-info',
      low: 'severity-low',
      medium: 'severity-medium',
      high: 'severity-high',
      critical: 'severity-critical'
    }[severity];
  }

  getSeverityLabel(severity: ThreatSeverity): string {
    return {
      info: 'Info',
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    }[severity];
  }

  getSeverityIcon(severity: ThreatSeverity): string {
    return {
      info: 'info',
      low: 'check_circle',
      medium: 'warning',
      high: 'error',
      critical: 'dangerous'
    }[severity];
  }

  getStatusClass(status: ThreatStatus): string {
    return {
      new: 'status-new',
      investigating: 'status-investigating',
      contained: 'status-contained',
      resolved: 'status-resolved',
      false_positive: 'status-false-positive'
    }[status];
  }

  getStatusLabel(status: ThreatStatus): string {
    return {
      new: 'Nuevo',
      investigating: 'Investigando',
      contained: 'Contenido',
      resolved: 'Resuelto',
      false_positive: 'Falso Positivo'
    }[status];
  }

  getStatusIcon(status: ThreatStatus): string {
    return {
      new: 'fiber_new',
      investigating: 'search',
      contained: 'shield',
      resolved: 'check_circle',
      false_positive: 'cancel'
    }[status];
  }

  getCategoryIcon(category: ThreatCategory): string {
    return {
      malware: 'bug_report',
      ransomware: 'lock',
      phishing: 'phishing',
      apt: 'psychology',
      ddos: 'flash_on',
      brute_force: 'vpn_key',
      data_exfiltration: 'cloud_upload',
      insider_threat: 'person_off',
      port_scan: 'search',
      privilege_escalation: 'trending_up',
      lateral_movement: 'swap_horiz',
      c2_communication: 'cell_tower',
      anomaly: 'analytics',
      policy_violation: 'gavel'
    }[category];
  }

  getCategoryLabel(category: ThreatCategory): string {
    return {
      malware: 'Malware',
      ransomware: 'Ransomware',
      phishing: 'Phishing',
      apt: 'APT',
      ddos: 'DDoS',
      brute_force: 'Fuerza Bruta',
      data_exfiltration: 'Exfiltración',
      insider_threat: 'Amenaza Interna',
      port_scan: 'Port Scan',
      privilege_escalation: 'Escalación',
      lateral_movement: 'Mov. Lateral',
      c2_communication: 'C2',
      anomaly: 'Anomalía',
      policy_violation: 'Violación'
    }[category];
  }

  getMitreTacticLabel(tactic: MitrePhase): string {
    return {
      reconnaissance: 'Reconocimiento',
      resource_development: 'Desarrollo de Recursos',
      initial_access: 'Acceso Inicial',
      execution: 'Ejecución',
      persistence: 'Persistencia',
      privilege_escalation: 'Escalación de Privilegios',
      defense_evasion: 'Evasión de Defensa',
      credential_access: 'Acceso a Credenciales',
      discovery: 'Descubrimiento',
      lateral_movement: 'Movimiento Lateral',
      collection: 'Colección',
      command_and_control: 'Comando y Control',
      exfiltration: 'Exfiltración',
      impact: 'Impacto'
    }[tactic];
  }

  getDataFlowIcon(flow: ConnectedComponent['dataFlow']): string {
    return {
      sends: 'arrow_forward',
      receives: 'arrow_back',
      bidirectional: 'swap_horiz'
    }[flow];
  }

  formatTimeAgo(date: Date): string {
    const s = Math.floor((Date.now() - date.getTime()) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  }

  trackByAlertId(_: number, alert: ThreatAlert): string {
    return alert.id;
  }

  trackByComponentId(_: number, c: ConnectedComponent): string {
    return c.id;
  }
}
