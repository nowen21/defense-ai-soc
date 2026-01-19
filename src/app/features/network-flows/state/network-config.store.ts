import { Injectable, computed, inject } from '@angular/core';
import { NetworkNode } from '../models';
import { NetworkConfigService } from '../../../core/services/network-config.service';

@Injectable({ providedIn: 'root' })
export class NetworkConfigStore {

  private readonly service = inject(NetworkConfigService);

  // ─────────────────────────────────────────────
  // COMPUTED (estado reactivo del SOC)
  // ─────────────────────────────────────────────

  private readonly _isSystemConfigured = computed(() => this.service.isConfigured());
  private readonly _isSystemActive = computed(() => this.service.isActive());
  private readonly _configuredNetwork = computed(() => this.service.selectedNetwork());
  private readonly _configuredNodes = computed(() => this.service.networkNodes());
  private readonly _configClasificacion = computed(() => this.service.clasificacion());
  private readonly _configAlertLevel = computed(() => this.service.alertLevel());
  private readonly _configMlModels = computed(() => this.service.mlModels());
  private readonly _configThreats = computed(() => this.service.threats());
  private readonly _flowConfig = computed(() => this.service.flowGenerationConfig());

  private readonly _activeNetworkNodes = computed(() => {
    const nodes = this.service.networkNodes();
    return nodes.map(n => ({
    ...n,
    x: n.x ?? 0,
    y: n.y ?? 0,
    connections: n.connections ?? []
  }));
  });

  // ─────────────────────────────────────────────
  // GETTERS (API pública del Store)
  // ─────────────────────────────────────────────

  get isSystemConfigured() {
    return this._isSystemConfigured();
  }

  get isSystemActive() {
    return this._isSystemActive();
  }

  get configuredNetwork() {
    return this._configuredNetwork();
  }

  get configuredNodes() {
    return this._configuredNodes();
  }

  get configClasificacion() {
    return this._configClasificacion();
  }

  get configAlertLevel() {
    return this._configAlertLevel();
  }

  get configMlModels() {
    return this._configMlModels();
  }

  get configThreats() {
    return this._configThreats();
  }

  get flowConfig() {
    return this._flowConfig();
  }

  get activeNetworkNodes(): NetworkNode[] {
    return this._activeNetworkNodes();
  }
}
