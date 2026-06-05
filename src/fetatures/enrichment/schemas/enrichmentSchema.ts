import { z } from 'zod';

// ── Estrategia definitiva ─────────────────────────────────────────────────────
// El form RHF trabaja siempre con strings (lo que los inputs HTML producen).
// El schema convierte y valida solo al momento de guardar en el server action.
// Esto evita la incompatibilidad de tipos entre RHF y zodResolver con transforms.

const optStr = (max: number) =>
  z.string().max(max).nullish().transform(v => v ?? null);

const optNum = z.preprocess(
  v => (v === '' || v === null || v === undefined ? null : Number(v)),
  z.number().nullable()
) as z.ZodType<number | null | undefined>;

const optDate = z.string().nullish().transform(v => v || null);

const optInt = z.preprocess(
  v => (v === '' || v === null || v === undefined ? null : parseInt(String(v), 10)),
  z.number().int().nullable()
) as z.ZodType<number | null | undefined>;

const optBool = z.preprocess(
  v => (v === '' || v === undefined ? null : v),
  z.boolean().nullable()
) as z.ZodType<boolean | null | undefined>;

const optEnum = <T extends [string, ...string[]]>(values: T) =>
  z.preprocess(
    v => (v === '' || v === undefined ? null : v),
    z.enum(values).nullable()
  ) as z.ZodType<T[number] | null | undefined>;

// ── Schema de GUARDADO (server action) ───────────────────────────────────────
export const EnrichmentSchema = z.object({
  tituloOperacion: optStr(255),
  sellerReference: optStr(100),
  originalLender:  optStr(255),
  idufir:          optStr(50),
  cru:             optStr(50),

  fechaOriginacion:       optDate,
  fechaClasificacionNpl:  optDate,
  fechaVencimiento:       optDate,
  fechaCompraCartera:     optDate,
  fechaInicioAccionLegal: optDate,
  principalOriginal:   optNum,
  // B2 — AFS
  principalAFS:  optNum,
  interesesAFS:  optNum,
  costasAFS:     optNum,
  fechaAFS:      optDate,
  // B3 — Deuda actualizada
  intereses:     optNum,
  costas:        optNum,
  fechaCalculada: optDate,
  tasacionOriginal:        optNum,
  tasacionActual:          optNum,
  fechaTasacion:           optDate,
  prestamoHipotecaDetalles: optStr(10000),

  propertyId:   optStr(50),
  tipoInmueble: optStr(100),
  comunidadAutonoma: optStr(100),
  provincia:         optStr(100),
  municipio:         optStr(100),
  municipioId:       optInt,
  codPostal:         optStr(10),
  nombreVia:         optStr(200),
  numero:            optStr(20),
  bloque:            optStr(20),
  planta:            optStr(20),
  puerta:            optStr(20),
  latitud:           optNum,
  longitud:          optNum,
  referenciaCatastral: optStr(25),
  usoCatastral:        optStr(100),
  valorRefCatastral:   optNum,
  valorCatastral:      optNum,
  superficieConst:     optNum,
  superficieUtil:      optNum,
  superficieParcela:   optNum,
  superficieDetalles:  optStr(10000),
  distribucionResumida: optStr(255),
  distribucion:        optStr(10000),
  datosRegistro:       optStr(10000),
  anyConstruccion:     optInt,
  idufirReg:         optStr(50),
  fincaRegistral:    optStr(50),
  libro:             optStr(50),
  tomo:              optStr(50),
  folio:             optStr(50),
  registroProvincia: optStr(100),
  registroCiudad:    optStr(100),
  registroNumero:    optStr(50),
  dormitorios:           optInt,
  banyos:                optInt,
  garaje:                optBool,
  plazasGaraje:          optInt,
  trastero:              optBool,
  ascensor:              optBool,
  jardin:                optBool,
  piscina:               optBool,
  estadoConservacion:    optEnum(['nuevo', 'buen_estado', 'a_reformar', 'ruinoso']),
  certificadoEnergetico: optEnum(['A', 'B', 'C', 'D', 'E', 'F', 'G']),
  estadoOcupacion:           optEnum(['vacio', 'ocupado', 'irregular']),
  tipoOcupante:              optEnum(['propietario', 'inquilino', 'tercero', 'okupa']),
  rentaMensual:              optNum,
  vencimientoAlquiler:       optDate,
  restriccionesUrbanisticas: optStr(2000),
  notasOcupacion:            optStr(10000),

  procedimiento:       optEnum(['EJH', 'ETNJ', 'ETJ', 'PO', 'DESAHUCIO', 'OTRO']),
  ejecutante:          optStr(255),
  juzgado:             optStr(255),
  numeroProcedimiento: optStr(50),
  fechaSubasta:        optDate,
  numeroSubasta:       optStr(20),
  fechaAdjudicacion:   optDate,
  tipoAdjudicacion:    optEnum(['acreedor', 'tercero', 'desierta']),
  autoDespachoEjecucion: optStr(10000),
  actuacionesJudiciales: z.array(z.object({ fecha: z.string(), titulo: z.string() })).nullish(),
  riesgosJuridicos:  optStr(10000),
  cargas:            optStr(10000),
  embargos:          optStr(10000),
  notasInternas:     optStr(10000),

  numeroDeudores:   optInt,
  tieneAvalistas:   optBool,
  provinciaDeudor:  optStr(100),
  situacionLaboral: optEnum(['empleado', 'desempleado', 'autonomo', 'jubilado', 'otro']),
  nivelIngresos:    optEnum(['alto', 'medio', 'bajo']),
  ratingSolvencia:  optStr(20),
  notasDeudores:    optStr(4000),

  // F1 — Rentabilidad
  costeAdquisicionCredito: optNum,
  impuestosAjd:            optNum,
  costesNotariaRegistro:   optNum,
  gastosDacion:            optNum,
  comisionIntermediacion:  optNum,
  pujaProbable:            optNum,
  precioMercado:           optNum,
  precioVentaRapida:       optNum,
  fechaCompra:             optDate,
  fechaTerminacion:        optDate,
  gastosDiversos:          z.array(z.object({ titulo: z.string(), valor: z.number() })).nullish(),
  // F2 — Estrategia
  statusPromocionNpl: optEnum(['en_curso', 'desestimado', 'promocionado']),
  estrategiaRecuperacion: optEnum(['reo', 'venta_directa', 'reestructuracion', 'dacion', 'otro']),
  prioridad:              optEnum(['alta', 'media', 'baja']),
  oportunidadInversion:   optStr(50),
  recuperacionEsperada:   optNum,
  plazoRecuperacion:      optInt,
  riesgoRating:           optEnum(['alto', 'medio', 'bajo']),
  clusterGeografico:      optStr(100),
  gestorAsignado:         optStr(100),
  notasObservaciones:     optStr(4000),
  estadoDocumentacion:    optEnum(['completa', 'incompleta', 'pendiente']),
  escrituraDisponible:    optBool,
  antiguedadNotaSimple:   optDate,
});

