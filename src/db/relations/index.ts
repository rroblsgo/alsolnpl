import { defineRelations } from 'drizzle-orm';
import * as schema from '../schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions({
      from: r.users.id,
      to: r.sessions.userId,
    }),
    accounts: r.many.accounts({
      from: r.users.id,
      to: r.accounts.userId,
    }),
    communities: r.many.community({
      from: r.users.id,
      to: r.community.createdBy,
    }),
    meetis: r.many.meeti({
      from: r.users.id,
      to: r.meeti.createdBy,
    }),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
    }),
  },
  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
    }),
  },
  communityMembers: {
    community: r.one.community({
      from: r.communityMembers.communityId,
      to: r.community.id,
      optional: false,
    }),
    user: r.one.users({
      from: r.communityMembers.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  meeti: {
    location: r.one.meetiLocations({
      from: r.meeti.id,
      to: r.meetiLocations.meetiId,
    }),
    category: r.one.category({
      from: r.meeti.categoryId,
      to: r.category.id,
      optional: false,
    }),
    community: r.one.community({
      from: r.meeti.communityId,
      to: r.community.id,
      optional: false,
    }),
    admin: r.one.users({
      from: r.meeti.createdBy,
      to: r.users.id,
      optional: false,
    }),
  },
  meetiAttendees: {
    user: r.one.users({
      from: r.meetiAttendees.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  // ─── gestion_npl ─────────────────────────────────────────────────────────
  npl: {
    deudores: r.many.nplDeudores({
      from: r.npl.id,
      to: r.nplDeudores.nplId,
    }),
    creator: r.one.users({
      from: r.npl.creatorId,
      to: r.users.id,
      optional: false,
    }),
  },
  nplDeudores: {
    npl: r.one.npl({
      from: r.nplDeudores.nplId,
      to: r.npl.id,
      optional: false,
    }),
  },
  clientes: {
    creator: r.one.users({
      from: r.clientes.creatorId,
      to: r.users.id,
      optional: false,
    }),
  },
  // ─── documents ───────────────────────────────────────────────────────────
  document: {
    uploader: r.one.users({
      from: r.document.uploadedBy,
      to: r.users.id,
      optional: false,
    }),
  },
  // ─── fondos ───────────────────────────────────────────────────────────
  fondos: {
    carteras: r.many.carteras({
      from: r.fondos.id,
      to: r.carteras.fondoId,
    }),
    creator: r.one.users({
      from: r.fondos.creatorId,
      to: r.users.id,
      optional: false,
    }),
  },
  carteras: {
    fondo: r.one.fondos({
      from: r.carteras.fondoId,
      to: r.fondos.id,
      optional: false,
    }),
    operaciones: r.many.operaciones({
      from: r.carteras.id,
      to: r.operaciones.carteraId,
    }),
  },
  operaciones: {
    fondo: r.one.fondos({
      from: r.operaciones.fondoId,
      to: r.fondos.id,
    }),
    cartera: r.one.carteras({
      from: r.operaciones.carteraId,
      to: r.carteras.id,
    }),
    enrichment: r.one.operacionEnrichments({
      from: r.operaciones.id,
      to: r.operacionEnrichments.operacionId,
    }),
  },

  // ─── enrichment ──────────────────────────────────────────────────────────
  operacionEnrichments: {
    operacion: r.one.operaciones({
      from: r.operacionEnrichments.operacionId,
      to: r.operaciones.id,
      optional: false,
    }),
    sources: r.many.enrichmentSources({
      from: r.operacionEnrichments.id,
      to: r.enrichmentSources.enrichmentId,
    }),
    deudores: r.many.enrichmentDeudores({
      from: r.operacionEnrichments.id,
      to: r.enrichmentDeudores.enrichmentId,
    }),
    creator: r.one.users({
      from: r.operacionEnrichments.creatorId,
      to: r.users.id,
      optional: false,
    }),
  },
  enrichmentSources: {
    enrichment: r.one.operacionEnrichments({
      from: r.enrichmentSources.enrichmentId,
      to: r.operacionEnrichments.id,
      optional: false,
    }),
  },

  // ─── enrichment_deudores ─────────────────────────────────────────────────
  enrichmentDeudores: {
    enrichment: r.one.operacionEnrichments({
      from: r.enrichmentDeudores.enrichmentId,
      to: r.operacionEnrichments.id,
      optional: false,
    }),
  },

  // ─── tasks ───────────────────────────────────────────────────────────────
  task: {
    npl: r.one.npl({
      from: r.task.nplId,
      to: r.npl.id,
    }),
    cliente: r.one.clientes({
      from: r.task.clienteId,
      to: r.clientes.id,
    }),
    operacion: r.one.operaciones({
      from: r.task.operacionId,
      to: r.operaciones.id,
    }),
    enrichment: r.one.operacionEnrichments({
      from: r.task.enrichmentId,
      to: r.operacionEnrichments.id,
    }),
    creator: r.one.users({
      from: r.task.creatorId,
      to: r.users.id,
      optional: false,
    }),
    assignee: r.one.users({
      from: r.task.assigneeId,
      to: r.users.id,
      optional: false,
    }),
  },
}));
