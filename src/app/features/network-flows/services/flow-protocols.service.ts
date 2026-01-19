import { Injectable } from '@angular/core';
import { FlowProtocol } from '../models';

@Injectable({ providedIn: 'root' })
export class FlowProtocolsService {

  private readonly protocols: FlowProtocol[] = [
    'TCP', 'UDP', 'ICMP', 'HTTP', 'HTTPS', 'DNS', 'SSH', 'RDP', 'FTP', 'SMTP', 'MODBUS', 'DNP3'
  ];

  getAll(): FlowProtocol[] {
    return [...this.protocols];
  }

  exists(protocol: FlowProtocol): boolean {
    return this.protocols.includes(protocol);
  }
}
