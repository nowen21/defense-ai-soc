// ============================================================
// SENTINEL-ML - DEFENSE NETWORK TYPE SELECTOR
// Sistema de Detección de Amenazas para Entornos de Defensa
// ============================================================

import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { 
  trigger, transition, style, animate, query, stagger, state 
} from '@angular/animations';

// ─────────────────────────────────────────────────────────────
// INTERFACES ESPECIALIZADAS PARA DEFENSA
// ─────────────────────────────────────────────────────────────

export type ClasificacionSeguridad = 'sin_clasificar' | 'restringido' | 'confidencial' | 'secreto' | 'alto_secreto';
export type TipoEntornoDefensa = 'tactica' | 'estrategica' | 'logistica' | 'inteligencia' | 'comunicaciones' | 'ciberdefensa';
export type TipoComunicacion = 'hf' | 'vhf' | 'uhf' | 'satelite' | 'fibra' | 'microondas' | 'ip_militar';

export interface NetworkType {
  id: string;
  nombre: string;
  nombreCorto: string;
  descripcion: string;
  icon: string;
  
  // Clasificación militar
  clasificacion: ClasificacionSeguridad;
  nivelAcceso: number; // 1-5
  
  // Tipo de entorno
  entorno: TipoEntornoDefensa;
  
  // Características técnicas
  caracteristicas: string[];
  comunicaciones: TipoComunicacion[];
  protocolosMilitares: string[];
  
  // Amenazas específicas
  amenazasPrioritarias: ThreatProfile[];
  
  // Capacidades
  dispositivos: number;
  velocidad: string;
  cobertura: string;
  latenciaMaxima: string;
  disponibilidadRequerida: string; // 99.9%, 99.99%, etc.
  
  // Estándares de cumplimiento
  estandares: string[];
  
  // Visual
  color: string;
  nivelRiesgo: 'bajo' | 'medio' | 'alto' | 'critico';
  
  // Configuración ML
  modelosML: MLModelConfig[];
}

export interface ThreatProfile {
  id: string;
  nombre: string;
  categoria: ThreatCategory;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  descripcion: string;
  tacticasMITRE: string[]; // MITRE ATT&CK
}

export type ThreatCategory = 
  | 'apt'                    // Advanced Persistent Threat
  | 'espionaje'              // Ciberespionaje
  | 'sabotaje'               // Sabotaje de sistemas
  | 'guerra_electronica'     // Electronic Warfare
  | 'intercepcion'           // Intercepción de comunicaciones
  | 'denegacion_servicio'    // DoS/DDoS
  | 'intrusion'              // Acceso no autorizado
  | 'exfiltracion'           // Robo de datos
  | 'supply_chain'           // Ataque a cadena de suministro
  | 'insider_threat';        // Amenaza interna

export interface MLModelConfig {
  id: string;
  nombre: string;
  tipo: 'anomaly_detection' | 'classification' | 'prediction' | 'behavioral';
  descripcion: string;
  precision: number;
  latencia: string;
  activo: boolean;
}

