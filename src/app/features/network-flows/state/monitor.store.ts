import { Injectable, computed, signal } from '@angular/core';
import { NetworkFlow } from '../models';

@Injectable({ providedIn: 'root' })
export class MonitorStore {

  private readonly _flows = signal<NetworkFlow[]>([]);
  private readonly _filterProtocol = signal<'ALL' | NetworkFlow['protocol']>('ALL');
  private readonly _filterStatus = signal<'ALL' | NetworkFlow['status']>('ALL');
  private readonly _showOnlyThreats = signal(false);

  // ─────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────

  readonly filteredFlows = computed(() => {
    let result = this._flows();

    if (this._filterProtocol() !== 'ALL') {
      result = result.filter(f => f.protocol === this._filterProtocol());
    }

    if (this._filterStatus() !== 'ALL') {
      result = result.filter(f => f.status === this._filterStatus());
    }

    if (this._showOnlyThreats()) {
      result = result.filter(f => f.threatType !== 'none');
    }

    return result.slice(0, 50);
  });

  readonly threatFlows = computed(() =>
    this._flows().filter(f => f.threatType !== 'none')
  );

  readonly criticalFlows = computed(() =>
    this._flows().filter(f => f.status === 'critical')
  );

  // ─────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────

  setFlows(flows: NetworkFlow[]) {
    this._flows.set(flows);
  }

  setProtocolFilter(protocol: 'ALL' | NetworkFlow['protocol']) {
    this._filterProtocol.set(protocol);
  }

  setStatusFilter(status: 'ALL' | NetworkFlow['status']) {
    this._filterStatus.set(status);
  }

  toggleOnlyThreats(value: boolean) {
    this._showOnlyThreats.set(value);
  }
}
