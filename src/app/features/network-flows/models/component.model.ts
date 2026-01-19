export interface ConnectedComponent {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  dataFlow: 'sends' | 'receives' | 'bidirectional';
  dataTypes: string[];
  status: 'active' | 'inactive' | 'error';
}