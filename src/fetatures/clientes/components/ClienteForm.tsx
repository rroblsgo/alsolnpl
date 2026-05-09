'use client';

import { useState } from 'react';
import ClienteFormSectionA from './ClienteFormSectionA';
import ClienteFormSectionB from './ClienteFormSectionB';
import ClienteFormSectionC from './ClienteFormSectionC';
import ClienteFormSectionD from './ClienteFormSectionD';

const TABS = [
  { id: 'A', label: 'A. Datos básicos'   },
  { id: 'B', label: 'B. Contacto'        },
  { id: 'C', label: 'C. Perfil inversor' },
  { id: 'D', label: 'D. Gestión interna' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ClienteForm() {
  const [activeTab, setActiveTab] = useState<TabId>('A');

  return (
    <div className="space-y-6">
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
        {activeTab === 'A' && <ClienteFormSectionA />}
        {activeTab === 'B' && <ClienteFormSectionB />}
        {activeTab === 'C' && <ClienteFormSectionC />}
        {activeTab === 'D' && <ClienteFormSectionD />}
      </div>
    </div>
  );
}
