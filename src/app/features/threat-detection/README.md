{
  path: 'threats',
  loadComponent: () => import('./features/threat-detection/threat-detection.component')
    .then(m => m.ThreatDetectionComponent),
  title: 'Detección de Amenazas | SENTINEL-ML'
},
```

---

## **6. DIAGRAMA DE CONEXIONES COMPLETO**
```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    MAPA DE CONEXIONES - THREAT DETECTION                        │
└─────────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────┐
                              │   NETWORK CONFIG     │
                              │   (Configuración)    │
                              └──────────┬───────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    │  RECIBE:                                │
                    │  • Políticas de seguridad activas       │
                    │  • Nivel de alerta configurado          │
                    │  • Clasificación de seguridad           │
                    │  • Reglas de detección                  │
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         │
                                         ▼
┌──────────────────────┐       ┌──────────────────────────────────────┐
│    NETWORK FLOWS     │       │                                      │
│   (Flujos de Red)    │──────►│         THREAT DETECTION             │
└──────────────────────┘       │       (Este Componente)              │
         │                     │                                      │
         │  RECIBE:            │   • Recibe flujos sospechosos        │
         │  • Flujos con       │   • Correlaciona eventos             │
         │    threatScore>50   │   • Genera alertas                   │
         │  • IOCs detectados  │   • Gestiona investigaciones         │
         │  • Eventos de red   │   • Ejecuta acciones de respuesta    │
         │                     │                                      │
         └─────────────────────┤                                      │
                               └──────────────────────────────────────┘
                                         │
          ┌──────────────────────────────┼──────────────────────────────┐
          │                              │                              │
          ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│    MOTOR ML      │          │    DASHBOARD     │          │ SIEM INTEGRATION │
│  (Predicciones)  │          │   (Métricas)     │          │  (Correlación)   │
└──────────────────┘          └──────────────────┘          └──────────────────┘
         │                              │                              │
         │                              │                              │
    BIDIRECCIONAL:                 ENVÍA:                         ENVÍA:
    • Envía muestras              • KPIs amenazas                • Alertas SIEM
    • Recibe scores               • Stats detección              • Logs forenses
    • Recibe categorías           • Tendencias                   • IOCs bloqueados
    • Recibe confianza            • Top atacantes                • Timeline eventos
         │                              │                              │
         └──────────────────────────────┼──────────────────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │    INCIDENT      │
                              │    RESPONSE      │
                              │  (Respuesta)     │
                              └──────────────────┘
                                        │
                                   ENVÍA:
                                   • Incidentes escalados
                                   • Playbooks activados
                                   • Acciones ejecutadas
                                   • Tickets creados


┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE DATOS DETALLADO                              │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ NETWORK     │
    │ FLOWS       │
    └──────┬──────┘
           │
           │ 1. Detecta flujo sospechoso (threatScore > umbral)
           │
           ▼
    ┌─────────────────────────────────────────────────────────────────┐
    │                    THREAT DETECTION SERVICE                     │
    │                                                                 │
    │  createAlertFromFlow(flow) {                                    │
    │    1. Mapea threatType → ThreatCategory                         │
    │    2. Calcula severidad según score                             │
    │    3. Mapea a MITRE ATT&CK                                      │
    │    4. Extrae IOCs (IPs, hashes, dominios)                       │
    │    5. Crea alerta con toda la información                       │
    │    6. Emite a BehaviorSubject para suscriptores                 │
    │  }                                                              │
    └─────────────────────────────────────────────────────────────────┘
           │
           ├──────────────────┬──────────────────┬──────────────────┐
           │                  │                  │                  │
           ▼                  ▼                  ▼                  ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ UI Component│    │  Dashboard  │    │    SIEM     │    │  Incident   │
    │ (Alertas)   │    │ (Statistics)│    │ (Export)    │    │  Response   │
    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
### 7. Tabla Resumen de Conexiones

| Componente Origen | Componente Destino | Tipo de Flujo     | Datos Intercambiados                              |
|-------------------|--------------------|-------------------|---------------------------------------------------|
| Network Config    | Threat Detection   | → Envía           | Políticas, nivel de alerta, clasificación, reglas |
| Network Flows     | Threat Detection   | → Envía           | Flujos sospechosos, IOCs, eventos                 |
| Threat Detection  | Motor ML           | ↔ Bidireccional   | Muestras (envía) / Scores, categorías (recibe)    |
| Threat Detection  | Dashboard          | → Envía           | KPIs, estadísticas, tendencias, top atacantes     |
| Threat Detection  | SIEM Integration   | → Envía           | Alertas SIEM, logs, IOCs, timeline                |
| Threat Detection  | Incident Response  | → Envía           | Incidentes, playbooks, acciones                   |

    