import Link from 'next/link';
import { requireAuth } from '@/src/lib/auth-server';
import { Metadata } from 'next';
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  MapPinIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'AlsolNPL · Gestión profesional de activos NPL',
  description:
    'Plataforma de gestión de Non-Performing Loans (NPL) e inmuebles en proceso de ejecución hipotecaria para Alsol Inmobiliaria.',
};

// ─── Datos de la página ───────────────────────────────────────────────────────

const features = [
  {
    icon: BuildingOffice2Icon,
    title: 'Gestión de activos NPL',
    desc: 'Ficha completa de cada activo: datos registrales, catastro, estado procesal, imágenes, documentación y cálculo de rentabilidad.',
  },
  {
    icon: ChartBarIcon,
    title: 'Escenarios de rentabilidad',
    desc: 'Calcula automáticamente ROI, inversión total y escenarios de salida para cada activo con datos actualizados.',
  },
  {
    icon: UserGroupIcon,
    title: 'CRM de inversores',
    desc: 'Gestión de clientes e inversores con historial de contactos, perfil RGPD, rangos de capital y notas enriquecidas.',
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'Tareas y seguimiento',
    desc: 'Vincula tareas a activos NPL: due diligence, trámites legales, subastas, valoraciones. Todo trazado y en su contexto.',
  },
  {
    icon: DocumentTextIcon,
    title: 'Gestión documental',
    desc: 'Adjunta y organiza documentos a NPLs y clientes. Acceso centralizado a toda la documentación del expediente.',
  },
  {
    icon: MapPinIcon,
    title: 'Cobertura nacional',
    desc: 'Selector integrado de 8.124 municipios españoles. Filtra y localiza activos por provincia y municipio con precisión.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Crea el activo NPL',
    desc: 'Introduce los datos registrales, catastrales y del procedimiento judicial. Adjunta imágenes y documentación.',
  },
  {
    num: '02',
    title: 'Analiza la rentabilidad',
    desc: 'La plataforma calcula automáticamente la inversión total, costes asociados y el ROI neto por escenario de salida.',
  },
  {
    num: '03',
    title: 'Gestiona el proceso',
    desc: 'Registra actuaciones judiciales, vincula tareas al expediente y realiza el seguimiento hasta el cierre.',
  },
  {
    num: '04',
    title: 'Genera informes',
    desc: 'Descarga el folleto PDF del activo con toda la información estructurada, listo para compartir con inversores.',
  },
];

const highlights = [
  'Análisis de rentabilidad automático',
  'Gestión de deudores y partes del expediente',
  'Editor de notas enriquecido (TipTap)',
  'Generación de folletos PDF',
  'Notificaciones en tiempo real',
  'Historial de actuaciones judiciales',
  'Subida de imágenes y documentos',
  'Roles y control de acceso',
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const { isAuth } = await requireAuth();

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gray-950 py-24 sm:py-32">
        {/* Fondo decorativo */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a5f18_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f18_1px,transparent_1px)] bg-[size:4rem_4rem]"
        />
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-blue-700/10 blur-3xl pointer-events-none"
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-700/40 bg-blue-950/60 px-3 py-1 text-xs font-medium text-blue-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Alsol Inmobiliaria · Uso interno
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Gestión profesional de{' '}
            <span className="text-blue-400">activos NPL</span>
          </h1>

          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Centraliza el análisis, seguimiento y gestión de Non-Performing
            Loans. Desde la ficha del activo hasta el cierre de la operación.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuth ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Ir al panel de gestión
                <ArrowRightIcon className="size-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-600 transition-colors"
                >
                  Acceder a la plataforma
                  <ArrowRightIcon className="size-4" />
                </Link>
                <Link
                  href="/#como-funciona"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-base font-medium text-gray-300 hover:border-white/40 hover:text-white transition-colors"
                >
                  Cómo funciona
                </Link>
              </>
            )}
          </div>

          {/* Mini stats */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { val: '8.124', label: 'Municipios' },
              { val: 'PDF', label: 'Informes' },
              { val: '100%', label: 'Control' },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/5 py-4 px-2"
              >
                <p className="text-xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Cómo funciona la plataforma
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Un flujo de trabajo estructurado para gestionar cada expediente
              NPL de principio a fin.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold text-white">
                  {step.num}
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATAFORMA / FEATURES ─────────────────────────────────────────── */}
      <section id="plataforma" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Diseñada específicamente para la operativa de Alsol Inmobiliaria
              en gestión de activos NPL.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-950 hover:shadow-sm transition-shadow"
              >
                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-2.5 dark:bg-blue-950/40">
                  <f.icon
                    className="size-5 text-blue-700 dark:text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS / CHECKLIST ────────────────────────────────────────── */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Texto */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Diseñada para el detalle
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                Cada funcionalidad responde a las necesidades reales de la
                operativa diaria: nada falta, nada sobra. Toda la información
                del expediente en un único lugar.
              </p>
              {isAuth ? (
                <Link
                  href="/dashboard/npl"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Ver activos NPL
                  <ArrowRightIcon className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                  Acceder
                  <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </div>

            {/* Lista */}
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5">
                  <CheckCircleIcon
                    className="size-5 shrink-0 text-blue-700 dark:text-blue-400 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── VENTAJAS ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                icon: BoltIcon,
                title: 'Rápida y eficiente',
                desc: 'Basada en Next.js 16 con renderizado servidor. Sin tiempos de espera en el análisis de activos.',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Acceso controlado',
                desc: 'Autenticación segura con verificación de email y gestión de sesiones. Solo usuarios autorizados de Alsol.',
              },
              {
                icon: DocumentTextIcon,
                title: 'Información estructurada',
                desc: 'Secciones A-D por activo: superficies, rentabilidad, estado procesal y deudores. Todo ordenado y exportable.',
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-950"
              >
                <v.icon
                  className="size-6 text-blue-700 dark:text-blue-400 mb-3"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
                  {v.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-blue-700">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Empieza a gestionar tus activos NPL
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Accede a la plataforma con tus credenciales de Alsol Inmobiliaria y
            centraliza toda tu operativa NPL.
          </p>
          {isAuth ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
            >
              Ir al panel
              <ArrowRightIcon className="size-4" />
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 transition-colors shadow-sm"
            >
              Acceder a la plataforma
              <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
