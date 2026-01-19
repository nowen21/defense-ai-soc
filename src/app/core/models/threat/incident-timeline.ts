export interface IncidentTimeline {
  id: string;
  timestamp: Date;
  type: 'alert' | 'action' | 'note' | 'status_change' | 'escalation';
  title: string;
  description: string;
  actor?: string;
}