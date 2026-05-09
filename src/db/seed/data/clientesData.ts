import { InsertCliente } from '@/src/fetatures/clientes/types/cliente.types';

// Sustituye REPLACE_WITH_YOUR_USER_ID por el id real de tu usuario
const CREATOR_ID = 'x2A0pmHwu86nqp6g2Xm5q6REsvvKNvNS';

export const clientesData: InsertCliente[] = [
  // ── 01. Particular activo — Madrid ────────────────────────────────────────
  {
    nombre: 'Fernando Blanco Herrero',
    dni: '50234781K',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Calle Serrano, 45, 3º D',
    provincia: 'Madrid',
    municipio: 'Madrid',
    codigoPostal: '28001',
    emails: [
      { titulo: 'Principal', valor: 'f.blanco@gmail.com' },
      { titulo: 'Trabajo', valor: 'fblanco@consultoria-mb.es' },
    ],
    telefonos: [{ titulo: 'Móvil', valor: '+34 650 234 781' }],
    contactos: [
      { titulo: 'LinkedIn', valor: 'linkedin.com/in/fernandoblancoh' },
    ],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'DIRECTIVO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Tres operaciones de compraventa inmobiliaria directa en Madrid entre 2018 y 2022. Sin experiencia previa en NPL.',
    informadoNplDetalle:
      'Referido por su gestor patrimonial tras asistir a un webinar sobre inversión alternativa.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Muy interesado en operaciones en Madrid capital. Prefiere activos con ocupación baja o vacíos. Llama mejor por las tardes.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-02-14'),
    creatorId: CREATOR_ID,
  },

  // ── 02. Family Office — Barcelona ─────────────────────────────────────────
  {
    nombre: 'Cristina Mas Puigdomènech',
    dni: '43891234F',
    empresa: 'Mas & Associats Family Office S.L.',
    nif: 'B-66789012',
    imagen: null,
    direccion: 'Passeig de Gràcia, 92, 5º 2ª',
    provincia: 'Barcelona',
    municipio: 'Barcelona',
    codigoPostal: '08008',
    emails: [{ titulo: 'Corporativo', valor: 'cmas@masassociats.com' }],
    telefonos: [
      { titulo: 'Oficina', valor: '+34 932 891 234' },
      { titulo: 'Móvil', valor: '+34 672 891 234' },
    ],
    contactos: [
      { titulo: 'Web', valor: 'masassociats.com' },
      { titulo: 'LinkedIn', valor: 'linkedin.com/in/cristinamasp' },
    ],
    perfilInversor: 'FAMILY_OFFICE',
    ocupacionPrincipal: 'INVERSOR_TIEMPO_COMPLETO',
    rangoCapitalInvertir: 'MAS_500K',
    activosInteresado: ['VIVIENDA', 'OFICINA', 'LOCAL', 'NAVE'],
    experienciaPreviaDetalle:
      'Gestión de patrimonio familiar desde 2015. Cartera de 12 inmuebles en arrendamiento. Dos operaciones de crédito hipotecario en 2023 con ROI >60%.',
    informadoNplDetalle:
      'Experiencia previa con otro operador de NPL. Contacta directamente por recomendación de un abogado mercantilista.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Perfil sofisticado. Requiere informes detallados antes de decidir. Operaciones mínimas de 200K. Reunión presencial en Barcelona pendiente.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-01-20'),
    creatorId: CREATOR_ID,
  },

  // ── 03. Asesor profesional — Sevilla ──────────────────────────────────────
  {
    nombre: 'Miguel Ángel Romero Vázquez',
    dni: '28901234M',
    empresa: 'Romero Inversiones Patrimoniales S.L.',
    nif: 'B-41123456',
    imagen: null,
    direccion: 'Avenida de la Constitución, 21, 2º A',
    provincia: 'Sevilla',
    municipio: 'Sevilla',
    codigoPostal: '41004',
    emails: [{ titulo: 'Principal', valor: 'miguel@romero-inversiones.es' }],
    telefonos: [
      { titulo: 'Móvil', valor: '+34 629 012 345' },
      { titulo: 'Despacho', valor: '+34 954 901 234' },
    ],
    contactos: [],
    perfilInversor: 'ASESOR_PROFESIONAL',
    ocupacionPrincipal: 'PROFESIONAL_LIBERAL',
    rangoCapitalInvertir: '250K_500K',
    activosInteresado: ['VIVIENDA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Asesor financiero independiente. Gestiona carteras de 8 clientes privados con interés en activos alternativos. Ha intermediado en 4 operaciones NPL en Andalucía.',
    informadoNplDetalle:
      'Conoce el mercado NPL desde su actividad profesional como asesor. Busca operaciones para sus clientes en Sevilla y Málaga.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'LINKEDIN',
    notas:
      'Actúa como intermediario para varios clientes. Solicita siempre dosier completo en PDF. Prefiere comunicación por email.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-03-05'),
    creatorId: CREATOR_ID,
  },

  // ── 04. Inversora particular — Valencia ───────────────────────────────────
  {
    nombre: 'Laura Ferri Castelló',
    dni: '73456789P',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Carrer de Colón, 14, 7º 1ª',
    provincia: 'Valencia/València',
    municipio: 'Valencia',
    codigoPostal: '46004',
    emails: [{ titulo: 'Personal', valor: 'lauraferri@outlook.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 644 567 890' }],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '50K_100K',
    activosInteresado: ['VIVIENDA', 'GARAJE'],
    experienciaPreviaDetalle:
      'Propietaria de negocio hostelero. Primera vez que considera inversión en NPL. Tiene liquidez disponible por venta de local en 2025.',
    informadoNplDetalle:
      'Encontró información en web tras búsqueda sobre "invertir en hipotecas".',
    estado: 'PROSPECTO',
    fuenteCaptacion: 'WEB',
    notas:
      'Primera toma de contacto por formulario web en marzo 2026. Pendiente de llamada informativa inicial. Interés real pero requiere explicación detallada del producto.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-03-18'),
    creatorId: CREATOR_ID,
  },

  // ── 05. Inmobiliaria — Málaga ─────────────────────────────────────────────
  {
    nombre: 'Andrés Morales Jiménez',
    dni: '45678901A',
    empresa: 'Costa Sol Inmuebles S.L.',
    nif: 'B-29345678',
    imagen: null,
    direccion: 'Calle Larios, 5, 1º',
    provincia: 'Málaga',
    municipio: 'Málaga',
    codigoPostal: '29005',
    emails: [
      { titulo: 'Corporativo', valor: 'amorales@costasolinmuebles.com' },
      { titulo: 'Personal', valor: 'andresmorales77@gmail.com' },
    ],
    telefonos: [
      { titulo: 'Empresa', valor: '+34 952 678 901' },
      { titulo: 'Móvil', valor: '+34 655 678 901' },
    ],
    contactos: [{ titulo: 'Instagram', valor: '@costasolinmuebles' }],
    perfilInversor: 'INMOBILIARIA',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'LOCAL', 'NAVE'],
    experienciaPreviaDetalle:
      'Empresa inmobiliaria con 15 años de actividad en Costa del Sol. Especializada en compraventa y reforma. Ha adquirido activos adjudicados bancarios pero no créditos hipotecarios directamente.',
    informadoNplDetalle:
      'Asistió a evento de inversión inmobiliaria en Málaga donde se presentó el producto NPL.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'EVENTO',
    notas:
      'Conoce bien el mercado local de Málaga y Marbella. Tiene red de compradores finales. Puede ser partner para venta rápida de activos adjudicados.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-02-28'),
    creatorId: CREATOR_ID,
  },

  // ── 06. Jubilado con capital — Bilbao ─────────────────────────────────────
  {
    nombre: 'José Antonio Uriarte Etxebarria',
    dni: '16234567J',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Gran Vía, 38, 4º B',
    provincia: 'Vizcaya',
    municipio: 'Bilbao',
    codigoPostal: '48009',
    emails: [{ titulo: 'Personal', valor: 'jauriarte@hotmail.com' }],
    telefonos: [
      { titulo: 'Fijo', valor: '+34 944 234 567' },
      { titulo: 'Móvil', valor: '+34 636 234 567' },
    ],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'JUBILADO',
    rangoCapitalInvertir: '25K_50K',
    activosInteresado: ['VIVIENDA', 'GARAJE', 'TRASTERO'],
    experienciaPreviaDetalle:
      'Ex directivo bancario jubilado. Buen conocimiento del sector financiero. Invierte en bolsa y fondos. Primera aproximación al mercado NPL.',
    informadoNplDetalle:
      'Referido por su hijo, que ya invirtió en una operación anterior.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'REFERIDO',
    notas:
      'Perfil conservador pero con conocimiento financiero. Prefiere ticket pequeño para comenzar. Muy puntual y organizado. Comunicación preferente por teléfono.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-03-10'),
    creatorId: CREATOR_ID,
  },

  // ── 07. Profesional liberal — Zaragoza ────────────────────────────────────
  {
    nombre: 'Elena Sánchez Lahoz',
    dni: '17890123E',
    empresa: 'Clínica Dental Sánchez Lahoz',
    nif: null,
    imagen: null,
    direccion: 'Paseo de la Independencia, 17, 3º',
    provincia: 'Zaragoza',
    municipio: 'Zaragoza',
    codigoPostal: '50004',
    emails: [
      { titulo: 'Personal', valor: 'elena.sanchez.lahoz@gmail.com' },
      { titulo: 'Clínica', valor: 'info@clinicasanchezlahoz.com' },
    ],
    telefonos: [{ titulo: 'Móvil', valor: '+34 678 901 234' }],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'PROFESIONAL_LIBERAL',
    rangoCapitalInvertir: '50K_100K',
    activosInteresado: ['VIVIENDA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Odontóloga con clínica propia. Invierte excedentes de tesorería de la clínica. Tiene dos pisos en alquiler en Zaragoza comprados directamente.',
    informadoNplDetalle:
      'Encontró el producto en LinkedIn a través de un artículo sobre inversión alternativa.',
    estado: 'PROSPECTO',
    fuenteCaptacion: 'LINKEDIN',
    notas:
      'Muy ocupada, contactar solo por WhatsApp. Interesada en operaciones en Aragón o cercanas. Pendiente de enviar dosier de operación Zaragoza.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-04-02'),
    creatorId: CREATOR_ID,
  },

  // ── 08. Inversor a tiempo completo — Granada ──────────────────────────────
  {
    nombre: 'Roberto Fuentes Molina',
    dni: '24567890R',
    empresa: 'RF Capital Investments',
    nif: null,
    imagen: null,
    direccion: 'Calle Reyes Católicos, 8, 2º',
    provincia: 'Granada',
    municipio: 'Granada',
    codigoPostal: '18001',
    emails: [{ titulo: 'Principal', valor: 'roberto@rfcapital.es' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 667 890 123' }],
    contactos: [
      { titulo: 'Twitter/X', valor: '@roberto_npl' },
      { titulo: 'LinkedIn', valor: 'linkedin.com/in/robertofuentesmolina' },
    ],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'INVERSOR_TIEMPO_COMPLETO',
    rangoCapitalInvertir: '250K_500K',
    activosInteresado: ['VIVIENDA', 'FINCA_RUSTICA', 'LOCAL'],
    experienciaPreviaDetalle:
      'Inversor profesional desde 2019. Ha participado en 11 operaciones NPL con distintos operadores. ROI medio declarado del 58%. Conoce perfectamente el proceso judicial.',
    informadoNplDetalle:
      'Inversor habitual. Busca diversificar entre operadores.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'WEB',
    notas:
      'Perfil muy profesional. Analiza los expedientes en detalle. Siempre pide NIG y estado procesal antes de decidir. Excelente referencia para captar nuevos inversores.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2025-11-15'),
    creatorId: CREATOR_ID,
  },

  // ── 09. Prospecto frío — Alicante ─────────────────────────────────────────
  {
    nombre: 'Patricia Gómez Torregrosa',
    dni: '21345678P',
    empresa: null,
    nif: null,
    imagen: null,
    direccion: 'Avenida de Maisonnave, 22, 5º A',
    provincia: 'Alicante/Alacant',
    municipio: 'Alicante',
    codigoPostal: '03003',
    emails: [{ titulo: 'Personal', valor: 'patricia.gomez.t@gmail.com' }],
    telefonos: [{ titulo: 'Móvil', valor: '+34 622 345 678' }],
    contactos: [],
    perfilInversor: 'PARTICULAR',
    ocupacionPrincipal: 'DIRECTIVO',
    rangoCapitalInvertir: '25K_50K',
    activosInteresado: ['VIVIENDA'],
    experienciaPreviaDetalle:
      'Sin experiencia en inversión inmobiliaria. Trabaja como directora de operaciones en empresa logística.',
    informadoNplDetalle: 'Contactó tras ver un anuncio en redes sociales.',
    estado: 'PROSPECTO',
    fuenteCaptacion: 'WEB',
    notas:
      'Primera llamada realizada el 10/04/2026. Mostró interés pero necesita más información. Enviar guía informativa de producto. Seguimiento en mayo.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-04-10'),
    creatorId: CREATOR_ID,
  },

  // ── 10. Inmobiliaria — Murcia ─────────────────────────────────────────────
  {
    nombre: 'Carlos Navarro Pérez',
    dni: '77012345C',
    empresa: 'Murcia Activos Inmobiliarios S.L.',
    nif: 'B-30789012',
    imagen: null,
    direccion: 'Gran Vía Escultor Salzillo, 13, 1º',
    provincia: 'Murcia',
    municipio: 'Murcia',
    codigoPostal: '30004',
    emails: [{ titulo: 'Corporativo', valor: 'cnavarro@murciaactivos.com' }],
    telefonos: [
      { titulo: 'Empresa', valor: '+34 968 012 345' },
      { titulo: 'Móvil', valor: '+34 648 012 345' },
    ],
    contactos: [{ titulo: 'Web', valor: 'murciaactivos.com' }],
    perfilInversor: 'INMOBILIARIA',
    ocupacionPrincipal: 'EMPRESARIO',
    rangoCapitalInvertir: '100K_250K',
    activosInteresado: ['VIVIENDA', 'LOCAL', 'NAVE', 'GARAJE'],
    experienciaPreviaDetalle:
      'Inmobiliaria regional con presencia en Murcia, Cartagena y Lorca. Ha adquirido activos de fondos bancarios. Primera operación NPL en tramitación con nosotros.',
    informadoNplDetalle:
      'Contacto directo en evento inmobiliario de Murcia. Conocía la operación Caravaca de la Cruz por el mercado local.',
    estado: 'ACTIVO',
    fuenteCaptacion: 'EVENTO',
    notas:
      'Ya ha formalizado una operación (Caravaca). Muy activo en la zona de Murcia. Buena relación. Potencial para más operaciones en la región.',
    consentimientoRgpd: true,
    fechaConsentimiento: new Date('2026-01-08'),
    creatorId: CREATOR_ID,
  },
];
