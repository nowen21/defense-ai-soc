export interface IOC {
  id: string;
  type: 'ip' | 'domain' | 'url' | 'hash_md5' | 'hash_sha256' | 'email' | 'file_name' | 'registry' | 'mutex';
  value: string;
  confidence: number;
  source: string;
  firstSeen: Date;
  lastSeen: Date;
  isBlocked: boolean;
}