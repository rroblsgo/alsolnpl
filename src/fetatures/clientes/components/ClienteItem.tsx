'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ClienteListItem, CLIENTE_PERFIL_LABELS, CLIENTE_RANGO_CAPITAL_LABELS } from '../types/cliente.types';
import ClienteStatusBadge from './ClienteStatusBadge';
import { useClienteStore } from '../stores/cliente.store';
import { ContactoItem } from '@/src/db/schema/clientes';

type Props = { cliente: ClienteListItem };

export default function ClienteItem({ cliente }: Props) {
  const { setDeleteOpen, setSelectedCliente } = useClienteStore();

  const emailPrincipal = (cliente.emails as ContactoItem[])?.[0]?.valor;
  const telefonoPrincipal = (cliente.telefonos as ContactoItem[])?.[0]?.valor;

  return (
    <li className="py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {/* Avatar */}
          {cliente.imagen ? (
            <Image
              src={cliente.imagen}
              alt={cliente.nombre}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
              {cliente.nombre.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-gray-900">{cliente.nombre}</span>
              <ClienteStatusBadge estado={cliente.estado} />
            </div>

            {cliente.empresa && (
              <p className="mt-0.5 text-sm text-gray-500">{cliente.empresa}</p>
            )}

            {(cliente.municipio || cliente.provincia) && (
              <p className="mt-0.5 text-sm text-gray-500">
                📍 {[cliente.municipio, cliente.provincia].filter(Boolean).join(', ')}
              </p>
            )}

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
              {emailPrincipal && <span>✉ {emailPrincipal}</span>}
              {telefonoPrincipal && <span>📞 {telefonoPrincipal}</span>}
              {cliente.perfilInversor && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                  {CLIENTE_PERFIL_LABELS[cliente.perfilInversor]}
                </span>
              )}
              {cliente.rangoCapitalInvertir && (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  {CLIENTE_RANGO_CAPITAL_LABELS[cliente.rangoCapitalInvertir]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/dashboard/clientes/${cliente.id}`}
            className="rounded-md bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
          >
            Ver
          </Link>
          <Link
            href={`/dashboard/clientes/${cliente.id}/edit`}
            className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-100"
          >
            Editar
          </Link>
          <button
            onClick={() => { setSelectedCliente(cliente); setDeleteOpen(true); }}
            className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
