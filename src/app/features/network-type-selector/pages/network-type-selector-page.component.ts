// ============================================================
// SENTINEL-ML - NETWORK TYPE SELECTOR COMPONENT
// Componente para definir/seleccionar tipo de red a monitorear
// ============================================================
import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
  keyframes
} from '@angular/animations';

export interface NetworkType {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  caracteristicas: string[];
  dispositivos: number;
  velocidad: string;
  cobertura: string;
  protocolos: string[];
  color: string;
  riesgo: 'bajo' | 'medio' | 'alto';
}



@Component({
  selector: 'app-network-type-selector-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './network-type-selector-page.component.html',
  styleUrl: './network-type-selector-page.component.scss',
  animations: [
    // Animación de entrada escalonada de cards
    trigger('staggerIn', [
      transition(':enter', [
        query('.network-card', [
          style({ opacity: 0, transform: 'translateY(30px) scale(0.9)' }),
          stagger(100, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    // Animación de selección
    trigger('selectAnimation', [
      state('unselected', style({
        transform: 'scale(1)',
        boxShadow: 'none'
      })),
      state('selected', style({
        transform: 'scale(1.02)',
        boxShadow: '0 0 30px var(--glow-color)'
      })),
      transition('unselected <=> selected', animate('300ms ease-out'))
    ]),

    // Animación del panel de detalles
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(30px)' }))
      ])
    ]),
    // Animación de características
    trigger('listStagger', [
      transition(':enter', [
        query('.feature-item', [
          style({ opacity: 0, transform: 'translateX(-15px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
          ])
        ], { optional: true })
      ])
    ]),

    // Animación de nodos de red
    trigger('nodeAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),

    // Animación de conexiones
    trigger('connectionAnimation', [
      transition(':enter', [
        style({ strokeDashoffset: 100 }),
        animate('800ms ease-out', style({ strokeDashoffset: 0 }))
      ])
    ]),
    // Pulso continuo
    trigger('pulse', [
      transition(':enter', [
        animate('2s ease-in-out', keyframes([
          style({ transform: 'scale(1)', offset: 0 }),
          style({ transform: 'scale(1.05)', offset: 0.5 }),
          style({ transform: 'scale(1)', offset: 1 })
        ]))
      ])
    ])

  ]
})
export class NetworkTypeSelectorPageComponent {
  // Output para emitir la red seleccionada
  networkSelected = output<NetworkType>();

  // Estado
  private readonly _selectedNetwork = signal<NetworkType | null>(null);
  private readonly _isScanning = signal<boolean>(false);
  private readonly _scanProgress = signal<number>(0);

  // Públicos
  readonly selectedNetwork = this._selectedNetwork.asReadonly();
  readonly isScanning = this._isScanning.asReadonly();
  readonly scanProgress = this._scanProgress.asReadonly();

  // Computed
  readonly isConfigured = computed(() => this._selectedNetwork() !== null);
  readonly selectedColor = computed(() => this._selectedNetwork()?.color || 'var(--primary)');

  // Tipos de red disponibles
  readonly networkTypes: NetworkType[] = [
    {
      id: 'lan',
      nombre: 'Red LAN',
      descripcion: 'Red de Área Local - Ideal para oficinas y edificios corporativos',
      icon: 'lan',
      caracteristicas: [
        'Alta velocidad de transferencia',
        'Baja latencia',
        'Fácil administración',
        'Seguridad perimetral'
      ],
      dispositivos: 254,
      velocidad: '1-10 Gbps',
      cobertura: '100m - 1km',
      protocolos: ['Ethernet', 'TCP/IP', 'ARP', 'DHCP'],
      color: '#00ff88',
      riesgo: 'bajo'
    },
    {
      id: 'wan',
      nombre: 'Red WAN',
      descripcion: 'Red de Área Amplia - Conexión entre múltiples ubicaciones geográficas',
      icon: 'public',
      caracteristicas: [
        'Cobertura geográfica extensa',
        'Interconexión de sedes',
        'VPN y túneles seguros',
        'Redundancia de enlaces'
      ],
      dispositivos: 1000,
      velocidad: '100 Mbps - 1 Gbps',
      cobertura: 'Nacional/Global',
      protocolos: ['MPLS', 'BGP', 'OSPF', 'IPSec'],
      color: '#00d4ff',
      riesgo: 'alto'
    },
    {
      id: 'dmz',
      nombre: 'Zona DMZ',
      descripcion: 'Zona Desmilitarizada - Servicios expuestos a Internet con seguridad reforzada',
      icon: 'security',
      caracteristicas: [
        'Aislamiento de servicios públicos',
        'Doble firewall',
        'Monitoreo intensivo',
        'Control de acceso estricto'
      ],
      dispositivos: 50,
      velocidad: '1-10 Gbps',
      cobertura: 'Segmento aislado',
      protocolos: ['HTTP/S', 'DNS', 'SMTP', 'FTP'],
      color: '#ff3366',
      riesgo: 'alto'
    },
    {
      id: 'industrial',
      nombre: 'Red Industrial',
      descripcion: 'Red SCADA/ICS - Sistemas de control industrial y automatización',
      icon: 'precision_manufacturing',
      caracteristicas: [
        'Protocolos industriales',
        'Alta disponibilidad',
        'Tiempo real',
        'Segregación crítica'
      ],
      dispositivos: 200,
      velocidad: '100 Mbps - 1 Gbps',
      cobertura: 'Planta/Fábrica',
      protocolos: ['Modbus', 'DNP3', 'OPC-UA', 'Profinet'],
      color: '#ffaa00',
      riesgo: 'alto'
    },
    {
      id: 'wireless',
      nombre: 'Red Inalámbrica',
      descripcion: 'WiFi Enterprise - Conectividad móvil con autenticación empresarial',
      icon: 'wifi',
      caracteristicas: [
        'Movilidad de usuarios',
        'Autenticación 802.1X',
        'Gestión centralizada',
        'Roaming seamless'
      ],
      dispositivos: 500,
      velocidad: '300 Mbps - 1 Gbps',
      cobertura: 'Campus/Edificio',
      protocolos: ['802.11ax', 'WPA3', 'RADIUS', 'EAP'],
      color: '#a855f7',
      riesgo: 'medio'
    },
    {
      id: 'cloud',
      nombre: 'Red Cloud/Híbrida',
      descripcion: 'Infraestructura en la nube - AWS, Azure, GCP con conexión on-premise',
      icon: 'cloud',
      caracteristicas: [
        'Escalabilidad dinámica',
        'Multi-cloud',
        'Conexión híbrida',
        'Seguridad zero-trust'
      ],
      dispositivos: 999,
      velocidad: 'Variable',
      cobertura: 'Global',
      protocolos: ['HTTPS', 'gRPC', 'VPN', 'Direct Connect'],
      color: '#3b82f6',
      riesgo: 'medio'
    }
  ];

  // Intervalo para animación de escaneo
  private scanInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Seleccionar tipo de red
   */
  selectNetwork(network: NetworkType): void {
    if (this._selectedNetwork()?.id === network.id) {
      return; // Ya está seleccionada
    }

    this._selectedNetwork.set(network);
    this.startScanSimulation(network);
  }

  /**
   * Confirmar selección
   */
  confirmSelection(): void {
    const network = this._selectedNetwork();
    if (network) {
      this.networkSelected.emit(network);
    }
  }

  /**
   * Limpiar selección
   */
  clearSelection(): void {
    this._selectedNetwork.set(null);
    this._isScanning.set(false);
    this._scanProgress.set(0);

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }
  }

  /**
   * Simulación de escaneo de red
   */
  private startScanSimulation(network: NetworkType): void {
    this._isScanning.set(true);
    this._scanProgress.set(0);

    if (this.scanInterval) {
      clearInterval(this.scanInterval);
    }

    let progress = 0;
    this.scanInterval = setInterval(() => {
      progress += Math.random() * 15 + 5;

      if (progress >= 100) {
        progress = 100;
        this._scanProgress.set(100);
        this._isScanning.set(false);

        if (this.scanInterval) {
          clearInterval(this.scanInterval);
        }
      } else {
        this._scanProgress.set(Math.floor(progress));
      }
    }, 200);
  }

  /**
   * Obtener clase de riesgo
   */
  getRiskClass(riesgo: string): string {
    const classes: Record<string, string> = {
      'bajo': 'success',
      'medio': 'medium',
      'alto': 'critical'
    };
    return classes[riesgo] || 'low';
  }

  /**
   * Obtener label de riesgo
   */
  getRiskLabel(riesgo: string): string {
    const labels: Record<string, string> = {
      'bajo': 'Bajo',
      'medio': 'Medio',
      'alto': 'Alto'
    };
    return labels[riesgo] || riesgo;
  }

  /**
   * Track function para ngFor
   */
  trackByNetworkId(index: number, network: NetworkType): string {
    return network.id;
  }

  /**
 * Obtener icono para nodos periféricos
 */
  getPeripheralIcon(index: number): string {
    const icons = ['computer', 'router', 'storage', 'print', 'phone_android', 'tablet'];
    return icons[(index - 1) % icons.length];
  }

  /**
   * Obtener coordenada X del nodo
   */
  getNodeX(index: number): number {
    const positions = [150, 240, 240, 150, 60, 60];
    return positions[(index - 1) % positions.length];
  }

  /**
   * Obtener coordenada Y del nodo
   */
  getNodeY(index: number): number {
    const positions = [30, 60, 140, 170, 140, 60];
    return positions[(index - 1) % positions.length];
  }
}
