import { Injectable } from '@angular/core';
import { FlowStatus } from '../models';

@Injectable({ providedIn: 'root' })
export class FlowStatusService {

  private readonly statuses: FlowStatus[] = [
    'normal',
    'warning',
    'critical',
    'blocked'
  ];

  getAll(): FlowStatus[] {
    return [...this.statuses];
  }

  isValid(status: FlowStatus): boolean {
    return this.statuses.includes(status);
  }
}
