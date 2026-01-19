import { MLPrediction } from "./ml-prediction.model";

export type FlowStatus = 'normal' | 'warning' | 'critical' | 'blocked';
export type FlowProtocol = 'TCP' | 'UDP' | 'ICMP' | 'HTTP' | 'HTTPS' | 'DNS' | 'SSH' | 'RDP' | 'FTP' | 'SMTP' | 'MODBUS' | 'DNP3';
export type FlowDirection = 'inbound' | 'outbound' | 'lateral';
export type ThreatType = 'none' | 'port_scan' | 'ddos' | 'exfiltration' | 'malware' | 'brute_force' | 'apt' | 'anomaly';

export interface NetworkFlow {
  id: string;
  timestamp: Date;
  sourceIP: string;
  sourcePort: number;
  destinationIP: string;
  destinationPort: number;
  protocol: FlowProtocol;
  direction: FlowDirection;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  duration: number; // milliseconds
  status: FlowStatus;
  threatType: ThreatType;
  threatScore: number; // 0-100
  geoSource?: string;
  geoDestination?: string;
  applicationLayer?: string;
  mlPrediction?: MLPrediction;
}