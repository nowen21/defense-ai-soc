export interface FlowStatistics {
  totalFlows: number;
  flowsPerSecond: number;
  bytesPerSecond: number;
  packetsPerSecond: number;
  activeConnections: number;
  blockedConnections: number;
  threatsDetected: number;
  anomaliesDetected: number;
}