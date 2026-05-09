import z from 'zod';
import {
  CLIENTE_ESTADOS,
  CLIENTE_PERFILES,
  CLIENTE_OCUPACIONES,
  CLIENTE_RANGOS_CAPITAL,
  CLIENTE_FUENTES,
} from '../types/cliente.types';

// Schema para items de contacto {titulo, valor}
const ContactoItemSchema = z.object({
  titulo: z.string().trim().min(1, { error: 'El título es obligatorio' }),
  valor:  z.string().trim().min(1, { error: 'El valor es obligatorio' }),
});

// ─── Sección A: Datos básicos ─────────────────────────────────────────────────

const ClienteSectionASchema = z.object({
  nombre:      z.string().trim().min(2, { error: 'El nombre es obligatorio' }).max(255),
  dni:         z.string().trim().max(20).optional().or(z.literal('')),
  empresa:     z.string().trim().max(255).optional().or(z.literal('')),
  nif:         z.string().trim().max(20).optional().or(z.literal('')),
  imagen:      z.string().trim().max(255).optional().or(z.literal('')),
  direccion:   z.string().trim().max(255).optional().or(z.literal('')),
  provincia:   z.string().trim().max(100).optional().or(z.literal('')),
  municipio:   z.string().trim().max(100).optional().or(z.literal('')),
  codigoPostal:z.string().trim().max(10).optional().or(z.literal('')),
});

// ─── Sección B: Contacto ──────────────────────────────────────────────────────

const ClienteSectionBSchema = z.object({
  emails:    z.array(ContactoItemSchema).default([]),
  telefonos: z.array(ContactoItemSchema).default([]),
  contactos: z.array(ContactoItemSchema).default([]),
});

// ─── Sección C: Perfil inversor ───────────────────────────────────────────────

const ClienteSectionCSchema = z.object({
  perfilInversor:          z.enum(CLIENTE_PERFILES).optional(),
  ocupacionPrincipal:      z.enum(CLIENTE_OCUPACIONES).optional(),
  rangoCapitalInvertir:    z.enum(CLIENTE_RANGOS_CAPITAL).optional(),
  activosInteresado:       z.array(z.string()).default([]),
  experienciaPreviaDetalle:z.string().trim().optional().or(z.literal('')),
  informadoNplDetalle:     z.string().trim().optional().or(z.literal('')),
});

// ─── Sección D: Gestión interna ───────────────────────────────────────────────

const ClienteSectionDSchema = z.object({
  estado:              z.enum(CLIENTE_ESTADOS, { error: 'Estado no válido' }),
  fuenteCaptacion:     z.enum(CLIENTE_FUENTES).optional(),
  notas:               z.string().trim().optional().or(z.literal('')),
  consentimientoRgpd:  z.boolean().default(false),
  fechaConsentimiento: z.string().optional().or(z.literal('')),
});

// ─── Schema completo ──────────────────────────────────────────────────────────

export const ClienteSchema = ClienteSectionASchema
  .merge(ClienteSectionBSchema)
  .merge(ClienteSectionCSchema)
  .merge(ClienteSectionDSchema);

export type ClienteInput = z.input<typeof ClienteSchema>;
