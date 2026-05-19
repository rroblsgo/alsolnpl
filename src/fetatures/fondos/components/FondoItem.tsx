'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FondoListItem } from '../types/fondo.types';
import type { ContactoItem } from '@/src/db/schema/fondos';

type Props = { fondo: FondoListItem; isAdmin: boolean };

export default function FondoItem({ fondo, isAdmin }: Props) {
  const emails    = (fondo.emails    as ContactoItem[]) ?? [];
  const telefonos = (fondo.telefonos as ContactoItem[]) ?? [];

  return (
    <div className="flex items-start justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {fondo.imagen ? (
          <Image src={fondo.imagen} alt={fondo.nombre} width={48} height={48}
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
            {fondo.nombre.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <Link href={`/dashboard/fondos/${fondo.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-blue-700 hover:underline">
            {fondo.nombre}
          </Link>
          {fondo.empresa && <p className="text-xs text-gray-500 truncate">{fondo.empresa}</p>}
          {(fondo.municipio || fondo.provincia) && (
            <p className="text-xs text-gray-400">📍 {[fondo.municipio, fondo.provincia].filter(Boolean).join(', ')}</p>
          )}
          {emails.length > 0    && <p className="text-xs text-gray-400 truncate">✉ {emails[0].valor}</p>}
          {telefonos.length > 0 && <p className="text-xs text-gray-400">📞 {telefonos[0].valor}</p>}
        </div>
      </div>
      {isAdmin && (
        <Link href={`/dashboard/fondos/${fondo.id}/edit`}
          className="shrink-0 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">
          Editar
        </Link>
      )}
    </div>
  );
}
