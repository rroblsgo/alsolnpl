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
// ─── NUEVO: Feature gestion_npl ──────────────────────────────────────────────
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
// ─── Feature documents (polimórfico) ────────────────────────────────────────
export {
  document,
  documentEntityTypeEnum,
  documentCategoryEnum,
} from './document';
export type { DocumentEntityType, DocumentCategory } from './document';
