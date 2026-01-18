// ============================================================
// SENTINEL-ML - NETWORK CONFIG COMPONENT
// Componente padre para la configuración de red
// ============================================================

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { trigger, transition, style, animate } from '@angular/animations';
import { NetworkType, NetworkTypeSelectorPageComponent } from '../../network-type-selector/pages/network-type-selector-page.component';

// Componente hijo


// Interfaces para los pasos de configuración
export interface ConfigStep {
  id: number;
  titulo: string;
  descripcion: string;
  icon: string;
  completado: boolean;
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
    ])
  ]
})
export class NetworkConfigPageComponent {
private readonly router = inject(Router);
  
  // Estado del wizard
  private readonly _currentStep = signal<number>(1);
  private readonly _selectedNetwork = signal<NetworkType | null>(null);
  private readonly _configCompleted = signal<boolean>(false);
  
  // Públicos
  readonly currentStep = this._currentStep.asReadonly();
  readonly selectedNetwork = this._selectedNetwork.asReadonly();
  readonly configCompleted = this._configCompleted.asReadonly();
  
  // Pasos del wizard
  readonly steps: ConfigStep[] = [
    {
      id: 1,
      titulo: 'Tipo de Red',
      descripcion: 'Seleccionar topología',
      icon: 'lan',
      completado: false
    },
    {
      id: 2,
      titulo: 'Dispositivos',
      descripcion: 'Detectar equipos',
      icon: 'devices',
      completado: false
    },
    {
      id: 3,
      titulo: 'Seguridad',
      descripcion: 'Configurar políticas',
      icon: 'security',
      completado: false
    },
    {
      id: 4,
      titulo: 'Monitoreo',
      descripcion: 'Activar SENTINEL-ML',
      icon: 'radar',
      completado: false
    }
  ];
  
  // Computed
  readonly progressPercentage = computed(() => {
    const completedSteps = this.steps.filter(s => s.completado).length;
    return Math.round((completedSteps / this.steps.length) * 100);
  });
  
  readonly canProceed = computed(() => {
    const step = this._currentStep();
    if (step === 1) return this._selectedNetwork() !== null;
    return true;
  });
  
  readonly isLastStep = computed(() => this._currentStep() === this.steps.length);
  readonly isFirstStep = computed(() => this._currentStep() === 1);
  
  /**
   * Manejar selección de red desde el componente hijo
   */
  onNetworkSelected(network: NetworkType): void {
    this._selectedNetwork.set(network);
    this.steps[0].completado = true;
    
    // Avanzar automáticamente al siguiente paso
    setTimeout(() => {
      this.nextStep();
    }, 500);
  }
  
  /**
   * Ir al siguiente paso
   */
  nextStep(): void {
    if (this._currentStep() < this.steps.length) {
      this._currentStep.update(step => step + 1);
    }
  }
  
  /**
   * Ir al paso anterior
   */
  previousStep(): void {
    if (this._currentStep() > 1) {
      this._currentStep.update(step => step - 1);
    }
  }
  
  /**
   * Ir a un paso específico
   */
  goToStep(stepId: number): void {
    // Solo permitir ir a pasos completados o al actual + 1
    const targetStep = this.steps.find(s => s.id === stepId);
    if (targetStep && (targetStep.completado || stepId <= this._currentStep() + 1)) {
      this._currentStep.set(stepId);
    }
  }
  
  /**
   * Finalizar configuración
   */
  finishConfiguration(): void {
    this._configCompleted.set(true);
    
    // Guardar configuración y redirigir al dashboard
    console.log('Configuración completada:', {
      network: this._selectedNetwork(),
      timestamp: new Date().toISOString()
    });
    
    // Redirigir después de una pequeña animación
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }
  
  /**
   * Obtener clase de estado del paso
   */
  getStepClass(step: ConfigStep): string {
    if (step.completado) return 'completed';
    if (step.id === this._currentStep()) return 'active';
    if (step.id < this._currentStep()) return 'passed';
    return 'pending';
  }
}
