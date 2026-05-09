'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { NplInput } from '../schemas/nplSchema';
import { NPL_ESTADOS, NPL_ESTADO_LABELS } from '../types/npl.types';
import NplFormSectionA from './NplFormSectionA';
import NplFormSectionB from './NplFormSectionB';
import NplFormSectionC from './NplFormSectionC';
import NplFormSectionD from './NplFormSectionD';
import { FormLabel } from '@/src/shared/components/forms';

const TABS = [
  { id: 'A', label: 'A. Datos registrales' },
  { id: 'B', label: 'B. Rentabilidad' },
  { id: 'C', label: 'C. Estado procesal' },
  { id: 'D', label: 'D. Deudores' },
  { id: 'control', label: '⚙ Control' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type Props = {
  // Solo presente en edición — permite al tab D mostrar el enlace a gestión
  nplId?: number;
};

export default function NplForm({ nplId }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('A');
  const { register } = useFormContext<NplInput>();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'A' && <NplFormSectionA />}
        {activeTab === 'B' && <NplFormSectionB />}
        {activeTab === 'C' && <NplFormSectionC />}
        {activeTab === 'D' && <NplFormSectionD nplId={nplId} />}
        {activeTab === 'control' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-base font-semibold text-gray-900">
              ⚙ Control interno
            </h3>
            <div>
              <FormLabel htmlFor="estado">Estado del NPL</FormLabel>
              <select
                id="estado"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                {...register('estado')}
              >
                {NPL_ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {NPL_ESTADO_LABELS[e]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="esPublico"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-orange-600"
                {...register('esPublico')}
              />
              <FormLabel htmlFor="esPublico" className="mb-0 cursor-pointer">
                Mostrar en el portal web público
              </FormLabel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
