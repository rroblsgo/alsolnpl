import { requireAuth } from '@/src/lib/auth-server';
import { redirect } from 'next/navigation';
import { db } from '@/src/db';
import { npl as nplTable } from '@/src/db/schema/npl';
import { clientes as clientesTable } from '@/src/db/schema/clientes';
import { task as taskTable } from '@/src/db/schema/task';
import { eq, count } from 'drizzle-orm';
import Link from 'next/link';
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import type { Route } from 'next';
import { generatePageTitle } from '@/utils/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: generatePageTitle('Panel principal'),
};

// ─── Queries de KPIs ─────────────────────────────────────────────────────────

async function getKpis() {
  const [
    nplActivos,
    nplReservados,
    nplVendidos,
    nplArchivados,
    totalClientes,
    tareasTotal,
    tareasPendientes,
    tareasEnCurso,
  ] = await Promise.all([
    db.select({ c: count() }).from(nplTable).where(eq(nplTable.estado, 'ACTIVO')),
    db.select({ c: count() }).from(nplTable).where(eq(nplTable.estado, 'RESERVADO')),
    db.select({ c: count() }).from(nplTable).where(eq(nplTable.estado, 'VENDIDO')),
    db.select({ c: count() }).from(nplTable).where(eq(nplTable.estado, 'ARCHIVADO')),
    db.select({ c: count() }).from(clientesTable),
    db.select({ c: count() }).from(taskTable),
    db.select({ c: count() }).from(taskTable).where(eq(taskTable.status, 'PENDIENTE')),
    db.select({ c: count() }).from(taskTable).where(eq(taskTable.status, 'EN_CURSO')),
  ]);

  return {
    npl: {
      activos: nplActivos[0].c,
      reservados: nplReservados[0].c,
      vendidos: nplVendidos[0].c,
      archivados: nplArchivados[0].c,
      total:
        nplActivos[0].c +
        nplReservados[0].c +
        nplVendidos[0].c +
        nplArchivados[0].c,
    },
    clientes: {
      total: totalClientes[0].c,
    },
    tareas: {
      total: tareasTotal[0].c,
      pendientes: tareasPendientes[0].c,
      enCurso: tareasEnCurso[0].c,
    },
  };
}

// ─── Componente de tarjeta KPI ────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: number;
  sub?: string;
  color: 'blue' | 'green' | 'amber' | 'gray';
}) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-gray-900">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
          {value}
        </span>
        {sub && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[color]}`}
          >
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Acceso rápido ────────────────────────────────────────────────────────────

const quickLinks = [
  {
    label: 'Nuevo NPL',
    href: '/dashboard/npl/create',
    icon: BuildingOffice2Icon,
    color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30',
  },
  {
    label: 'Nuevo cliente',
    href: '/dashboard/clientes/create',
    icon: UserGroupIcon,
    color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    label: 'Nueva tarea',
    href: '/dashboard/tasks/create',
    icon: ClipboardDocumentListIcon,
    color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30',
  },
  {
    label: 'Documentos',
    href: '/dashboard/documents',
    icon: DocumentTextIcon,
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-800',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { isAuth, session } = await requireAuth();
  if (!isAuth) redirect('/auth/login');

  const kpis = await getKpis();

  const hora = new Date().getHours();
  const saludo =
    hora < 13 ? 'Buenos días' : hora < 20 ? 'Buenas tardes' : 'Buenas noches';
  const nombre =
    session?.user?.name?.split(' ')[0] ??
    session?.user?.email?.split('@')[0] ??
    '';

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {saludo}{nombre ? `, ${nombre}` : ''}.
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aquí tienes el resumen de actividad de la plataforma.
        </p>
      </div>

      {/* KPIs NPL */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Activos NPL
          </h2>
          <Link
            href={'/dashboard/npl' as Route}
            className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400"
          >
            Ver todos
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total NPLs" value={kpis.npl.total} color="blue" />
          <KpiCard
            label="Activos"
            value={kpis.npl.activos}
            sub="activos"
            color="green"
          />
          <KpiCard
            label="Reservados"
            value={kpis.npl.reservados}
            sub="reservados"
            color="amber"
          />
          <KpiCard
            label="Vendidos"
            value={kpis.npl.vendidos}
            sub="vendidos"
            color="gray"
          />
        </div>
      </section>

      {/* KPIs secundarios */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Resumen general
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Clientes"
            value={kpis.clientes.total}
            color="blue"
          />
          <KpiCard
            label="Tareas pendientes"
            value={kpis.tareas.pendientes}
            sub="pendientes"
            color="amber"
          />
          <KpiCard
            label="En curso"
            value={kpis.tareas.enCurso}
            sub="en curso"
            color="green"
          />
        </div>
      </section>

      {/* Acceso rápido */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map((ql) => (
            <Link
              key={ql.href}
              href={ql.href as Route}
              className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm dark:border-white/10 dark:bg-gray-900 dark:hover:border-blue-800"
            >
              <span className={`rounded-lg p-2.5 ${ql.color}`}>
                <ql.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {ql.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Links de módulos completos */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Módulos
        </h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
          {[
            {
              href: '/dashboard/npl',
              label: 'Gestión NPL',
              desc: 'Listado completo de activos, filtros, edición y seguimiento',
              icon: BuildingOffice2Icon,
            },
            {
              href: '/dashboard/clientes',
              label: 'Clientes',
              desc: 'CRM de inversores y contactos con historial y documentación',
              icon: UserGroupIcon,
            },
            {
              href: '/dashboard/tasks',
              label: 'Tareas',
              desc: 'Gestión de tareas vinculadas a activos y expedientes',
              icon: ClipboardDocumentListIcon,
            },
            {
              href: '/dashboard/documents',
              label: 'Documentos',
              desc: 'Repositorio de documentos adjuntos a NPLs y clientes',
              icon: DocumentTextIcon,
            },
          ].map((item, i, arr) => (
            <Link
              key={item.href}
              href={item.href as Route}
              className={`flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50 dark:hover:bg-white/5 ${
                i < arr.length - 1
                  ? 'border-b border-gray-100 dark:border-white/10'
                  : ''
              }`}
            >
              <item.icon className="size-5 shrink-0 text-gray-400" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.desc}
                </p>
              </div>
              <ArrowRightIcon className="size-4 shrink-0 text-gray-300 dark:text-gray-600" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
