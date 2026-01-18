# 🌐 SENTINEL-ML - Módulo Network Config

## Documentación del Módulo de Configuración de Red

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Flujo de Funcionamiento](#flujo-de-funcionamiento)
4. [Componente Padre: NetworkConfigComponent](#componente-padre-networkconfigcomponent)
5. [Componente Hijo: NetworkTypeSelectorComponent](#componente-hijo-networktypeselectorcomponent)
6. [Comunicación entre Componentes](#comunicación-entre-componentes)
7. [Los 4 Pasos del Wizard](#los-4-pasos-del-wizard)
8. [Tipos de Red Disponibles](#tipos-de-red-disponibles)
9. [Estructura de Archivos](#estructura-de-archivos)
10. [Guía de Implementación](#guía-de-implementación)

---

## 📖 Descripción General

El módulo **Network Config** es un wizard (asistente paso a paso) que guía al usuario en la configuración inicial del sistema SENTINEL-ML. Su propósito es:

1. **Identificar** qué tipo de red va a monitorear el sistema
2. **Detectar** los dispositivos conectados a esa red
3. **Configurar** las políticas de seguridad apropiadas
4. **Activar** el sistema de monitoreo

### ¿Por qué un Wizard?

El sistema SENTINEL-ML necesita conocer la topología de la red para ajustar sus algoritmos de Machine Learning. No es lo mismo monitorear una red LAN corporativa que una red industrial SCADA o una infraestructura cloud híbrida.

---

## 🏗️ Arquitectura del Módulo

```
┌─────────────────────────────────────────────────────────────┐
│                  NetworkConfigComponent                     │
│                     (COMPONENTE PADRE)                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    WIZARD                           │    │
│  │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐             │    │
│  │  │Paso 1│──│Paso 2│──│Paso 3│──│Paso 4│             │    │
│  │  └──────┘  └──────┘  └──────┘  └──────┘             │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           NetworkTypeSelectorComponent              │    │
│  │              (COMPONENTE HIJO)                      │    │
│  │                                                     │    │
│  │   Se muestra SOLO en el Paso 1                      │    │
│  │   Emite el evento (networkSelected) al padre        │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Relación Padre-Hijo

| Aspecto | NetworkConfigComponent (Padre) | NetworkTypeSelectorComponent (Hijo) |
|---------|-------------------------------|-------------------------------------|
| **Responsabilidad** | Controlar todo el wizard | Solo el paso 1: seleccionar red |
| **Estado** | Guarda la red seleccionada, paso actual, progreso | Solo maneja la UI de selección |
| **Navegación** | Controla ir adelante/atrás entre pasos | No navega, solo emite eventos |
| **Persistencia** | Guarda la configuración final | No guarda nada |

---

## 🔄 Flujo de Funcionamiento

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FLUJO COMPLETO                              │
└─────────────────────────────────────────────────────────────────────┘

Usuario accede a /network-config
            │
            ▼
┌──────────────────────────────────────────┐
│  PASO 1: Seleccionar Tipo de Red         │
│  ─────────────────────────────────       │
│                                          │
│  Se muestra NetworkTypeSelectorComponent │
│                                          │
│  Usuario ve 6 tarjetas de tipos:         │
│  • LAN                                   │
│  • WAN                                   │
│  • DMZ                                   │
│  • Industrial                            │
│  • Wireless                              │
│  • Cloud/Híbrida                         │
│                                          │
│  Usuario hace clic en una tarjeta        │
│            │                             │
│            ▼                             │
│  Se muestra panel de detalles            │
│  Se inicia animación de "escaneo"        │
│            │                             │
│            ▼                             │
│  Usuario hace clic en "Confirmar"        │
│            │                             │
│            ▼                             │
│  Componente hijo EMITE evento:           │
│  networkSelected.emit(network)           │
│            │                             │
└────────────│─────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  PADRE RECIBE EL EVENTO             │
│  ─────────────────────────────────  │
│                                     │
│  onNetworkSelected(network) {       │
│    this._selectedNetwork.set(...)   │
│    this.steps[0].completado = true  │
│    this.nextStep()  ◄── Avanza      │
│  }                                  │
│                                     │
└─────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  PASO 2: Detección de Dispositivos  │
│  ─────────────────────────────────  │
│                                     │
│  Muestra resumen de red elegida     │
│  Escanea dispositivos en la red     │
│  (Aquí iría otro componente hijo)   │
│                                     │
│  Usuario clic "Siguiente"           │
│            │                        │
└────────────│────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  PASO 3: Configurar Seguridad       │
│  ─────────────────────────────────  │
│                                     │
│  Configurar políticas IDS/IPS       │
│  Activar Machine Learning           │
│  Definir umbrales de alertas        │
│  (Aquí iría otro componente hijo)   │
│                                     │
│  Usuario clic "Siguiente"           │
│            │                        │
└────────────│────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│  PASO 4: Activar Sistema            │
│  ─────────────────────────────────  │
│                                     │
│  Muestra resumen de configuración   │
│  Usuario clic "Activar Sistema"     │
│            │                        │
│            ▼                        │
│  finishConfiguration() {            │
│    - Guarda en backend              │
│    - Muestra animación éxito        │
│    - Redirige a /dashboard          │
│  }                                  │
│                                     │
└─────────────────────────────────────┘
             │
             ▼
    ┌─────────────────┐
    │    DASHBOARD    │
    │  Sistema activo │
    └─────────────────┘
```

---

## 👨‍👩‍👦 Componente Padre: NetworkConfigComponent

### ¿Qué hace?

El componente padre es el **controlador principal** del wizard. Sus responsabilidades son:

1. **Mostrar el stepper** (indicador de pasos: 1 → 2 → 3 → 4)
2. **Controlar qué paso se muestra** según el estado actual
3. **Guardar los datos** que vienen de los componentes hijos
4. **Navegar** entre pasos (siguiente, anterior, ir a paso específico)
5. **Finalizar** el proceso y redirigir al dashboard

### Estado que maneja

```typescript
// Señales (signals) del componente padre
_currentStep = signal<number>(1);           // Paso actual (1, 2, 3 o 4)
_selectedNetwork = signal<NetworkType | null>(null);  // Red elegida
_configCompleted = signal<boolean>(false);  // ¿Terminó el wizard?

// Array de pasos
steps: ConfigStep[] = [
  { id: 1, titulo: 'Tipo de Red', completado: false },
  { id: 2, titulo: 'Dispositivos', completado: false },
  { id: 3, titulo: 'Seguridad', completado: false },
  { id: 4, titulo: 'Monitoreo', completado: false }
];
```

### Métodos principales

| Método | ¿Qué hace? | ¿Cuándo se usa? |
|--------|-----------|-----------------|
| `onNetworkSelected(network)` | Guarda la red y avanza al paso 2 | Cuando el hijo emite el evento |
| `nextStep()` | Incrementa `currentStep` en 1 | Clic en botón "Siguiente" |
| `previousStep()` | Decrementa `currentStep` en 1 | Clic en botón "Anterior" |
| `goToStep(id)` | Va a un paso específico | Clic en el stepper |
| `finishConfiguration()` | Completa todo y redirige | Clic en "Activar Sistema" |

### Template (simplificado)

```html
<!-- El padre decide qué mostrar según el paso actual -->
@switch (currentStep()) {
  @case (1) {
    <!-- Muestra el componente hijo -->
    <app-network-type-selector
      (networkSelected)="onNetworkSelected($event)">
    </app-network-type-selector>
  }
  @case (2) {
    <!-- Contenido del paso 2 -->
  }
  @case (3) {
    <!-- Contenido del paso 3 -->
  }
  @case (4) {
    <!-- Contenido del paso 4 -->
  }
}
```

---

## 👶 Componente Hijo: NetworkTypeSelectorComponent

### ¿Qué hace?

El componente hijo es **especializado** en una sola tarea: mostrar las opciones de tipos de red y permitir al usuario seleccionar una. Sus responsabilidades son:

1. **Mostrar** las 6 tarjetas de tipos de red
2. **Animar** la selección con efectos visuales
3. **Mostrar detalles** de la red seleccionada
4. **Simular** un escaneo de red (barra de progreso)
5. **Emitir** la selección al padre cuando el usuario confirma

### ¿Qué NO hace?

- ❌ No sabe en qué paso del wizard está
- ❌ No navega a otros pasos
- ❌ No guarda la configuración final
- ❌ No conoce los otros pasos

### Estado que maneja

```typescript
// Solo estado local para la UI
_selectedNetwork = signal<NetworkType | null>(null);  // Red seleccionada temporalmente
_isScanning = signal<boolean>(false);                  // ¿Está escaneando?
_scanProgress = signal<number>(0);                     // Progreso 0-100%

// Output para comunicarse con el padre
networkSelected = output<NetworkType>();  // Evento que emite al confirmar
```

### Flujo interno

```
Usuario hace clic en tarjeta "Red LAN"
            │
            ▼
selectNetwork(network) {
  this._selectedNetwork.set(network);  // Guarda localmente
  this.startScanSimulation();          // Inicia animación
}
            │
            ▼
Se muestra panel de detalles con:
  - Características de la red
  - Visualización de topología animada
  - Barra de progreso de escaneo
            │
            ▼
Usuario hace clic en "Confirmar Selección"
            │
            ▼
confirmSelection() {
  const network = this._selectedNetwork();
  this.networkSelected.emit(network);  // ¡EMITE AL PADRE!
}
            │
            ▼
El PADRE recibe el evento y toma el control
```

---

## 🔗 Comunicación entre Componentes

### Del Hijo al Padre (Output)

```typescript
// En el HIJO (network-type-selector.component.ts)
networkSelected = output<NetworkType>();  // Declara el output

confirmSelection(): void {
  const network = this._selectedNetwork();
  if (network) {
    this.networkSelected.emit(network);  // Emite el evento
  }
}
```

```html
<!-- En el PADRE (network-config.component.html) -->
<app-network-type-selector
  (networkSelected)="onNetworkSelected($event)">
  <!-- El padre "escucha" el evento networkSelected -->
</app-network-type-selector>
```

```typescript
// En el PADRE (network-config.component.ts)
onNetworkSelected(network: NetworkType): void {
  // Recibe los datos del hijo
  this._selectedNetwork.set(network);  // Guarda la red
  this.steps[0].completado = true;     // Marca paso 1 como completado
  this.nextStep();                     // Avanza al paso 2
}
```

### Diagrama de comunicación

```
┌────────────────────────┐         ┌────────────────────────┐
│         HIJO           │         │         PADRE          │
│  NetworkTypeSelector   │         │     NetworkConfig      │
├────────────────────────┤         ├────────────────────────┤
│                        │         │                        │
│  Usuario confirma      │         │                        │
│         │              │         │                        │
│         ▼              │         │                        │
│  networkSelected.emit()│────────►│  onNetworkSelected()   │
│                        │ EVENTO  │         │              │
│                        │         │         ▼              │
│                        │         │  Guarda la red         │
│                        │         │  Marca completado      │
│                        │         │  Navega a paso 2       │
│                        │         │                        │
└────────────────────────┘         └────────────────────────┘
```

---

## 📝 Los 4 Pasos del Wizard

### Paso 1: Tipo de Red ✅ (Implementado)

**Componente:** `NetworkTypeSelectorComponent`

**Objetivo:** El usuario elige qué tipo de red va a monitorear.

**Acciones del usuario:**
1. Ver las 6 tarjetas de tipos de red
2. Hacer clic en una tarjeta para seleccionarla
3. Ver los detalles y la topología animada
4. Hacer clic en "Confirmar Selección"

**Resultado:** Se guarda el tipo de red y se avanza al paso 2.

---

### Paso 2: Detección de Dispositivos ⏳ (Por implementar)

**Componente sugerido:** `DeviceDiscoveryComponent`

**Objetivo:** Escanear la red y detectar todos los dispositivos conectados.

**Lo que debería hacer:**
1. Mostrar un resumen de la red seleccionada en el paso 1
2. Iniciar un escaneo de la red (simulado o real)
3. Mostrar los dispositivos encontrados en una tabla o grid
4. Permitir al usuario clasificar/etiquetar dispositivos
5. Mostrar estadísticas (total dispositivos, por tipo, etc.)

**Mockup de funcionalidad:**
```
┌─────────────────────────────────────────────────────────────┐
│  PASO 2: Detección de Dispositivos                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Red seleccionada: LAN Corporativa                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  ESCANEANDO RED...  ████████████░░░░░░░░  67%       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Dispositivos encontrados: 47                               │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┐              │
│  │ Routers  │ Switches │ Servers  │ Endpoints│              │
│  │    3     │    8     │    12    │    24    │              │
│  └──────────┴──────────┴──────────┴──────────┘              │
│                                                             │
│  [Anterior]                        [Siguiente: Seguridad]   │
└─────────────────────────────────────────────────────────────┘
```

---

### Paso 3: Configuración de Seguridad ⏳ (Por implementar)

**Componente sugerido:** `SecurityConfigComponent`

**Objetivo:** Configurar las políticas de seguridad y detección.

**Lo que debería hacer:**
1. Configurar reglas del IDS/IPS
2. Activar/desactivar módulos de ML
3. Definir umbrales de alertas (bajo, medio, alto)
4. Configurar notificaciones (email, SMS, webhook)
5. Definir horarios de monitoreo intensivo

**Mockup de funcionalidad:**
```
┌─────────────────────────────────────────────────────────────┐
│  PASO 3: Configuración de Seguridad                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  MÓDULOS DE DETECCIÓN                               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  [✓] Detección de Intrusiones (IDS)                 │    │
│  │  [✓] Prevención de Intrusiones (IPS)                │    │
│  │  [✓] Detección de Anomalías (ML)                    │    │
│  │  [✓] Análisis de Comportamiento                     │    │
│  │  [ ] Honeypots                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Nivel de sensibilidad: [====●=====] Medio                  │
│                                                             │
│  [Anterior]                         [Siguiente: Activar]    │
└─────────────────────────────────────────────────────────────┘
```

---

### Paso 4: Activación del Sistema ✅ (Implementado básico)

**Incluido en:** `NetworkConfigComponent` (padre)

**Objetivo:** Mostrar resumen y activar el sistema.

**Lo que hace:**
1. Mostrar resumen de toda la configuración
2. Botón para activar el sistema
3. Animación de éxito
4. Redirección al dashboard

---

## 🌐 Tipos de Red Disponibles

| ID | Nombre | Descripción | Riesgo | Color |
|----|--------|-------------|--------|-------|
| `lan` | Red LAN | Red de Área Local - Oficinas y edificios | Bajo | `#00ff88` |
| `wan` | Red WAN | Red de Área Amplia - Múltiples ubicaciones | Alto | `#00d4ff` |
| `dmz` | Zona DMZ | Zona Desmilitarizada - Servicios públicos | Alto | `#ff3366` |
| `industrial` | Red Industrial | SCADA/ICS - Control industrial | Alto | `#ffaa00` |
| `wireless` | Red Inalámbrica | WiFi Enterprise | Medio | `#a855f7` |
| `cloud` | Cloud/Híbrida | AWS, Azure, GCP + on-premise | Medio | `#3b82f6` |

### Estructura de datos de cada tipo

```typescript
interface NetworkType {
  id: string;              // Identificador único
  nombre: string;          // Nombre para mostrar
  descripcion: string;     // Descripción larga
  icon: string;            // Icono de Material Icons
  caracteristicas: string[]; // Lista de características
  dispositivos: number;    // Cantidad típica de dispositivos
  velocidad: string;       // Velocidad típica
  cobertura: string;       // Alcance geográfico
  protocolos: string[];    // Protocolos soportados
  color: string;           // Color del tema
  riesgo: 'bajo' | 'medio' | 'alto'; // Nivel de riesgo
}
```

---

## 📁 Estructura de Archivos

```
src/app/features/network-config/
│
├── network-config.component.ts      # Componente PADRE (wizard)
├── network-config.component.html    # Template del wizard
├── network-config.component.scss    # Estilos del wizard
│
└── network-type-selector/           # Componente HIJO (paso 1)
    ├── network-type-selector.component.ts
    ├── network-type-selector.component.html
    └── network-type-selector.component.scss

# Futuras expansiones:
├── device-discovery/                # Componente para paso 2
│   ├── device-discovery.component.ts
│   ├── device-discovery.component.html
│   └── device-discovery.component.scss
│
└── security-config/                 # Componente para paso 3
    ├── security-config.component.ts
    ├── security-config.component.html
    └── security-config.component.scss
```

---

## 🛠️ Guía de Implementación

### Paso 1: Crear la estructura de carpetas

```bash
mkdir -p src/app/features/network-config/network-type-selector
```

### Paso 2: Crear el componente hijo

Crear los 3 archivos del `NetworkTypeSelectorComponent` con el código proporcionado.

### Paso 3: Crear el componente padre

Crear los 3 archivos del `NetworkConfigComponent` con el código proporcionado.

### Paso 4: Agregar la ruta

En `app.routes.ts`:

```typescript
{
  path: 'network-config',
  loadComponent: () => import('./features/network-config/network-config.component')
    .then(m => m.NetworkConfigComponent),
  title: 'Configuración de Red | SENTINEL-ML'
}
```

### Paso 5: Agregar al menú del sidebar

```html
<a routerLink="/network-config" class="menu-item">
    <i class="bi bi-hdd-network-fill menu-item-icon"></i>
    <span class="menu-item-text">Network Config</span>
    <span class="menu-item-badge primary">New</span>
</a>
```

### Paso 6: Probar

1. Navegar a `/network-config`
2. Seleccionar un tipo de red
3. Confirmar selección
4. Verificar que avanza al paso 2

---

## 🔮 Próximos Pasos (TODO)

- [ ] Implementar `DeviceDiscoveryComponent` para el paso 2
- [ ] Implementar `SecurityConfigComponent` para el paso 3
- [ ] Conectar con API backend real
- [ ] Agregar validaciones en cada paso
- [ ] Implementar persistencia de configuración
- [ ] Agregar tests unitarios

---

## 📞 Soporte

Si tienes dudas sobre la implementación, revisa:

1. La comunicación padre-hijo con `output()` y `signal()`
2. Las animaciones de Angular (`@angular/animations`)
3. El flujo de datos unidireccional (hijo → padre)

---

**Autor:** SENTINEL-ML Development Team  
**Versión:** 1.0.0  
**Última actualización:** Enero 2025
