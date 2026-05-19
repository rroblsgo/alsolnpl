'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { FondoListItem } from '../types/fondo.types';
import FondoItem from './FondoItem';

type Props = { fondos: FondoListItem[]; isAdmin: boolean };

export default function FondoList({ fondos, isAdmin }: Props) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return fondos;
    return fondos.filter(
      (f) =>
        f.nombre.toLowerCase().includes(q) ||
        (f.empresa ?? '').toLowerCase().includes(q) ||
        (f.nif ?? '').toLowerCase().includes(q)
    );
  }, [fondos, search]);

  return (
    <div className="mt-6 space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Buscar fondo..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-500 py-8">
          {search ? 'Sin resultados para esa búsqueda.' : 'No hay fondos registrados todavía.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((fondo) => (
            <FondoItem key={fondo.id} fondo={fondo} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}
