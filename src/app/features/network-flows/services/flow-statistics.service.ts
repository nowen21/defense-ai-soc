import { Injectable, inject, signal } from '@angular/core';
import { NetworkFlow, FlowStatistics } from '../models';
import { FlowSimulatorService } from './flow-simulator.service';

@Injectable({ providedIn: 'root' })
export class FlowStatisticsService {

    private simulator = inject(FlowSimulatorService);


    private readonly _statistics = signal<FlowStatistics>({
        totalFlows: 0,
        flowsPerSecond: 0,
        bytesPerSecond: 0,
        packetsPerSecond: 0,
        activeConnections: 0,
        blockedConnections: 0,
        threatsDetected: 0,
        anomaliesDetected: 0
    });

    // ─────────────────────────────
    // GETTER
    // ─────────────────────────────

    get statistics() {
        return this._statistics();
    }
    get statisticsSignal() {
        return this._statistics.asReadonly();
    }

    // ─────────────────────────────
    // SETTERS
    // ─────────────────────────────



    // ─────────────────────────────
    // START
    // ─────────────────────────────

    start(intervalMs = 1000) {
        setInterval(() => this.updateStatistics(), intervalMs);
    }

    // ─────────────────────────────
    // CORE
    // ─────────────────────────────

    public updateStatistics(): void {
        const flows = this.simulator.flows();
        const now = Date.now();
        const oneSecondAgo = now - 1000;

        const recentFlows = flows.filter(f => f.timestamp.getTime() > oneSecondAgo);

        this._statistics.set({
            totalFlows: flows.length,
            flowsPerSecond: recentFlows.length,
            bytesPerSecond: recentFlows.reduce((sum, f) => sum + f.bytesIn + f.bytesOut, 0),
            packetsPerSecond: recentFlows.reduce((sum, f) => sum + f.packetsIn + f.packetsOut, 0),
            activeConnections: flows.filter(f => f.status === 'normal').length,
            blockedConnections: flows.filter(f => f.status === 'blocked').length,
            threatsDetected: flows.filter(f => f.threatType !== 'none').length,
            anomaliesDetected: flows.filter(f => f.mlPrediction?.isAnomaly).length
        });
    }

    resetStatistics() {
        this._statistics.set({
            totalFlows: 0,
            flowsPerSecond: 0,
            bytesPerSecond: 0,
            packetsPerSecond: 0,
            activeConnections: 0,
            blockedConnections: 0,
            threatsDetected: 0,
            anomaliesDetected: 0
        });
    }
}
