import { Injectable } from '@angular/core';
import { NetworkNode } from '../models';

@Injectable({ providedIn: 'root' })
export class NetworkTopologyService {

  private readonly nodes: NetworkNode[] = [
    { id: 'fw1', name: 'Firewall Principal', type: 'firewall', ip: '10.0.0.1', status: 'online', x: 50, y: 50, connections: ['r1', 'ext1'] },
    { id: 'r1', name: 'Router Core', type: 'router', ip: '10.0.1.1', status: 'online', x: 150, y: 50, connections: ['fw1', 'sw1', 'sw2'] },
    { id: 'sw1', name: 'Switch DMZ', type: 'switch', ip: '10.0.2.1', status: 'online', x: 100, y: 120, connections: ['r1', 'srv1', 'srv2'] },
    { id: 'sw2', name: 'Switch LAN', type: 'switch', ip: '10.0.3.1', status: 'online', x: 200, y: 120, connections: ['r1', 'ws1', 'ws2', 'ws3'] },
    { id: 'srv1', name: 'Servidor Web', type: 'server', ip: '10.0.2.10', status: 'online', x: 50, y: 180, connections: ['sw1'] },
    { id: 'srv2', name: 'Servidor BD', type: 'server', ip: '10.0.2.11', status: 'online', x: 150, y: 180, connections: ['sw1'] },
    { id: 'ws1', name: 'Workstation 1', type: 'workstation', ip: '10.0.3.101', status: 'online', x: 180, y: 180, connections: ['sw2'] },
    { id: 'ws2', name: 'Workstation 2', type: 'workstation', ip: '10.0.3.102', status: 'online', x: 220, y: 180, connections: ['sw2'] },
    { id: 'ws3', name: 'IoT Sensor', type: 'iot', ip: '10.0.3.200', status: 'online', x: 260, y: 180, connections: ['sw2'] },
    { id: 'ext1', name: 'Internet', type: 'external', ip: '0.0.0.0', status: 'online', x: 50, y: 0, connections: ['fw1'] },
    { id: 'att1', name: 'Atacante', type: 'attacker', ip: '185.220.101.45', status: 'scanning', x: 0, y: 50, connections: [] }
  ];

  getNodes(): NetworkNode[] {
    return structuredClone(this.nodes);
  }

  getNode(id: string): NetworkNode | undefined {
    return this.nodes.find(n => n.id === id);
  }

  updateStatus(id: string, status: NetworkNode['status']): void {
    const node = this.nodes.find(n => n.id === id);
    if (node) node.status = status;
  }

  connect(a: string, b: string): void {
    const na = this.getNode(a);
    const nb = this.getNode(b);
    if (na && nb) {
      if (!na.connections.includes(b)) na.connections.push(b);
      if (!nb.connections.includes(a)) nb.connections.push(a);
    }
  }
}
