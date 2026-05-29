export { users, sessions, accounts, verifications } from './auth-schema';
export { community, communityMembers } from './community';
export { notifications } from './notifications';
export {
  task,
  taskCategoryEnum,
  taskPriorityEnum,
  taskStatusEnum,
} from './task';
export { category } from './category';
export { meeti, meetiLocations, meetiAttendees } from './meeti';
// ─── Feature gestion_npl ─────────────────────────────────────────────────────
export {
  npl,
  nplDeudores,
  nplEstadoEnum,
  nplTipoInmuebleEnum,
  nplProcedimientoEnum,
  nplTipoRegistroEnum,
} from './npl';
export { municipios } from './municipios';
export {
  clientes,
  clienteEstadoEnum,
  clientePerfilEnum,
  clienteOcupacionEnum,
  clienteRangoCapitalEnum,
  clienteFuenteEnum,
} from './clientes';
export type { ContactoItem } from './clientes';
// ─── Feature documents (polimórfico) ─────────────────────────────────────────
export {
  document,
  documentEntityTypeEnum,
  documentCategoryEnum,
} from './document';
export type { DocumentEntityType, DocumentCategory } from './document';
// ─── Feature fondos + carteras + operaciones ─────────────────────────────────
export { fondos, carteras } from './fondos';
export type { MapItem } from './fondos';
export { operaciones } from './operaciones';

// ─── Feature enrichment ───────────────────────────────────────────────────────
export {
  operacionEnrichments,
  enrichmentSources,
  enrichmentFuenteEnum,
} from './enrichment';
export type {
  InsertEnrichment,
  SelectEnrichment,
  InsertEnrichmentSource,
  SelectEnrichmentSource,
  EnrichmentFuente,
  SeccionesCompletadas,
} from './enrichment';

export { enrichmentDeudores } from './enrichment_deudores';
export type {
  InsertEnrichmentDeudor,
  SelectEnrichmentDeudor,
} from './enrichment_deudores';
