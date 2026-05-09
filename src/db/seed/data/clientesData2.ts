import { InsertCliente } from '@/src/fetatures/clientes/types/cliente.types';

// Mismo CREATOR_ID que en clientesData.ts — edítalo si es necesario
const CREATOR_ID = 'x2A0pmHwu86nqp6g2Xm5q6REsvvKNvNS';

export const clientesData2: InsertCliente[] = [
  // ── 11. Family Office — Madrid ────────────────────────────────────────────
  {
    nombre: 'Ignacio Velázquez Medrano',
    dni: '51234890T',
    empresa: 'Velázquez Patrimonio S.L.',
    nif: 'B-78901234',
    imagen: null,
    direccion: 'Calle Ortega y Gasset, 28, 6º',
    provincia: 'Madrid',
    municipio: 'Madrid',
    codigoPostal: '28006',
    emails: [{ titulo: 'Corporativo', valor: 'ivelazquez@velazquezpatrimonio.com' }],
    telefonos: [
      { titulo: 'Móvil', valor: '+34 620 234 890' },
      { titulo: 'Oficina', valor: '+34 914 234 890' },
    ],
    contactos: [
      { titulo: 'LinkedIn', valor: 'linkedin.com/in/ignaciovelazquezm' },
      { titulo: 'Web', valor: 'velazquezpatrimonio.com' },
    ],
    perfilInversor: 'FAMILY_OFFICE',
    ocupacionPrincipal: 'INVERSOR_TIEMPO_COMPLETO',
    rangoCapitalInvertir: 'MAS_500K',
    activosInteresado: ['VIVIENDA', 'OFICINA', 'LOCAL', 'NAVE'],
    experienciaPreviaDetalle:
      'Gestión de un patrimonio familiar de 3ª generación. Cartera de 22 inmuebles en alquiler entre Madrid y Marbella. Tres operaciones NPL en los últimos 18 meses con ROI promedio 74%.',
    informadoNplDetalle:
      'Cliente de alto valor captado mediante referencia directa de Roberto Fuentes Molina (cliente nº 8).',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Operaciones mínimas de 500K. Requiere exclusividad temporal durante due diligence. Decide en 48h una vez tiene el dosier completo. Reunión presencial cada trimestre en Madrid.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-01-15'),
    creatorId: CREATOR_ID,
  },

  // ── 12. Inversor particular — Córdoba ─────────────────────────────────────
  {
    nombre: 'Carmen Lozano Aguilar',
    dni: '30234567C',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Avenida de América, 15, 4º B',
    provincia: 'Córdoba',
    municipio: 'Córdoba',
    codigoPostal: '14005',
    emails: [{ titulo: 'Personal', valor: 'carmen.lozano.aguilar@gmail.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 658 234 567' }],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'PROFESIONAL_LIBERAL',
    rangoCapitalInvertir: '50K_100K',
    activosInteresado: ['VIVIENDA'],
    experienciaPreviaDetalle:
      'Arquitecta. Experiencia en tasación y reforma de inmuebles. Ha comprado 2 pisos directamente en Córdoba. Primera operación con crédito hipotecario.',
    informadoNplDetalle:
      'Encontró el producto a través de un blog de inversión inmobiliaria que mencionó el proceso NPL.',
    estado: 'PROSPECTO',
    fuenteCaptacion: 'WEB',
    notas:
      'Perfil muy técnico. Analiza bien los inmuebles. Interesada en operaciones en Córdoba capital o municipios cercanos. Primer contacto muy positivo. Enviar ficha de operación Córdoba.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-03-22'),
    creatorId: CREATOR_ID,
  },

  // ── 13. Asesor profesional — Valladolid ───────────────────────────────────
  {
    nombre: 'Javier Herrero Santamaría',
    dni: '12345678J',
    empresa: 'Herrero & Asociados Gestión Patrimonial',
    nif: null,
    imagen: null,
    direccion: 'Calle Ferrari, 12, 2º',
    provincia: 'Valladolid',
    municipio: 'Valladolid',
    codigoPostal: '47004',
    emails: [
      { titulo: 'Profesional', valor: 'jherrero@herreroasociados.com' },
      { titulo: 'Personal', valor: 'javierherrero78@hotmail.com' },
    ],
    telefonos: [
      { titulo: 'Despacho', valor: '+34 983 456 789' },
      { titulo: 'Móvil', valor: '+34 609 456 789' },
    ],
    contactos: [{ titulo: 'Web', valor: 'herreroasociados.com' }],
    perfilInversor: 'ASESOR_PROFESIONAL',
    ocupacionPrincipal: 'PROFESIONAL_LIBERAL',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'OFICINA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Gestor patrimonial independiente. Gestiona la inversión de 15 clientes privados en Castilla y León. Primera experiencia con NPL buscando ampliar oferta de productos alternativos.',
    informadoNplDetalle:
      'Conoció el producto en un evento organizado por la Cámara de Comercio de Valladolid.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'EVENTO',
    notas:
      'Mucho potencial como canal de distribución en Castilla y León. Organizado y puntual. Solicita dosier en formato Word para personalizar para sus clientes. Reunión mensual por videollamada.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-02-10'),
    creatorId: CREATOR_ID,
  },

  // ── 14. Particular activo — Palma de Mallorca ─────────────────────────────
  {
    nombre: 'Marc Alcover Seguí',
    dni: '43567890M',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Carrer de Can Valero, 4, 1º',
    provincia: 'Baleares',
    municipio: 'Palma de Mallorca',
    codigoPostal: '07011',
    emails: [{ titulo: 'Personal', valor: 'marc.alcover@icloud.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 671 567 890' }],
    contactos: [{ titulo: 'Instagram', valor: '@marc_inversions' }],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Propietario de empresa de servicios turísticos. Cinco pisos en alquiler vacacional en Mallorca. Segunda operación con nosotros (ya participó en Operación Benidorm).',
    informadoNplDetalle:
      'Cliente recurrente. Conoce el producto en detalle.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Cliente de confianza. Siempre ha cumplido plazos de pago. Muy interesado en operaciones en Baleares o zonas turísticas. Prioridad alta para nuevas operaciones.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2025-12-01'),
    creatorId: CREATOR_ID,
  },

  // ── 15. Inmobiliaria — Sevilla ────────────────────────────────────────────
  {
    nombre: 'Pilar Ojeda Fuentes',
    dni: '28789012P',
    empresa: 'Ojeda Gestión Inmobiliaria S.L.',
    nif: 'B-41567890',
    imagen: null,
    direccion: 'Calle Sierpes, 34, 3º',
    provincia: 'Sevilla',
    municipio: 'Sevilla',
    codigoPostal: '41004',
    emails: [
      { titulo: 'Corporativo', valor: 'pilar@ojedainmobiliaria.es' },
      { titulo: 'Personal', valor: 'pilarodejaf@gmail.com' },
    ],
    telefonos: [
      { titulo: 'Empresa', valor: '+34 954 789 012' },
      { titulo: 'Móvil', valor: '+34 652 789 012' },
    ],
    contactos: [
      { titulo: 'Web', valor: 'ojedainmobiliaria.es' },
      { titulo: 'Instagram', valor: '@ojeda_inmobiliaria' },
    ],
    perfilInversor: 'INMOBILIARIA',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '250K_500K',
    activosInteresado: ['VIVIENDA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Agencia inmobiliaria con 20 años en Sevilla y área metropolitana. Red de 3 oficinas. Especializada en venta de activos adjudicados bancarios. Primera operación NPL en tramitación.',
    informadoNplDetalle:
      'Contacto directo en feria inmobiliaria de Sevilla (SIMA). Muy interesada en el modelo de negocio.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'EVENTO',
    notas:
      'Excelente red de compradores finales en Sevilla. Puede acelerar la fase de venta del activo. Operaciones entre 200K y 500K. Reunión presencial en su oficina de Sierpes pendiente.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-04-14'),
    creatorId: CREATOR_ID,
  },

  // ── 16. Inversor recurrente — San Sebastián ───────────────────────────────
  {
    nombre: 'Amaia Larrañaga Etxeberria',
    dni: '72890123A',
    empresa: 'Larrañaga Inversiones S.C.',
    nif: null,
    imagen: null,
    direccion: 'Paseo de La Concha, 7, 5º',
    provincia: 'Guipúzcoa',
    municipio: 'San Sebastián',
    codigoPostal: '20003',
    emails: [{ titulo: 'Principal', valor: 'amaia.larranaga@larrainv.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 688 901 234' }],
    contactos: [{ titulo: 'LinkedIn', valor: 'linkedin.com/in/amaia-larranaga' }],
    perfilInversor: 'FAMILY_OFFICE',
    ocupacionPrincipal: 'INVERSOR_TIEMPO_COMPLETO',
    rangoCapitalInvertir: 'MAS_500K',
    activosInteresado: ['VIVIENDA', 'OFICINA'],
    experienciaPreviaDetalle:
      'Inversora profesional. Gestiona patrimonio propio y de familia. Cartera de 8 inmuebles en el País Vasco y Navarra. Tres operaciones NPL previas con ROI promedio 82%.',
    informadoNplDetalle:
      'Inversora habitual, procede de otro operador del mercado.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Perfil muy exigente pero paga puntual. Prioriza la seguridad jurídica del expediente. Requiere validación notarial previa. Excelente cliente a largo plazo.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2025-10-20'),
    creatorId: CREATOR_ID,
  },

  // ── 17. Prospecto frío — Toledo ───────────────────────────────────────────
  {
    nombre: 'David Martínez Alonso',
    dni: '05678901D',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Calle Armas, 14, 2º C',
    provincia: 'Toledo',
    municipio: 'Toledo',
    codigoPostal: '45002',
    emails: [{ titulo: 'Personal', valor: 'david.martinez.alonso@outlook.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 634 901 234' }],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'DIRECTIVO',
    rangoCapitalInvertir: '50K_100K',
    activosInteresado: ['VIVIENDA'],
    experienciaPreviaDetalle:
      'Director de área en empresa industrial. Sin inversiones inmobiliarias previas. Patrimonio en fondos y depósitos. Busca diversificar hacia activos reales.',
    informadoNplDetalle:
      'Contactó por recomendación de un compañero de trabajo que es cliente nuestro.',
    estado: 'PROSPECTO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Perfil muy conservador. Necesita mucha información antes de decidir. Interesado en operaciones en Toledo o Madrid. Pendiente de segunda llamada y envío de guía informativa.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-04-18'),
    creatorId: CREATOR_ID,
  },

  // ── 18. Inmobiliaria — Vigo ───────────────────────────────────────────────
  {
    nombre: 'Ramón Fernández Caamaño',
    dni: '35567890R',
    empresa: 'Galicia Premium Real Estate S.L.',
    nif: 'B-36123456',
    imagen: null,
    direccion: 'Gran Vía, 65, 2º',
    provincia: 'Pontevedra',
    municipio: 'Vigo',
    codigoPostal: '36204',
    emails: [
      { titulo: 'Corporativo', valor: 'rfernandez@galiciapremium.es' },
      { titulo: 'Personal', valor: 'ramoncaamanio@gmail.com' },
    ],
    telefonos: [
      { titulo: 'Empresa', valor: '+34 986 567 890' },
      { titulo: 'Móvil', valor: '+34 685 567 890' },
    ],
    contactos: [{ titulo: 'Web', valor: 'galiciapremium.es' }],
    perfilInversor: 'INMOBILIARIA',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'LOCAL', 'GARAJE'],
    experienciaPreviaDetalle:
      'Inmobiliaria activa en Vigo, Pontevedra y A Coruña. 18 años en el sector. Experiencia con activos de fondos bancarios. Primera operación NPL en evaluación.',
    informadoNplDetalle:
      'Encontró la empresa en LinkedIn y contactó directamente.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'LINKEDIN',
    notas:
      'Conoce bien el mercado gallego. Red de compradores en Vigo y área metropolitana. Posible socio operativo para la región noroeste. Pendiente de reunión por videollamada.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-03-30'),
    creatorId: CREATOR_ID,
  },

  // ── 19. Jubilado capitalista — Pamplona ───────────────────────────────────
  {
    nombre: 'Luis Iriarte Goñi',
    dni: '15789012L',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Avenida de Bayona, 10, 3º D',
    provincia: 'Navarra',
    municipio: 'Pamplona',
    codigoPostal: '31011',
    emails: [{ titulo: 'Personal', valor: 'luisiriarte59@gmail.com' }],
    telefonos: [
      { titulo: 'Fijo', valor: '+34 948 789 012' },
      { titulo: 'Móvil', valor: '+34 690 789 012' },
    ],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'JUBILADO',
    rangoCapitalInvertir: '25K_50K',
    activosInteresado: ['VIVIENDA', 'GARAJE', 'TRASTERO'],
    experienciaPreviaDetalle:
      'Ex notario jubilado. Excelente conocimiento del derecho hipotecario y procesal. Invierte ahorros en activos seguros. Ha participado ya en dos operaciones de garaje con nosotros.',
    informadoNplDetalle:
      'Cliente recurrente. Captado en un evento de la Cámara de Notarios de Navarra.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'EVENTO',
    notas:
      'Perfil conservador de altísima fiabilidad. Sus conocimientos legales son un activo — puede detectar incidencias registrales. Prioridad para operaciones en Navarra y País Vasco.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2025-09-14'),
    creatorId: CREATOR_ID,
  },

  // ── 20. Inversor activo — Almería ─────────────────────────────────────────
  {
    nombre: 'Sergio Quesada Pérez',
    dni: '27012345S',
    empresa: 'SQ Inversiones Inmobiliarias',
    nif: null,
    imagen: null,
    direccion: 'Paseo de Almería, 34, 1º',
    provincia: 'Almería',
    municipio: 'Almería',
    codigoPostal: '04001',
    emails: [{ titulo: 'Principal', valor: 'sergio@sqinversiones.es' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 662 012 345' }],
    contactos: [
      { titulo: 'LinkedIn', valor: 'linkedin.com/in/sergio-quesada-almeria' },
    ],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'INVERSOR_TIEMPO_COMPLETO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'SOLAR', 'LOCAL'],
    experienciaPreviaDetalle:
      'Inversor activo en Almería y Costa Tropical. Especialista en reforma y venta de activos en zonas costeras. Seis operaciones NPL con distintos operadores, ROI promedio 65%.',
    informadoNplDetalle:
      'Inversor habitual, se interesó por la operación Solar Almería Poniente.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'WEB',
    notas:
      'Muy conocedor del mercado local de Almería, Mojácar y Roquetas. Decide rápido si el expediente es sólido. Alto potencial para operaciones en la provincia. Ya ha preguntado por la operación 016.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-04-05'),
    creatorId: CREATOR_ID,
  },
];
