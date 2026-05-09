import {
  clientes,
  clienteEstadoEnum,
  clientePerfilEnum,
  clienteOcupacionEnum,
  clienteRangoCapitalEnum,
  clienteFuenteEnum,
} from '@/src/db/schema';

export type InsertCliente = typeof clientes.$inferInsert;
export type SelectCliente = typeof clientes.$inferSelect;

export type ClienteEstado       = (typeof clienteEstadoEnum.enumValues)[number];
export type ClientePerfil       = (typeof clientePerfilEnum.enumValues)[number];
export type ClienteOcupacion    = (typeof clienteOcupacionEnum.enumValues)[number];
export type ClienteRangoCapital = (typeof clienteRangoCapitalEnum.enumValues)[number];
export type ClienteFuente       = (typeof clienteFuenteEnum.enumValues)[number];

export const CLIENTE_ESTADOS        = [...clienteEstadoEnum.enumValues]       as const;
export const CLIENTE_PERFILES       = [...clientePerfilEnum.enumValues]        as const;
export const CLIENTE_OCUPACIONES    = [...clienteOcupacionEnum.enumValues]     as const;
export const CLIENTE_RANGOS_CAPITAL = [...clienteRangoCapitalEnum.enumValues]  as const;
export const CLIENTE_FUENTES        = [...clienteFuenteEnum.enumValues]        as const;

export const CLIENTE_ESTADO_LABELS: Record<ClienteEstado, string> = {
  PROSPECTO:   'Prospecto',
  ACTIVO:      'Activo',
  INACTIVO:    'Inactivo',
  DESCARTADO:  'Descartado',
};

export const CLIENTE_PERFIL_LABELS: Record<ClientePerfil, string> = {
  PARTICULAR:          'Particular',
  FAMILY_OFFICE:       'Family Office',
  ASESOR_PROFESIONAL:  'Asesor profesional',
  INMOBILIARIA:        'Inmobiliaria',
};

export const CLIENTE_OCUPACION_LABELS: Record<ClienteOcupacion, string> = {
  EMPRESARIO:               'Empresario',
  DIRECTIVO:                'Directivo',
  PROFESIONAL_LIBERAL:      'Profesional liberal',
  INVERSOR_TIEMPO_COMPLETO: 'Inversor a tiempo completo',
  JUBILADO:                 'Jubilado',
  OTRO:                     'Otro',
};

export const CLIENTE_RANGO_CAPITAL_LABELS: Record<ClienteRangoCapital, string> = {
  HASTA_25K:   'Hasta 25.000 €',
  '25K_50K':   '25.000 € – 50.000 €',
  '50K_100K':  '50.000 € – 100.000 €',
  '100K_250K': '100.000 € – 250.000 €',
  '250K_500K': '250.000 € – 500.000 €',
  MAS_500K:    'Más de 500.000 €',
};

export const CLIENTE_FUENTE_LABELS: Record<ClienteFuente, string> = {
  REFERIDO: 'Referido',
  WEB:      'Web',
  LINKEDIN: 'LinkedIn',
  EVENTO:   'Evento',
  OTRO:     'Otro',
};

export const ACTIVOS_INTERESADO_OPTIONS = [
  { value: 'VIVIENDA', label: 'Vivienda' },
  { value: 'OFICINA',  label: 'Oficina'  },
  { value: 'LOCAL',    label: 'Local'    },
  { value: 'NAVE',     label: 'Nave'     },
  { value: 'GARAJE',   label: 'Garaje'   },
  { value: 'TRASTERO', label: 'Trastero' },
  { value: 'OTRO',     label: 'Otro'     },
] as const;

// Tipo para listados con nombre del creador
export type ClienteListItem = SelectCliente & {
  creatorName: string;
};