@Component({
  selector: 'app-network-type-selector-page',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './network-type-selector-page.component.html',
  styleUrl: './network-type-selector-page.component.scss',
  animations: [
    trigger('staggerIn', [
      transition(':enter', [
        query('.network-card', [
          style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
          stagger(80, [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', 
              style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('selectAnimation', [
      state('unselected', style({ transform: 'scale(1)' })),
      state('selected', style({ transform: 'scale(1.02)', boxShadow: '0 0 30px var(--glow-color)' })),
      transition('unselected <=> selected', animate('300ms ease-out'))
    ]),
    trigger('slidePanel', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('400ms 100ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(30px)' }))
      ])
    ]),
    trigger('threatPulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class NetworkTypeSelectorPageComponent {
  
  // Output al componente padre
  networkSelected = output<NetworkType>();
  configurationComplete = output<DefenseConfiguration>();
  
  // Estado interno
  private readonly _selectedNetwork = signal<NetworkType | null>(null);
  private readonly _selectedClassification = signal<ClasificacionSeguridad>('restringido');
  private readonly _isScanning = signal<boolean>(false);
  private readonly _scanProgress = signal<number>(0);
  private readonly _scanPhase = signal<string>('');
  private readonly _threatsDetected = signal<number>(0);
  private readonly _devicesFound = signal<number>(0);
  
  // Públicos
  readonly selectedNetwork = this._selectedNetwork.asReadonly();
  readonly selectedClassification = this._selectedClassification.asReadonly();
  readonly isScanning = this._isScanning.asReadonly();
  readonly scanProgress = this._scanProgress.asReadonly();
  readonly scanPhase = this._scanPhase.asReadonly();
  readonly threatsDetected = this._threatsDetected.asReadonly();
  readonly devicesFound = this._devicesFound.asReadonly();
  
  // Computed
  readonly isConfigured = computed(() => this._selectedNetwork() !== null);
  
  // ─────────────────────────────────────────────────────────────
  // TIPOS DE RED ESPECIALIZADOS PARA DEFENSA
  // ─────────────────────────────────────────────────────────────
  
  readonly networkTypes: NetworkType[] = [
    {
      id: 'tactical',
      nombre: 'Red Táctica de Combate',
      nombreCorto: 'TACNET',
      descripcion: 'Red de comunicaciones tácticas para operaciones en campo. Soporta movilidad, condiciones adversas y comunicaciones seguras en tiempo real.',
      icon: 'military_tech',
      clasificacion: 'secreto',
      nivelAcceso: 4,
      entorno: 'tactica',
      caracteristicas: [
        'Comunicaciones móviles seguras',
        'Resistencia a interferencias (jamming)',
        'Operación en condiciones degradadas',
        'Cifrado de grado militar (AES-256)',
        'Salto de frecuencia (FHSS)',
        'Baja probabilidad de intercepción (LPI)',
        'Malla auto-regenerativa',
        'Integración con sistemas C4ISR'
      ],
      comunicaciones: ['hf', 'vhf', 'uhf', 'satelite'],
      protocolosMilitares: ['MIL-STD-188', 'STANAG 4691', 'Link 16', 'SINCGARS', 'JTRS'],
      amenazasPrioritarias: [
        {
          id: 'ew_jamming',
          nombre: 'Guerra Electrónica - Jamming',
          categoria: 'guerra_electronica',
          severidad: 'critica',
          descripcion: 'Interferencia deliberada de comunicaciones tácticas',
          tacticasMITRE: ['T1498', 'T1499']
        },
        {
          id: 'sigint',
          nombre: 'Intercepción SIGINT',
          categoria: 'intercepcion',
          severidad: 'critica',
          descripcion: 'Captura y análisis de señales de comunicación',
          tacticasMITRE: ['T1040', 'T1557']
        },
        {
          id: 'location_tracking',
          nombre: 'Geolocalización Hostil',
          categoria: 'espionaje',
          severidad: 'alta',
          descripcion: 'Triangulación de posiciones mediante emisiones RF',
          tacticasMITRE: ['T1422', 'T1430']
        }
      ],
      dispositivos: 500,
      velocidad: '2-50 Mbps',
      cobertura: '50-200 km',
      latenciaMaxima: '< 100ms',
      disponibilidadRequerida: '99.9%',
      estandares: ['MIL-STD-810', 'MIL-STD-461', 'TEMPEST', 'NATO STANAG'],
      color: '#ff6b35',
      nivelRiesgo: 'critico',
      modelosML: [
        { id: 'rf_anomaly', nombre: 'Detección de Anomalías RF', tipo: 'anomaly_detection', descripcion: 'Detecta patrones anómalos en espectro RF', precision: 94.5, latencia: '< 50ms', activo: true },
        { id: 'jamming_detect', nombre: 'Detector de Jamming', tipo: 'classification', descripcion: 'Identifica y clasifica tipos de interferencia', precision: 97.2, latencia: '< 20ms', activo: true }
      ]
    },
    {
      id: 'strategic',
      nombre: 'Red Estratégica de Comando',
      nombreCorto: 'STRATNET',
      descripcion: 'Infraestructura de comunicaciones para centros de mando y control estratégico. Máxima seguridad y disponibilidad.',
      icon: 'hub',
      clasificacion: 'alto_secreto',
      nivelAcceso: 5,
      entorno: 'estrategica',
      caracteristicas: [
        'Redundancia geográfica múltiple',
        'Cifrado cuántico (QKD ready)',
        'Aislamiento físico y lógico',
        'Monitoreo 24/7/365',
        'Capacidad de supervivencia nuclear',
        'Comunicaciones fuera de banda',
        'Autenticación multifactor biométrica',
        'Registro forense completo'
      ],
      comunicaciones: ['fibra', 'satelite', 'microondas'],
      protocolosMilitares: ['HAIPE', 'NSA Suite B', 'Type 1 Crypto', 'SIPRNet', 'JWICS'],
      amenazasPrioritarias: [
        {
          id: 'apt_nation',
          nombre: 'APT Patrocinado por Estado',
          categoria: 'apt',
          severidad: 'critica',
          descripcion: 'Ataques persistentes de actores estatales avanzados',
          tacticasMITRE: ['T1583', 'T1584', 'T1587', 'T1588']
        },
        {
          id: 'supply_chain',
          nombre: 'Compromiso de Cadena de Suministro',
          categoria: 'supply_chain',
          severidad: 'critica',
          descripcion: 'Inserción de backdoors en hardware/software',
          tacticasMITRE: ['T1195', 'T1199']
        },
        {
          id: 'insider',
          nombre: 'Amenaza Interna',
          categoria: 'insider_threat',
          severidad: 'alta',
          descripcion: 'Personal con acceso privilegiado comprometido',
          tacticasMITRE: ['T1078', 'T1136']
        }
      ],
      dispositivos: 200,
      velocidad: '10-100 Gbps',
      cobertura: 'Nacional/Global',
      latenciaMaxima: '< 10ms',
      disponibilidadRequerida: '99.999%',
      estandares: ['NIST 800-53', 'FIPS 140-3', 'Common Criteria EAL6+', 'CNSS Policy 15'],
      color: '#ff3366',
      nivelRiesgo: 'critico',
      modelosML: [
        { id: 'apt_hunter', nombre: 'APT Hunter', tipo: 'behavioral', descripcion: 'Detección de comportamiento APT', precision: 96.8, latencia: '< 100ms', activo: true },
        { id: 'insider_detect', nombre: 'Detector de Amenaza Interna', tipo: 'behavioral', descripcion: 'Análisis de comportamiento de usuarios', precision: 92.3, latencia: '< 500ms', activo: true },
        { id: 'zero_day', nombre: 'Zero-Day Predictor', tipo: 'prediction', descripcion: 'Predicción de exploits desconocidos', precision: 89.1, latencia: '< 200ms', activo: true }
      ]
    },
    {
      id: 'intelligence',
      nombre: 'Red de Inteligencia y Vigilancia',
      nombreCorto: 'INTNET',
      descripcion: 'Infraestructura para operaciones ISR (Intelligence, Surveillance, Reconnaissance). Procesamiento de grandes volúmenes de datos.',
      icon: 'visibility',
      clasificacion: 'secreto',
      nivelAcceso: 4,
      entorno: 'inteligencia',
      caracteristicas: [
        'Procesamiento de datos masivo',
        'Integración multi-sensor',
        'Análisis en tiempo real',
        'Correlación de inteligencia',
        'Fusión de datos multi-fuente',
        'Almacenamiento cifrado distribuido',
        'Compartimentación de información',
        'Acceso need-to-know'
      ],
      comunicaciones: ['satelite', 'fibra', 'ip_militar'],
      protocolosMilitares: ['CDL', 'TCDL', 'STANAG 4559', 'STANAG 4607', 'JISR'],
      amenazasPrioritarias: [
        {
          id: 'data_exfil',
          nombre: 'Exfiltración de Inteligencia',
          categoria: 'exfiltracion',
          severidad: 'critica',
          descripcion: 'Robo de información clasificada de inteligencia',
          tacticasMITRE: ['T1041', 'T1048', 'T1567']
        },
        {
          id: 'sensor_spoof',
          nombre: 'Falsificación de Sensores',
          categoria: 'sabotaje',
          severidad: 'alta',
          descripcion: 'Inyección de datos falsos en sistemas de sensores',
          tacticasMITRE: ['T1565', 'T1491']
        }
      ],
      dispositivos: 1000,
      velocidad: '1-40 Gbps',
      cobertura: 'Teatro de Operaciones',
      latenciaMaxima: '< 50ms',
      disponibilidadRequerida: '99.95%',
      estandares: ['ICD 503', 'DCID 6/3', 'NIST 800-171', 'CNSSI 1253'],
      color: '#a855f7',
      nivelRiesgo: 'alto',
      modelosML: [
        { id: 'anomaly_traffic', nombre: 'Anomalía de Tráfico ISR', tipo: 'anomaly_detection', descripcion: 'Detecta patrones anómalos en flujos ISR', precision: 95.7, latencia: '< 30ms', activo: true },
        { id: 'data_leak', nombre: 'Detector de Fugas', tipo: 'classification', descripcion: 'Identifica intentos de exfiltración', precision: 98.1, latencia: '< 100ms', activo: true }
      ]
    },
    {
      id: 'logistics',
      nombre: 'Red Logística y Sostenimiento',
      nombreCorto: 'LOGNET',
      descripcion: 'Sistemas de gestión logística militar, cadena de suministro y mantenimiento. Integración con sistemas ERP de defensa.',
      icon: 'local_shipping',
      clasificacion: 'confidencial',
      nivelAcceso: 3,
      entorno: 'logistica',
      caracteristicas: [
        'Gestión de inventario en tiempo real',
        'Tracking de activos RFID/GPS',
        'Integración con sistemas GCSS',
        'Planificación de mantenimiento predictivo',
        'Gestión de cadena de suministro',
        'Conectividad con proveedores autorizados',
        'Auditoría de transacciones',
        'Respaldo automatizado'
      ],
      comunicaciones: ['fibra', 'satelite', 'ip_militar'],
      protocolosMilitares: ['DLMS', 'MILS', 'STANAG 4406', 'GCSS-MC'],
      amenazasPrioritarias: [
        {
          id: 'supply_disrupt',
          nombre: 'Disrupción de Cadena de Suministro',
          categoria: 'sabotaje',
          severidad: 'alta',
          descripcion: 'Ataques para interrumpir logística militar',
          tacticasMITRE: ['T1485', 'T1486', 'T1490']
        },
        {
          id: 'counterfeit',
          nombre: 'Componentes Falsificados',
          categoria: 'supply_chain',
          severidad: 'media',
          descripcion: 'Infiltración de partes no autorizadas',
          tacticasMITRE: ['T1195.001', 'T1195.002']
        }
      ],
      dispositivos: 2000,
      velocidad: '100 Mbps - 1 Gbps',
      cobertura: 'Global (bases y depósitos)',
      latenciaMaxima: '< 200ms',
      disponibilidadRequerida: '99.9%',
      estandares: ['NIST 800-53', 'DFARS 252.204-7012', 'CMMC Level 3'],
      color: '#f59e0b',
      nivelRiesgo: 'medio',
      modelosML: [
        { id: 'supply_anomaly', nombre: 'Anomalía Logística', tipo: 'anomaly_detection', descripcion: 'Detecta irregularidades en cadena de suministro', precision: 93.4, latencia: '< 500ms', activo: true }
      ]
    },
    {
      id: 'cyber_defense',
      nombre: 'Centro de Ciberdefensa (SOC/CERT)',
      nombreCorto: 'CYBERNET',
      descripcion: 'Infraestructura del Centro de Operaciones de Ciberseguridad. Monitoreo, detección y respuesta a incidentes.',
      icon: 'security',
      clasificacion: 'secreto',
      nivelAcceso: 4,
      entorno: 'ciberdefensa',
      caracteristicas: [
        'SIEM de grado militar',
        'Threat Intelligence integrado',
        'Sandbox de análisis de malware',
        'Honeypots y deception',
        'Análisis forense digital',
        'Respuesta automatizada (SOAR)',
        'Integración con feeds de amenazas',
        'War room virtual'
      ],
      comunicaciones: ['fibra', 'ip_militar'],
      protocolosMilitares: ['STIX/TAXII', 'OpenC2', 'MISP', 'CACAO'],
      amenazasPrioritarias: [
        {
          id: 'apt_all',
          nombre: 'Todas las APT Conocidas',
          categoria: 'apt',
          severidad: 'critica',
          descripcion: 'Grupos APT patrocinados por estados adversarios',
          tacticasMITRE: ['TA0001', 'TA0002', 'TA0003', 'TA0040']
        },
        {
          id: 'zero_day_exploit',
          nombre: 'Exploits Zero-Day',
          categoria: 'intrusion',
          severidad: 'critica',
          descripcion: 'Vulnerabilidades no parcheadas',
          tacticasMITRE: ['T1190', 'T1203', 'T1211']
        },
        {
          id: 'ransomware_targeted',
          nombre: 'Ransomware Dirigido',
          categoria: 'sabotaje',
          severidad: 'alta',
          descripcion: 'Ataques de ransomware específicos contra defensa',
          tacticasMITRE: ['T1486', 'T1490', 'T1489']
        }
      ],
      dispositivos: 500,
      velocidad: '10-100 Gbps',
      cobertura: 'Toda la infraestructura de defensa',
      latenciaMaxima: '< 5ms',
      disponibilidadRequerida: '99.999%',
      estandares: ['NIST CSF', 'NIST 800-61', 'ISO 27035', 'FIRST CSIRT'],
      color: '#00ff88',
      nivelRiesgo: 'critico',
      modelosML: [
        { id: 'threat_detect', nombre: 'Detector Multi-Amenaza', tipo: 'classification', descripcion: 'Clasificación de amenazas en tiempo real', precision: 97.5, latencia: '< 10ms', activo: true },
        { id: 'behavior_analysis', nombre: 'Análisis de Comportamiento', tipo: 'behavioral', descripcion: 'UBA/UEBA para detección de anomalías', precision: 94.8, latencia: '< 50ms', activo: true },
        { id: 'predictive_threat', nombre: 'Predicción de Amenazas', tipo: 'prediction', descripcion: 'Anticipa vectores de ataque probables', precision: 88.3, latencia: '< 1s', activo: true },
        { id: 'malware_classifier', nombre: 'Clasificador de Malware', tipo: 'classification', descripcion: 'Identifica familias de malware', precision: 99.1, latencia: '< 100ms', activo: true }
      ]
    },
    {
      id: 'satellite',
      nombre: 'Red de Comunicaciones Satelitales',
      nombreCorto: 'SATNET',
      descripcion: 'Infraestructura de comunicaciones por satélite militar. Enlaces SATCOM para operaciones globales.',
      icon: 'satellite_alt',
      clasificacion: 'secreto',
      nivelAcceso: 4,
      entorno: 'comunicaciones',
      caracteristicas: [
        'Cobertura global',
        'Resistencia a EMP',
        'Anti-jamming avanzado',
        'Cifrado end-to-end',
        'Terminales portátiles',
        'Comunicaciones beyond-line-of-sight',
        'Integración multi-banda',
        'Protección TRANSEC/COMSEC'
      ],
      comunicaciones: ['satelite', 'microondas'],
      protocolosMilitares: ['MILSATCOM', 'AEHF', 'WGS', 'MUOS', 'STANAG 4285'],
      amenazasPrioritarias: [
        {
          id: 'sat_jamming',
          nombre: 'Jamming Satelital',
          categoria: 'guerra_electronica',
          severidad: 'critica',
          descripcion: 'Interferencia de enlaces satelitales',
          tacticasMITRE: ['T1498', 'T1499']
        },
        {
          id: 'sat_spoof',
          nombre: 'Spoofing de Señal GPS/GNSS',
          categoria: 'sabotaje',
          severidad: 'alta',
          descripcion: 'Falsificación de señales de posicionamiento',
          tacticasMITRE: ['T1557', 'T1565']
        },
        {
          id: 'asat',
          nombre: 'Amenazas Anti-Satélite (ASAT)',
          categoria: 'sabotaje',
          severidad: 'critica',
          descripcion: 'Ataques físicos o cyber a activos espaciales',
          tacticasMITRE: ['T1485', 'T1529']
        }
      ],
      dispositivos: 150,
      velocidad: '256 Kbps - 100 Mbps',
      cobertura: 'Global',
      latenciaMaxima: '< 600ms (GEO)',
      disponibilidadRequerida: '99.95%',
      estandares: ['MIL-STD-188-165', 'STANAG 4206', 'CCSDS', 'NATO SATCOM'],
      color: '#00d4ff',
      nivelRiesgo: 'alto',
      modelosML: [
        { id: 'rf_interference', nombre: 'Detector de Interferencia RF', tipo: 'anomaly_detection', descripcion: 'Detecta jamming y spoofing', precision: 96.2, latencia: '< 100ms', activo: true },
        { id: 'link_quality', nombre: 'Predictor de Calidad de Enlace', tipo: 'prediction', descripcion: 'Predice degradación de señal', precision: 91.5, latencia: '< 200ms', activo: true }
      ]
    }
  ];
  
  // ─────────────────────────────────────────────────────────────
  // NIVELES DE CLASIFICACIÓN
  // ─────────────────────────────────────────────────────────────
  
  readonly clasificaciones: { value: ClasificacionSeguridad; label: string; color: string; icon: string }[] = [
    { value: 'sin_clasificar', label: 'Sin Clasificar', color: '#8b949e', icon: 'public' },
    { value: 'restringido', label: 'Restringido', color: '#3b82f6', icon: 'lock_open' },
    { value: 'confidencial', label: 'Confidencial', color: '#f59e0b', icon: 'lock' },
    { value: 'secreto', label: 'Secreto', color: '#ff6b35', icon: 'enhanced_encryption' },
    { value: 'alto_secreto', label: 'Alto Secreto', color: '#ff3366', icon: 'admin_panel_settings' }
  ];
  
  // Timer para escaneo
  private scanInterval: ReturnType<typeof setInterval> | null = null;
  
  // ─────────────────────────────────────────────────────────────
  // MÉTODOS
  // ─────────────────────────────────────────────────────────────
  
  selectNetwork(network: NetworkType): void {
    if (this._selectedNetwork()?.id === network.id) return;
    
    this._selectedNetwork.set(network);
    this._selectedClassification.set(network.clasificacion);
    this.startDefenseScan(network);
  }
  
  /**
   * Escaneo especializado para redes de defensa
   */
  private startDefenseScan(network: NetworkType): void {
    this._isScanning.set(true);
    this._scanProgress.set(0);
    this._threatsDetected.set(0);
    this._devicesFound.set(0);
    
    const phases = [
      'Verificando credenciales de seguridad...',
      'Estableciendo canal cifrado...',
      'Escaneando perímetro de red...',
      'Detectando dispositivos autorizados...',
      'Verificando firmas de integridad...',
      'Analizando patrones de tráfico...',
      'Correlacionando con threat intelligence...',
      'Evaluando postura de seguridad...',
      'Generando baseline de comportamiento...',
      'Activando modelos de detección ML...'
    ];
    
    if (this.scanInterval) clearInterval(this.scanInterval);
    
    let progress = 0;
    let phaseIndex = 0;
    let devices = 0;
    let threats = 0;
    
    this._scanPhase.set(phases[0]);
    
    this.scanInterval = setInterval(() => {
      progress += Math.random() * 8 + 3;
      
      // Actualizar fase
      const newPhaseIndex = Math.floor((progress / 100) * phases.length);
      if (newPhaseIndex !== phaseIndex && newPhaseIndex < phases.length) {
        phaseIndex = newPhaseIndex;
        this._scanPhase.set(phases[phaseIndex]);
      }
      
      // Simular descubrimiento de dispositivos
      if (progress > 30 && progress < 70) {
        devices += Math.floor(Math.random() * 15);
        this._devicesFound.set(Math.min(devices, network.dispositivos));
      }
      
      // Simular detección de amenazas
      if (progress > 50 && Math.random() > 0.7) {
        threats += 1;
        this._threatsDetected.set(threats);
      }
      
      if (progress >= 100) {
        this._scanProgress.set(100);
        this._devicesFound.set(network.dispositivos);
        this._isScanning.set(false);
        this._scanPhase.set('Análisis completo');
        
        if (this.scanInterval) clearInterval(this.scanInterval);
      } else {
        this._scanProgress.set(Math.floor(progress));
      }
    }, 300);
  }
  
  confirmSelection(): void {
    const network = this._selectedNetwork();
    if (network) {
      this.networkSelected.emit(network);
      
      // Emitir configuración completa
      this.configurationComplete.emit({
        network,
        clasificacion: this._selectedClassification(),
        devicesDetected: this._devicesFound(),
        threatsDetected: this._threatsDetected(),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  clearSelection(): void {
    this._selectedNetwork.set(null);
    this._isScanning.set(false);
    this._scanProgress.set(0);
    this._threatsDetected.set(0);
    this._devicesFound.set(0);
    
    if (this.scanInterval) clearInterval(this.scanInterval);
  }
  
  // Helpers
  getClasificacionInfo(clasificacion: ClasificacionSeguridad) {
    return this.clasificaciones.find(c => c.value === clasificacion);
  }
  
  getRiskClass(riesgo: string): string {
    const classes: Record<string, string> = {
      'bajo': 'success',
      'medio': 'medium',
      'alto': 'high',
      'critico': 'critical'
    };
    return classes[riesgo] || 'low';
  }
  
  getThreatCategoryIcon(categoria: ThreatCategory): string {
    const icons: Record<ThreatCategory, string> = {
      'apt': 'psychology',
      'espionaje': 'visibility',
      'sabotaje': 'dangerous',
      'guerra_electronica': 'radio',
      'intercepcion': 'hearing',
      'denegacion_servicio': 'block',
      'intrusion': 'lock_open',
      'exfiltracion': 'cloud_upload',
      'supply_chain': 'local_shipping',
      'insider_threat': 'person_off'
    };
    return icons[categoria] || 'warning';
  }
}

// Interface para la configuración completa
export interface DefenseConfiguration {
  network: NetworkType;
  clasificacion: ClasificacionSeguridad;
  devicesDetected: number;
  threatsDetected: number;
  timestamp: string;
}