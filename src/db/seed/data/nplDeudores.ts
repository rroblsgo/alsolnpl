import { InsertNplDeudor } from '@/src/fetatures/gestion_npl/types/npl.types';

// IMPORTANTE: los nplId aquí son los ids que se asignarán en orden de inserción.
// Si tu tabla npls ya tiene registros, ajusta los nplId al id real devuelto por el seed.
// Si insertas los 10 npls en una base de datos limpia empezarán en id=1.

export const nplDeudores: InsertNplDeudor[] = [
  // ─── NPL 7 (Caravaca) — segunda deudora / titular registral ──────────────
  {
    nplId: 7,
    nombre: 'María Gema Calderón Soriano',
    dni: '34830938Z',
    direccionCompleta: 'Travesía Sánchez Olmos, s/n — 30400 Caravaca de la Cruz (Murcia)',
    estadoOcupacional: 'Titular registral al 100% en pleno dominio (carácter privativo, sep. de bienes). No ocupa el inmueble actualmente.',
    vulnerabilidad: 'No consta declaración de vulnerabilidad.',
    notas: 'Titular registral aunque no deudora directa. Necesaria su notificación procesal.',
  },

  // ─── NPL 4 (Valencia) — cónyuge coprestatario ────────────────────────────
  {
    nplId: 4,
    nombre: 'José Antonio Ferrer Soler',
    dni: '19876543M',
    direccionCompleta: 'Carrer de Colón, 87, 5º C — 46004 Valencia',
    estadoOcupacional: 'Convive con la deudora principal. Coprestatario del préstamo hipotecario.',
    vulnerabilidad: 'Pendiente de verificación junto con la deudora principal.',
    notas: 'Cónyuge coprestatario. Negociación conjunta con ambos.',
  },

  // ─── NPL 8 (Barcelona) — segunda deudora ─────────────────────────────────
  {
    nplId: 8,
    nombre: 'Anna Rossell Torrent',
    dni: '53210987H',
    direccionCompleta: 'Carrer de Pallars, 201, 4º 2ª — 08005 Barcelona',
    estadoOcupacional: 'Convive con el deudor principal. Coprestataria solidaria.',
    vulnerabilidad: 'Presentó documentación de vulnerabilidad junto con el deudor principal.',
    notas: 'Coordinación conjunta. Ambos deudores con representación letrada única.',
  },

  // ─── NPL 3 (Madrid Local) — administrador solidario ──────────────────────
  {
    nplId: 3,
    nombre: 'Elena García Sánchez',
    dni: '51234987V',
    direccionCompleta: 'Calle Alcalá, 120, 6º B — 28009 Madrid',
    estadoOcupacional: 'No aplica. Administradora solidaria de Comercial RGP S.L.',
    vulnerabilidad: 'No aplica.',
    notas: 'Administradora solidaria con responsabilidad personal avalando el préstamo. Activo personal verificado.',
  },
];
