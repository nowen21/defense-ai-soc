export interface NetworkNode {
  id: string;
  name: string;
  type: 'firewall' | 'router' | 'switch' | 'server' | 'workstation' | 'iot' | 'external' | 'attacker';
  ip: string;
  status: 'online' | 'offline' | 'compromised' | 'scanning';
  x: number;
  y: number;
  connections: string[];
}