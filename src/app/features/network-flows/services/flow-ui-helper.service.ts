import { Injectable } from '@angular/core';
import {
  FlowStatus,
  ThreatType,
  FlowDirection,
  NetworkNode,
  ConnectedComponent,
  NetworkFlow
} from '../models';

@Injectable({ providedIn: 'root' })
export class FlowUiHelperService {

  getStatusClass(status: FlowStatus): string {
    const classes: Record<FlowStatus, string> = {
      normal: 'status-normal',
      warning: 'status-warning',
      critical: 'status-critical',
      blocked: 'status-blocked'
    };
    return classes[status];
  }

  getStatusLabel(status: FlowStatus): string {
    const labels: Record<FlowStatus, string> = {
      normal: 'Normal',
      warning: 'Alerta',
      critical: 'Crítico',
      blocked: 'Bloqueado'
    };
    return labels[status];
  }

  getThreatLabel(threat: ThreatType): string {
    const labels: Record<ThreatType, string> = {
      none: '-',
      port_scan: 'Port Scan',
      ddos: 'DDoS',
      exfiltration: 'Exfiltración',
      malware: 'Malware',
      brute_force: 'Fuerza Bruta',
      apt: 'APT',
      anomaly: 'Anomalía'
    };
    return labels[threat];
  }

  getThreatIcon(threat: ThreatType): string {
    const icons: Record<ThreatType, string> = {
      none: 'check_circle',
      port_scan: 'search',
      ddos: 'flash_on',
      exfiltration: 'cloud_upload',
      malware: 'bug_report',
      brute_force: 'vpn_key',
      apt: 'psychology',
      anomaly: 'warning'
    };
    return icons[threat];
  }

  getDirectionIcon(direction: FlowDirection): string {
    const icons: Record<FlowDirection, string> = {
      inbound: 'arrow_downward',
      outbound: 'arrow_upward',
      lateral: 'swap_horiz'
    };
    return icons[direction];
  }

  getNodeIcon(type: NetworkNode['type']): string {
    const icons: Record<NetworkNode['type'], string> = {
      firewall: 'security',
      router: 'router',
      switch: 'device_hub',
      server: 'dns',
      workstation: 'computer',
      iot: 'sensors',
      external: 'public',
      attacker: 'person_off'
    };
    return icons[type];
  }

  getDataFlowIcon(dataFlow: ConnectedComponent['dataFlow']): string {
    const icons: Record<ConnectedComponent['dataFlow'], string> = {
      sends: 'arrow_forward',
      receives: 'arrow_back',
      bidirectional: 'swap_horiz'
    };
    return icons[dataFlow];
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  formatDuration(ms: number): string {
    if (ms < 1000) return ms + 'ms';
    if (ms < 60000) return (ms / 1000).toFixed(1) + 's';
    return (ms / 60000).toFixed(1) + 'm';
  }

  trackByFlowId(index: number, flow: NetworkFlow): string {
    return flow.id;
  }

  trackByComponentId(index: number, component: ConnectedComponent): string {
    return component.id;
  }

  trackByNodeId(index: number, node: NetworkNode): string {
    return node.id;
  }
}
