import { ThreatCategory, ThreatSeverity } from "../../types-emuns/index-te";
import { RuleCondition } from "./index-threat";

export interface ThreatRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: ThreatSeverity;
  category: ThreatCategory;
  conditions: RuleCondition[];
  actions: string[];
  mitreTechnique?: string;
  createdAt: Date;
  updatedAt: Date;
  triggeredCount: number;
}