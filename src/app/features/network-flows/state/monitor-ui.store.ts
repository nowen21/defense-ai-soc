import { inject, Injectable, signal } from '@angular/core';
import { NetworkFlow, FlowProtocol, FlowStatus } from '../models';
import { FlowStatisticsService } from '../services/flow-statistics.service';
import { FlowSimulatorService } from '../services/flow-simulator.service';

@Injectable({ providedIn: 'root' })
export class MonitorUiStore {

    // Dependencias (las dejas como ya las vienes usando)
    private simulator = inject(FlowSimulatorService);
    private flowStatisticsService = inject(FlowStatisticsService);

    // ─────────────────────────────────────────────────────────────
    // STATE (Privados)
    // ─────────────────────────────────────────────────────────────

    private readonly _isSimulating = signal<boolean>(false);
    getIsSimulating() {
        return this._isSimulating;
    }

    private readonly _isPaused = signal<boolean>(false);
    getIsPaused() {
        return this._isPaused;
    }
    private readonly _selectedFlow = signal<NetworkFlow | null>(null);
    private readonly _filterProtocol = signal<FlowProtocol | 'ALL'>('ALL');
    private readonly _filterStatus = signal<FlowStatus | 'ALL'>('ALL');
    private readonly _showOnlyThreats = signal<boolean>(false);
    getsHowOnlyThreats() {
        return this._showOnlyThreats;
    }
    private readonly _simulationSpeed = signal<number>(1000); // ms entre flujos



    // ─────────────────────────────────────────────────────────────
    // PUBLIC (ReadOnly)
    // ─────────────────────────────────────────────────────────────

    readonly isSimulating = this._isSimulating.asReadonly();
    readonly isPaused = this._isPaused.asReadonly();
    readonly flows = this.simulator.flows.asReadonly();
    readonly statistics = this.flowStatisticsService.statisticsSignal;
    readonly selectedFlow = this._selectedFlow.asReadonly();
    readonly filterProtocol = this._filterProtocol.asReadonly();
    readonly filterStatus = this._filterStatus.asReadonly();
    readonly showOnlyThreats = this._showOnlyThreats.asReadonly();
    readonly simulationSpeed = this._simulationSpeed.asReadonly();

    // ─────────────────────────────────────────────────────────────
    // ACTIONS (para que el componente no “toque” signals privados)
    // ─────────────────────────────────────────────────────────────

    setSimulating(value: boolean) {
        this._isSimulating.set(value);
    }

    setPaused(value: boolean) {
        this._isPaused.set(value);
    }

    selectFlow(flow: NetworkFlow | null) {
        this._selectedFlow.set(flow);
    }

    setFilterProtocol(protocol: FlowProtocol | 'ALL') {
        this._filterProtocol.set(protocol);
    }

    setFilterStatus(status: FlowStatus | 'ALL') {
        this._filterStatus.set(status);
    }

    setShowOnlyThreats(value: boolean) {
        this._showOnlyThreats.set(value);
    }

    setSimulationSpeed(ms: number) {
        this._simulationSpeed.set(ms);
    }
}
