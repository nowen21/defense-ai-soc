import { Injectable, inject, signal } from '@angular/core';
import { NetworkFlow, FlowDirection, FlowStatus, ThreatType, FlowProtocol } from '../models';
import { NetworkConfigStore } from '../state/network-config.store';
import { MonitorStore } from '../state/monitor.store';
import { FlowProtocolsService } from './flow-protocols.service';
import { ThreatDetectionService } from '../../../core/services/threat-detection.service';

@Injectable({ providedIn: 'root' })
export class FlowSimulatorService {

    private configStore = inject(NetworkConfigStore);
    private monitorStore = inject(MonitorStore);
    private protocolsService = inject(FlowProtocolsService);
    private readonly threatDetectionService = inject(ThreatDetectionService);

    private readonly _flows = signal<NetworkFlow[]>([]);

    // ─────────────────────────────
    // GETTERS
    // ─────────────────────────────

    get flows() {
        return this._flows;
    }

    // ─────────────────────────────
    // SETTERS
    // ─────────────────────────────

    setFlows(flows: NetworkFlow[]) {
        this._flows.set(flows);
    }

    addFlow(flow: NetworkFlow) {
        this._flows.update(f => [flow, ...f].slice(0, 200));
    }

    clearFlows() {
        this._flows.set([]);
    }


    // ─────────────────────────────────────────────
    // API PÚBLICA
    // ─────────────────────────────────────────────

    startSimulation(intervalMs = 1500) {
        setInterval(() => this.generateFlow(), intervalMs);
    }

    // ─────────────────────────────────────────────
    // CORE
    // ─────────────────────────────────────────────

    processFlowForThreatAlert(flow: NetworkFlow): void {
        if (flow.threatScore < 50) {
            return;
        }

        this.threatDetectionService.createAlertFromFlow({
            id: flow.id,
            sourceIP: flow.sourceIP,
            sourcePort: flow.sourcePort,
            destinationIP: flow.destinationIP,
            destinationPort: flow.destinationPort,
            protocol: flow.protocol,
            threatType: flow.threatType,
            threatScore: flow.threatScore,
            mlPrediction: flow.mlPrediction
        });
    }

    public generateFlow(): void {
        const flow = this.createRandomFlow();

        this._flows.update(flows => {
            const newFlows = [flow, ...flows];
            return newFlows.slice(0, 200);
        });

        this.monitorStore.setFlows(this._flows());
        // ═══════════════════════════════════════════════════════════
        // Enviar a Threat Detection si es sospechoso
        // ═══════════════════════════════════════════════════════════
        this.processFlowForThreatAlert(flow);
    }

    private createRandomFlow(): NetworkFlow {
        const config = this.configStore.flowConfig;

        const isAttack = Math.random() < config.threatProbability;
        const isMalicious = Math.random() < config.criticalProbability;

        const protocol = this.random(this.protocolsService.getAll());
        const direction: FlowDirection = Math.random() > 0.5 ? 'inbound' : 'outbound';

        const sourceIPs = config.baseIPs;
        const externalIPs = config.externalIPs;
        const attackerIPs = config.attackerIPs;

        let sourceIP!: string;
        let destinationIP!: string;
        let status: FlowStatus = 'normal';
        let threatType: ThreatType = 'none';
        let threatScore = 0;

        if (isMalicious) {
            sourceIP = this.random(attackerIPs);
            destinationIP = this.random(sourceIPs);
            status = 'critical';
            threatType = this.getRandomThreatType();
            threatScore = 75 + Math.floor(Math.random() * 25);
        } else if (isAttack) {
            sourceIP = this.random(externalIPs);
            destinationIP = this.random(sourceIPs);
            status = 'warning';
            threatType = Math.random() > 0.5 ? 'anomaly' : 'port_scan';
            threatScore = 40 + Math.floor(Math.random() * 35);
        } else {
            if (direction === 'outbound') {
                sourceIP = this.random(sourceIPs);
                destinationIP = this.random(externalIPs);
            } else {
                sourceIP = this.random(externalIPs);
                destinationIP = this.random(sourceIPs);
            }
        }

        const mlModels = this.configStore.configMlModels;
        const selectedModel = mlModels.length > 0 ? this.random(mlModels) : null;

        return {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            sourceIP,
            sourcePort: this.getRandomPort(protocol),
            destinationIP,
            destinationPort: this.getStandardPort(protocol),
            protocol,
            direction,
            bytesIn: this.rand(100, 50000),
            bytesOut: this.rand(50, 30000),
            packetsIn: this.rand(1, 100),
            packetsOut: this.rand(1, 80),
            duration: this.rand(100, 60000),
            status,
            threatType,
            threatScore,
            geoSource: this.getRandomCountry(),
            geoDestination: 'Colombia',
            applicationLayer: this.getApplicationLayer(protocol),
            mlPrediction: threatScore > 30 ? {
                isAnomaly: threatScore > 50,
                confidence: selectedModel ? selectedModel.precision / 100 : 0.7 + Math.random() * 0.3,
                category: threatType,
                modelUsed: selectedModel ? selectedModel.nombre : 'SENTINEL-ML v2.1'
            } : undefined
        };
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private random<T>(arr: T[]): T {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    private rand(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    public getRandomThreatType(): ThreatType {
        const threats: ThreatType[] = ['port_scan', 'ddos', 'exfiltration', 'malware', 'brute_force', 'apt'];
        return this.random(threats);
    }

    public getRandomPort(protocol: FlowProtocol): number {
        if (['HTTP', 'HTTPS', 'DNS', 'SSH', 'FTP', 'SMTP'].includes(protocol)) {
            return 1024 + Math.floor(Math.random() * 64000);
        }
        return Math.floor(Math.random() * 65535);
    }

    public getStandardPort(protocol: FlowProtocol): number {
        const ports: Record<FlowProtocol, number> = {
            'TCP': 443,
            'UDP': 53,
            'ICMP': 0,
            'HTTP': 80,
            'HTTPS': 443,
            'DNS': 53,
            'SSH': 22,
            'RDP': 3389,
            'FTP': 21,
            'SMTP': 25,
            'MODBUS': 502,
            'DNP3': 20000
        };
        return ports[protocol] || 80;
    }

    public getRandomCountry(): string {
        const countries = ['Estados Unidos', 'Rusia', 'China', 'Alemania', 'Brasil', 'Colombia', 'Reino Unido', 'Francia', 'Japón', 'Corea del Sur'];
        return countries[Math.floor(Math.random() * countries.length)];
    }

    public getApplicationLayer(protocol: FlowProtocol): string {
        const apps: Record<FlowProtocol, string> = {
            'TCP': 'Generic TCP',
            'UDP': 'Generic UDP',
            'ICMP': 'ICMP Echo',
            'HTTP': 'Web Traffic',
            'HTTPS': 'Encrypted Web',
            'DNS': 'Domain Resolution',
            'SSH': 'Secure Shell',
            'RDP': 'Remote Desktop',
            'FTP': 'File Transfer',
            'SMTP': 'Email',
            'MODBUS': 'Industrial Control',
            'DNP3': 'SCADA Protocol'
        };
        return apps[protocol] || 'Unknown';
    }




}