// ── Schema de FORM (RHF) — solo strings y booleans, sin transforms ────────────
// Este es el tipo que usa useForm<> — los inputs HTML siempre producen strings
export const EnrichmentFormSchema = z.object({
  tituloOperacion: z.string().nullish(),
  sellerReference: z.string().nullish(),
  originalLender:  z.string().nullish(),
  idufir:          z.string().nullish(),
  cru:             z.string().nullish(),

  fechaOriginacion:       z.string().nullish(),
  fechaClasificacionNpl:  z.string().nullish(),
  fechaVencimiento:       z.string().nullish(),
  fechaCompraCartera:     z.string().nullish(),
  fechaInicioAccionLegal: z.string().nullish(),
  principalOriginal:   z.string().nullish(),
  // B2 — AFS
  principalAFS:  z.string().nullish(),
  interesesAFS:  z.string().nullish(),
  costasAFS:     z.string().nullish(),
  fechaAFS:      z.string().nullish(),
  // B3 — Deuda actualizada
  intereses:     z.string().nullish(),
  costas:        z.string().nullish(),
  fechaCalculada: z.string().nullish(),
  tasacionOriginal:        z.string().nullish(),
  tasacionActual:          z.string().nullish(),
  fechaTasacion:           z.string().nullish(),
  prestamoHipotecaDetalles: z.string().nullish(),

  propertyId:   z.string().nullish(),
  tipoInmueble: z.string().nullish(),
  comunidadAutonoma: z.string().nullish(),
  provincia:         z.string().nullish(),
  municipio:         z.string().nullish(),
  municipioId:       z.string().nullish(),
  codPostal:         z.string().nullish(),
  nombreVia:         z.string().nullish(),
  numero:            z.string().nullish(),
  bloque:            z.string().nullish(),
  planta:            z.string().nullish(),
  puerta:            z.string().nullish(),
  latitud:           z.string().nullish(),
  longitud:          z.string().nullish(),
  referenciaCatastral: z.string().nullish(),
  usoCatastral:        z.string().nullish(),
  valorRefCatastral:   z.string().nullish(),
  valorCatastral:      z.string().nullish(),
  superficieConst:     z.string().nullish(),
  superficieUtil:      z.string().nullish(),
  superficieParcela:   z.string().nullish(),
  superficieDetalles:  z.string().nullish(),
  distribucionResumida: z.string().nullish(),
  distribucion:        z.string().nullish(),
  datosRegistro:       z.string().nullish(),
  anyConstruccion:     z.string().nullish(),
  idufirReg:         z.string().nullish(),
  fincaRegistral:    z.string().nullish(),
  libro:             z.string().nullish(),
  tomo:              z.string().nullish(),
  folio:             z.string().nullish(),
  registroProvincia: z.string().nullish(),
  registroCiudad:    z.string().nullish(),
  registroNumero:    z.string().nullish(),
  dormitorios:   z.string().nullish(),
  banyos:        z.string().nullish(),
  garaje:        z.boolean().nullish(),
  plazasGaraje:  z.string().nullish(),
  trastero:      z.boolean().nullish(),
  ascensor:      z.boolean().nullish(),
  jardin:        z.boolean().nullish(),
  piscina:       z.boolean().nullish(),
  estadoConservacion:    z.string().nullish(),
  certificadoEnergetico: z.string().nullish(),
  estadoOcupacion:           z.string().nullish(),
  tipoOcupante:              z.string().nullish(),
  rentaMensual:              z.string().nullish(),
  vencimientoAlquiler:       z.string().nullish(),
  restriccionesUrbanisticas: z.string().nullish(),
  notasOcupacion:            z.string().nullish(),

  procedimiento:       z.string().nullish(),
  ejecutante:          z.string().nullish(),
  juzgado:             z.string().nullish(),
  numeroProcedimiento: z.string().nullish(),
  fechaSubasta:        z.string().nullish(),
  numeroSubasta:       z.string().nullish(),
  fechaAdjudicacion:   z.string().nullish(),
  tipoAdjudicacion:    z.string().nullish(),
  autoDespachoEjecucion: z.string().nullish(),
  actuacionesJudiciales: z.array(z.object({ fecha: z.string(), titulo: z.string() })).nullish(),
  riesgosJuridicos:  z.string().nullish(),
  cargas:            z.string().nullish(),
  embargos:          z.string().nullish(),
  notasInternas:     z.string().nullish(),

  numeroDeudores:   z.string().nullish(),
  tieneAvalistas:   z.boolean().nullish(),
  provinciaDeudor:  z.string().nullish(),
  situacionLaboral: z.string().nullish(),
  nivelIngresos:    z.string().nullish(),
  ratingSolvencia:  z.string().nullish(),
  notasDeudores:    z.string().nullish(),

  // F1 — Rentabilidad
  costeAdquisicionCredito: z.string().nullish(),
  impuestosAjd:            z.string().nullish(),
  costesNotariaRegistro:   z.string().nullish(),
  gastosDacion:            z.string().nullish(),
  comisionIntermediacion:  z.string().nullish(),
  pujaProbable:            z.string().nullish(),
  precioMercado:           z.string().nullish(),
  precioVentaRapida:       z.string().nullish(),
  fechaCompra:             z.string().nullish(),
  fechaTerminacion:        z.string().nullish(),
  gastosDiversos:          z.array(z.object({ titulo: z.string(), valor: z.number() })).nullish(),
  // F2 — Estrategia
  statusPromocionNpl: z.string().nullish(),
  estrategiaRecuperacion: z.string().nullish(),
  prioridad:              z.string().nullish(),
  oportunidadInversion:   z.string().nullish(),
  recuperacionEsperada:   z.string().nullish(),
  plazoRecuperacion:      z.string().nullish(),
  riesgoRating:           z.string().nullish(),
  clusterGeografico:      z.string().nullish(),
  gestorAsignado:         z.string().nullish(),
  notasObservaciones:     z.string().nullish(),
  estadoDocumentacion:    z.string().nullish(),
  escrituraDisponible:    z.boolean().nullish(),
  antiguedadNotaSimple:   z.string().nullish(),
});

// EnrichmentFormValues — tipo del form RHF (strings)
export type EnrichmentFormValues = z.infer<typeof EnrichmentFormSchema>;
// EnrichmentInput — tipo de salida tras parse (números, enums correctos)
export type EnrichmentInput = z.output<typeof EnrichmentSchema>;
