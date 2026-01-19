import { MitrePhase, ThreatCategory } from "../../types-emuns/index-te";

export interface ThreatStatistics {
  totalAlerts: number;
  newAlerts: number;
  investigatingAlerts: number;
  containedAlerts: number;
  resolvedAlerts: number;
  falsePositives: number;
  
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  
  averageResponseTime: number; // minutos
  mttr: number; // Mean Time To Resolve (minutos)
  
  topCategories: { category: ThreatCategory; count: number }[];
  topSourceIPs: { ip: string; count: number }[];
  topMitreTactics: { tactic: MitrePhase; count: number }[];
  
  alertsPerHour: number[];
  trendsLastWeek: { date: string; count: number }[];
}