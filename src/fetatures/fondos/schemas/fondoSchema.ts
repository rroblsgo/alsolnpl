import z from 'zod';

const ContactoItemSchema = z.object({
  titulo: z.string().trim().min(1, { message: 'El título es obligatorio' }),
  valor:  z.string().trim().min(1, { message: 'El valor es obligatorio'  }),
});

// ─── Sección A: Datos básicos ─────────────────────────────────────────────────
const FondoSectionASchema = z.object({
  nombre:       z.string().trim().min(2, { message: 'El nombre es obligatorio' }).max(255),
  dni:          z.string().trim().max(20).optional().or(z.literal('')),
  empresa:      z.string().trim().max(255).optional().or(z.literal('')),
  nif:          z.string().trim().max(20).optional().or(z.literal('')),
  imagen:       z.string().trim().max(255).optional().or(z.literal('')),
  direccion:    z.string().trim().max(255).optional().or(z.literal('')),
  provincia:    z.string().trim().max(100).optional().or(z.literal('')),
  municipio:    z.string().trim().max(100).optional().or(z.literal('')),
  codigoPostal: z.string().trim().max(10).optional().or(z.literal('')),
});

// ─── Sección B: Contactos ─────────────────────────────────────────────────────
const FondoSectionBSchema = z.object({
  emails:    z.array(ContactoItemSchema).default([]),
  telefonos: z.array(ContactoItemSchema).default([]),
  contactos: z.array(ContactoItemSchema).default([]),
});

// ─── Sección C: Perfil inversor ───────────────────────────────────────────────
const FondoSectionCSchema = z.object({
  comisionGestion: z.string().optional().or(z.literal('')),
});

// ─── Sección D: Gestión interna ───────────────────────────────────────────────
const FondoSectionDSchema = z.object({
  notas: z.string().trim().optional().or(z.literal('')),
});

export const FondoSchema = FondoSectionASchema
  .merge(FondoSectionBSchema)
  .merge(FondoSectionCSchema)
  .merge(FondoSectionDSchema);

export type FondoInput = z.input<typeof FondoSchema>;
