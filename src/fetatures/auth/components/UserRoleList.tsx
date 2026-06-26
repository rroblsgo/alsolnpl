'use client';

import { useState, useTransition } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ROLE_LABELS, APP_ROLES, type AppRole } from '@/src/lib/roles';
import { updateUserRoleAction } from '../actions/update-user-role-action';
import type { UserRoleItem } from '../services/UserRoleRepository';

// ── Badge de role ─────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  legal:
    'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400',
  comercial: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  ver_only: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  cliente:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  agente:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  user: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

// ── Fila individual ───────────────────────────────────────────────────────────

function UserRoleRow({ user }: { user: UserRoleItem }) {
  const [selectedRole, setSelectedRole] = useState<string>(user.role);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: string;
    error: string;
  } | null>(null);

  const isDirty = selectedRole !== user.role;

  const handleSave = () => {
    setResult(null);
    startTransition(async () => {
      const res = await updateUserRoleAction(user.id, selectedRole);
      setResult(res);
      // Si éxito, actualizamos el role base para resetear isDirty
      if (res.success) {
        user.role = selectedRole; // mutación local para resetear estado sucio
      }
    });
  };

  const handleCancel = () => {
    setSelectedRole(user.role);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-white/5 px-4 py-3 last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/2 transition-colors">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Avatar inicial */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40 text-sm font-semibold text-blue-700 dark:text-blue-400">
          {(user.name ?? user.email)[0].toUpperCase()}
        </div>

        {/* Nombre + email */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
            {user.name ?? (
              <span className="italic text-gray-400">Sin nombre</span>
            )}
          </p>
          <p className="truncate text-xs text-gray-400">{user.email}</p>
        </div>

        {/* Badge role actual */}
        <span
          className={`hidden shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${ROLE_BADGE[user.role] ?? ROLE_BADGE.user}`}
        >
          {ROLE_LABELS[user.role as AppRole] ?? user.role}
        </span>

        {/* Verificación email */}
        <span
          className={`hidden shrink-0 text-xs sm:inline ${user.emailVerified ? 'text-emerald-500' : 'text-amber-500'}`}
          title={
            user.emailVerified ? 'Email verificado' : 'Email no verificado'
          }
        >
          {user.emailVerified ? '✓ verificado' : '⚠ sin verificar'}
        </span>
      </div>

      {/* Selector de role + acciones */}
      <div className="flex items-center gap-2 pl-11 flex-wrap">
        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setResult(null);
          }}
          disabled={isPending}
          className="rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 px-2.5 py-1.5 text-sm text-gray-700 dark:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        >
          {APP_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]} ({r})
            </option>
          ))}
        </select>

        {isDirty && (
          <>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="rounded-md border border-gray-200 dark:border-white/10 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}

        {/* Feedback inline */}
        {result?.success && (
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircleIcon className="h-3.5 w-3.5" />
            {result.success}
          </span>
        )}
        {result?.error && (
          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <ExclamationCircleIcon className="h-3.5 w-3.5" />
            {result.error}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

type Props = { users: UserRoleItem[] };

export default function UserRoleList({ users }: Props) {
  if (users.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        No hay usuarios registrados.
      </p>
    );
  }

  // Agrupar: primero los sin verificar (pendientes), luego el resto por role
  const unverified = users.filter((u) => !u.emailVerified);
  const verified = users.filter((u) => u.emailVerified);

  return (
    <div className="space-y-6">
      {unverified.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-amber-500">
            Pendientes de verificación de email ({unverified.length})
          </h2>
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-gray-900 shadow-sm">
            {unverified.map((u) => (
              <UserRoleRow key={u.id} user={u} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Usuarios activos ({verified.length})
        </h2>
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm">
          {verified.map((u) => (
            <UserRoleRow key={u.id} user={u} />
          ))}
        </div>
      </section>
    </div>
  );
}
