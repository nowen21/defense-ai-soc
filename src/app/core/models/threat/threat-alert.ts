import { MitrePhase, ThreatCategory, ThreatSeverity, ThreatStatus } from "../../types-emuns/index-te";
import { ThreatAction, ThreatNote } from "./index-threat";
import { IOC } from "./threat-ioc";

export interface ThreatAlert {
  id: string;
  timestamp: Date;
  severity: ThreatSeverity;
  status: ThreatStatus;
  category: ThreatCategory;
  
  // Información del evento
  title: string;
  description: string;
  
  // Origen
  sourceIP: string;
  sourcePort?: number;
  sourceHostname?: string;
  sourceGeo?: string;
  
  // Destino
  destinationIP: string;
  destinationPort?: number;
  destinationHostname?: string;
  
  // Análisis
  mlScore: number; // 0-100
  mlModel: string;
  confidence: number; // 0-1
  
  // MITRE ATT&CK
  mitreTactic?: MitrePhase;
  mitreTechnique?: string;
  mitreTechniqueId?: string;
  
  // IOCs
  iocs: IOC[];
  
  // Evidencia
  rawLog?: string;
  packetCapture?: string;
  
  // Respuesta
  assignedTo?: string;
  notes: ThreatNote[];
  actions: ThreatAction[];
  
  // Metadatos
  flowId?: string;
  ruleId?: string;
  isEscalated: boolean;
  relatedAlerts: string[];
}