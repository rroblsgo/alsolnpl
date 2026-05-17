import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// ─── Roles de la aplicación ───────────────────────────────────────────────────
// Usuarios internos (acceso a /dashboard):
//   admin      → acceso total
//   legal      → gestión NPL + tareas legales
//   comercial  → gestión NPL + clientes
//   ver_only   → solo lectura en dashboard
//
// Usuarios externos (acceso a /npl):
//   cliente    → visualiza activos NPL públicos
//   agente     → visualiza activos NPL públicos
//
// El valor 'user' es el default de better-auth; ningún usuario debería
// quedarse con ese role en producción. El admin lo actualiza en DB.
export const APP_ROLES = [
  'admin',
  'legal',
  'comercial',
  'ver_only',
  'cliente',
  'agente',
  'user', // fallback better-auth, sin acceso a nada protegido
] as const;

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  bio: text('bio'),
  // ── Nuevo campo role ──────────────────────────────────────────────────────
  // Añadido manualmente (no via plugin admin de better-auth).
  // better-auth lo propaga al objeto session.user gracias a additionalFields.
  // Valor por defecto: 'user' (sin acceso a zonas protegidas).
  // El admin técnico actualiza este campo directamente en la DB.
  role: text('role').notNull().default('user'),
  // ─────────────────────────────────────────────────────────────────────────
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('sessions_userId_idx').on(table.userId)]
);

export const accounts = pgTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('accounts_userId_idx').on(table.userId)]
);

export const verifications = pgTable(
  'verifications',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('verifications_identifier_idx').on(table.identifier)]
);
