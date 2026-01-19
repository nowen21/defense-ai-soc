export interface ThreatAction {
  id: string;
  timestamp: Date;
  type: 'block_ip' | 'isolate_host' | 'kill_process' | 'quarantine_file' | 'reset_password' | 'disable_account' | 'custom';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  executedBy: string;
  result?: string;
}