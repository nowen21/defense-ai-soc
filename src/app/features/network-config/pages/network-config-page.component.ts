// ============================================================
// SENTINEL-ML - NETWORK CONFIG PAGE COMPONENT
// Componente padre para configuración de red de Defensa
// Sistema de Detección de Amenazas para Entornos Militares
// ============================================================

import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { trigger, transition, style, animate } from '@angular/animations';

// Componente hijo
import {
  NetworkTypeSelectorPageComponent,
  NetworkType,
  DefenseConfiguration,
  ClasificacionSeguridad
} from '../../network-type-selector/pages/network-type-selector-page.component';
import { NetworkConfigService } from '../../../core/services/network-config.service';

// ─────────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────────

export interface ConfigStep {
  id: number;
  titulo: string;
  descripcion: string;
  icon: string;
  completado: boolean;
  activo: boolean;
}

export interface SecurityPolicy {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  nivel: 'basico' | 'avanzado' | 'maximo';
}

@Component({
  selector: 'app-network-config-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatStepperModule,
    NetworkTypeSelectorPageComponent
  ],
  templateUrl: './network-config-page.component.html',
  styleUrl: './network-config-page.component.scss',
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('stepTransition', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('successAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class NetworkConfigPageComponent {

  private readonly router = inject(Router);
  private readonly networkConfigService = inject(NetworkConfigService);

  // ─────────────────────────────────────────────────────────────
  // ESTADO DEL WIZARD
  // ─────────────────────────────────────────────────────────────

  private readonly _currentStep = signal<number>(1);
  private readonly _selectedNetwork = signal<NetworkType | null>(null);
  private readonly _defenseConfig = signal<DefenseConfiguration | null>(null);
  private readonly _configCompleted = signal<boolean>(false);
  private readonly _isActivating = signal<boolean>(false);
  private readonly _activationProgress = signal<number>(0);
  private readonly _currentClassification = signal<ClasificacionSeguridad>('restringido');

  // Configuraciones de seguridad seleccionadas
  private readonly _selectedPolicies = signal<string[]>([
    'ids_ips', 'anomaly_detection', 'threat_intel', 'behavioral_analysis'
  ]);
  private readonly _alertLevel = signal<'bajo' | 'medio' | 'alto' | 'critico'>('alto');

  // Públicos (readonly)
  readonly currentStep = this._currentStep.asReadonly();
  readonly selectedNetwork = this._selectedNetwork.asReadonly();
  readonly defenseConfig = this._defenseConfig.asReadonly();
  readonly configCompleted = this._configCompleted.asReadonly();
  readonly isActivating = this._isActivating.asReadonly();
  readonly activationProgress = this._activationProgress.asReadonly();
  readonly currentClassification = this._currentClassification.asReadonly();
  readonly selectedPolicies = this._selectedPolicies.asReadonly();
  readonly alertLevel = this._alertLevel.asReadonly();

  // ─────────────────────────────────────────────────────────────
  // PASOS DEL WIZARD
  // ─────────────────────────────────────────────────────────────

  readonly steps: ConfigStep[] = [
    {
      id: 1,
      titulo: 'Tipo de Red',
      descripcion: 'Seleccionar entorno',
      icon: 'lan',
      completado: false,
      activo: true
    },
    {
      id: 2,
      titulo: 'Descubrimiento',
      descripcion: 'Detectar activos',
      icon: 'radar',
      completado: false,
      activo: false
    },
    {
      id: 3,
      titulo: 'Políticas',
      descripcion: 'Configurar seguridad',
      icon: 'policy',
      completado: false,
      activo: false
    },
    {
      id: 4,
      titulo: 'Activación',
      descripcion: 'Iniciar SENTINEL-ML',
      icon: 'power_settings_new',
      completado: false,
      activo: false
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // POLÍTICAS DE SEGURIDAD DISPONIBLES
  // ─────────────────────────────────────────────────────────────

  readonly securityPolicies: SecurityPolicy[] = [
    {
      id: 'ids_ips',
      nombre: 'Sistema IDS/IPS',
      descripcion: 'Detección y prevención de intrusiones en tiempo real',
      activo: true,
      nivel: 'basico'
    },
    {
      id: 'anomaly_detection',
      nombre: 'Detección de Anomalías ML',
      descripcion: 'Machine Learning para identificar comportamientos anómalos',
      activo: true,
      nivel: 'avanzado'
    },
    {
      id: 'threat_intel',
      nombre: 'Threat Intelligence',
      descripcion: 'Integración con feeds de inteligencia de amenazas',
      activo: true,
      nivel: 'avanzado'
    },
    {
      id: 'behavioral_analysis',
      nombre: 'Análisis de Comportamiento',
      descripcion: 'UBA/UEBA para detección de amenazas internas',
      activo: true,
      nivel: 'maximo'
    },
    {
      id: 'deception',
      nombre: 'Tecnología de Engaño',
      descripcion: 'Honeypots y señuelos para detectar atacantes',
      activo: false,
      nivel: 'maximo'
    },
    {
      id: 'zero_trust',
      nombre: 'Zero Trust Network',
      descripcion: 'Verificación continua de cada acceso',
      activo: false,
      nivel: 'maximo'
    }
  ];

  // ─────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────

  readonly progressPercentage = computed(() => {
    const completedSteps = this.steps.filter(s => s.completado).length;
    return Math.round((completedSteps / this.steps.length) * 100);
  });

  readonly canProceed = computed(() => {
    const step = this._currentStep();
    if (step === 1) return this._selectedNetwork() !== null;
    if (step === 2) return this._defenseConfig() !== null;
    if (step === 3) return this._selectedPolicies().length > 0;
    return true;
  });

  readonly isLastStep = computed(() => this._currentStep() === this.steps.length);
  readonly isFirstStep = computed(() => this._currentStep() === 1);

  readonly networkColor = computed(() => this._selectedNetwork()?.color || 'var(--primary)');

  readonly activePoliciesCount = computed(() => this._selectedPolicies().length);

  readonly mlModelsCount = computed(() => this._selectedNetwork()?.modelosML?.length || 0);

  readonly threatCount = computed(() => this._selectedNetwork()?.amenazasPrioritarias?.length || 0);

  // Info de clasificación actual
  readonly classificationInfo = computed(() => {
    const clasificaciones = {
      'sin_clasificar': { label: 'Sin Clasificar', color: '#8b949e', icon: 'public' },
      'restringido': { label: 'Restringido', color: '#3b82f6', icon: 'lock_open' },
      'confidencial': { label: 'Confidencial', color: '#f59e0b', icon: 'lock' },
      'secreto': { label: 'Secreto', color: '#ff6b35', icon: 'enhanced_encryption' },
      'alto_secreto': { label: 'Alto Secreto', color: '#ff3366', icon: 'admin_panel_settings' }
    };
    return clasificaciones[this._currentClassification()];
  });

  // Timer para activación
  private activationInterval: ReturnType<typeof setInterval> | null = null;

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - MANEJO DE EVENTOS DEL HIJO
  // ─────────────────────────────────────────────────────────────

  /**
   * Recibe la red seleccionada desde el componente hijo
   */
  onNetworkSelected(network: NetworkType): void {
    console.log('Red seleccionada:', network);
    this._selectedNetwork.set(network);
    this._currentClassification.set(network.clasificacion);
    this.steps[0].completado = true;

    // ═══════════════════════════════════════════════════════════
    // Guardar en el servicio compartido
    // ═══════════════════════════════════════════════════════════
    this.networkConfigService.setSelectedNetwork(network);

    // Avanzar automáticamente al paso 2
    setTimeout(() => {
      this.nextStep();
    }, 300);
  }

  /**
   * Recibe la configuración completa desde el componente hijo
   */
  onConfigurationComplete(config: DefenseConfiguration): void {
    console.log('Configuración completa:', config);
    this._defenseConfig.set(config);
    this._currentClassification.set(config.clasificacion);

    // ═══════════════════════════════════════════════════════════
    // Guardar en el servicio compartido
    // ═══════════════════════════════════════════════════════════
    this.networkConfigService.setDefenseConfiguration(config);
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - NAVEGACIÓN DEL WIZARD
  // ─────────────────────────────────────────────────────────────

  /**
   * Avanzar al siguiente paso
   */
  nextStep(): void {
    const current = this._currentStep();
    if (current < this.steps.length) {
      // Marcar paso actual como completado
      this.steps[current - 1].completado = true;
      this.steps[current - 1].activo = false;

      // Activar siguiente paso
      this.steps[current].activo = true;

      this._currentStep.set(current + 1);
    }
  }

  /**
   * Retroceder al paso anterior
   */
  previousStep(): void {
    const current = this._currentStep();
    if (current > 1) {
      this.steps[current - 1].activo = false;
      this.steps[current - 2].activo = true;

      this._currentStep.set(current - 1);
    }
  }

  /**
   * Ir a un paso específico
   */
  goToStep(stepId: number): void {
    const targetStep = this.steps.find(s => s.id === stepId);
    const currentStepNum = this._currentStep();

    // Permitir ir a pasos completados o al paso actual
    if (targetStep && (targetStep.completado || stepId <= currentStepNum)) {
      // Actualizar estados
      this.steps.forEach(s => s.activo = false);
      this.steps[stepId - 1].activo = true;

      this._currentStep.set(stepId);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - PASO 2: DESCUBRIMIENTO
  // ─────────────────────────────────────────────────────────────

  /**
   * Confirmar descubrimiento y avanzar
   */
  confirmDiscovery(): void {
    this.steps[1].completado = true;
    this.nextStep();
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - PASO 3: POLÍTICAS DE SEGURIDAD
  // ─────────────────────────────────────────────────────────────

  /**
   * Toggle de política de seguridad
   */
  togglePolicy(policyId: string): void {
    const current = this._selectedPolicies();
    if (current.includes(policyId)) {
      this._selectedPolicies.set(current.filter(id => id !== policyId));
    } else {
      this._selectedPolicies.set([...current, policyId]);
    }
  }

  /**
   * Verificar si una política está activa
   */
  isPolicyActive(policyId: string): boolean {
    return this._selectedPolicies().includes(policyId);
  }

  /**
   * Cambiar nivel de alerta
   */
  setAlertLevel(level: 'bajo' | 'medio' | 'alto' | 'critico'): void {
    this._alertLevel.set(level);
  }

  /**
   * Confirmar políticas y avanzar
   */
  confirmPolicies(): void {
    this.steps[2].completado = true;
    // ═══════════════════════════════════════════════════════════
    // Guardar políticas en el servicio compartido
    // ═══════════════════════════════════════════════════════════
    const activePolicies = this.securityPolicies.filter(p =>
      this._selectedPolicies().includes(p.id)
    );
    this.networkConfigService.setActivePolicies(activePolicies);
    this.networkConfigService.setAlertLevel(this._alertLevel());


    this.nextStep();
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - PASO 4: ACTIVACIÓN
  // ─────────────────────────────────────────────────────────────

  /**
   * Iniciar activación del sistema
   */
  startActivation(): void {
    this._isActivating.set(true);
    this._activationProgress.set(0);

    const phases = [
      'Verificando credenciales de seguridad...',
      'Cargando modelos de Machine Learning...',
      'Inicializando motor de detección...',
      'Conectando con Threat Intelligence...',
      'Configurando reglas IDS/IPS...',
      'Activando monitoreo en tiempo real...',
      'Sincronizando con SIEM...',
      'Ejecutando diagnóstico inicial...',
      'Estableciendo baseline de comportamiento...',
      'Sistema SENTINEL-ML activado'
    ];

    let progress = 0;
    let phaseIndex = 0;

    if (this.activationInterval) {
      clearInterval(this.activationInterval);
    }

    this.activationInterval = setInterval(() => {
      progress += Math.random() * 8 + 4;

      if (progress >= 100) {
        progress = 100;
        this._activationProgress.set(100);
        this._isActivating.set(false);
        this._configCompleted.set(true);
        this.steps[3].completado = true;

        /***************************************************
         * Marcar como completado y activar en el servicio *
         **************************************************/
        this.networkConfigService.completeConfiguration();
        this.networkConfigService.activateSystem();

        if (this.activationInterval) {
          clearInterval(this.activationInterval);
        }

        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
          this.navigateToDashboard();
        }, 2500);
      } else {
        this._activationProgress.set(Math.floor(progress));
      }
    }, 400);
  }

  /**
   * Navegar al dashboard
   */
  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // ─────────────────────────────────────────────────────────────
  // MÉTODOS - HELPERS
  // ─────────────────────────────────────────────────────────────

  /**
   * Obtener clase CSS del paso
   */
  getStepClass(step: ConfigStep): string {
    if (step.completado) return 'completed';
    if (step.activo) return 'active';
    return 'pending';
  }

  /**
   * Obtener clase de nivel de política
   */
  getPolicyLevelClass(nivel: string): string {
    const classes: Record<string, string> = {
      'basico': 'level-basic',
      'avanzado': 'level-advanced',
      'maximo': 'level-maximum'
    };
    return classes[nivel] || '';
  }

  /**
   * Obtener label de nivel de alerta
   */
  getAlertLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'bajo': 'Bajo',
      'medio': 'Medio',
      'alto': 'Alto',
      'critico': 'Crítico'
    };
    return labels[level] || level;
  }

  /**
   * Obtener color de nivel de alerta
   */
  getAlertLevelColor(level: string): string {
    const colors: Record<string, string> = {
      'bajo': '#00ff88',
      'medio': '#f59e0b',
      'alto': '#ff6b35',
      'critico': '#ff3366'
    };
    return colors[level] || 'var(--primary)';
  }

  /**
   * Reiniciar configuración
   */
  resetConfiguration(): void {
    this._currentStep.set(1);
    this._selectedNetwork.set(null);
    this._defenseConfig.set(null);
    this._configCompleted.set(false);
    this._isActivating.set(false);
    this._activationProgress.set(0);
    this._currentClassification.set('restringido');

    // Resetear pasos
    this.steps.forEach((step, index) => {
      step.completado = false;
      step.activo = index === 0;
    });

    if (this.activationInterval) {
      clearInterval(this.activationInterval);
    }

    /********************************
     * Resetear servicio compartido *
     *******************************/
    this.networkConfigService.resetConfiguration();
  }

  /**
   * Track para ngFor
   */
  trackByStepId(index: number, step: ConfigStep): number {
    return step.id;
  }

  trackByPolicyId(index: number, policy: SecurityPolicy): string {
    return policy.id;
  }
}