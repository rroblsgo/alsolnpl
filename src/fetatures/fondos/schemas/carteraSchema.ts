import z from 'zod';

const MapItemSchema = z.object({
  columna_name_origen: z.string().min(1),
  campo_operaciones:   z.string(),
});

export const CarteraSchema = z.object({
  fondoId:            z.number().int().positive(),
  carteraName:        z.string().trim().min(1, { message: 'Nombre obligatorio' }).max(100),
  excelFile:          z.string().trim().max(50).optional().or(z.literal('')),
  excelUrl:           z.string().trim().max(512).optional().or(z.literal('')),
  assetManager:       z.string().trim().max(100).optional().or(z.literal('')),
  oficinaResponsable: z.string().trim().max(100).optional().or(z.literal('')),
  comisionGestion:    z.string().optional().or(z.literal('')),
  mapItems:           z.array(MapItemSchema).default([]),
  fechaDefinicion:    z.string().optional().or(z.literal('')),
});

export type CarteraInput = z.input<typeof CarteraSchema>;
