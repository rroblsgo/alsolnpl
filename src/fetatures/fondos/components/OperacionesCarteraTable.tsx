'use client';

import { useEffect, useState, useCallback, useTransition } from 'react';
import type { SelectOperacion } from '@/src/db/schema/operaciones';
import type { MapItem } from '@/src/db/schema/fondos';
import type { TablePreferences } from '@/src/db/schema/user_table_preferences';
import { DEFAULT_OPERACIONES_ORDER } from '@/src/db/schema/user_table_preferences';
import OperacionesTable from './OperacionesTable';
import { getTablePreferencesAction, saveTablePreferencesAction } from '../actions/table-preferences-actions';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

type Props = {
  operaciones: SelectOperacion[];
  mapItems:    MapItem[];
  carteraName: string;
};

export default function OperacionesCarteraTable({ operaciones, mapItems, carteraName }: Props) {
  const [prefs, setPrefs]         = useState<TablePreferences>({
    columnOrder:      ['_sel', '_id', ...DEFAULT_OPERACIONES_ORDER],
    columnVisibility: {},
  });
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [prefsDirty,  setPrefsDirty]  = useState(false);
  const [isSaving, startSaving]       = useTransition();

  useEffect(() => {
    getTablePreferencesAction().then(p => {
      setPrefs(p);
      setPrefsLoaded(true);
    });
  }, []);

  const handlePrefsChange = useCallback((newPrefs: Partial<TablePreferences>) => {
    setPrefs(prev => ({ ...prev, ...newPrefs }));
    setPrefsDirty(true);
  }, []);

  const handleSavePrefs = useCallback(() => {
    startSaving(async () => {
      await saveTablePreferencesAction(prefs);
      setPrefsDirty(false);
      toast.success('Configuración de columnas guardada');
    });
  }, [prefs]);

  if (!prefsLoaded) {
    return <p className="py-8 text-center text-sm text-gray-400">Cargando tabla...</p>;
  }

  return (
    <div className="space-y-2">
      {prefsDirty && (
        <div className="flex justify-end">
          <button
            onClick={handleSavePrefs}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5
                       text-xs font-semibold text-white hover:bg-emerald-700
                       disabled:opacity-60 transition-colors"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Guardando...' : 'Guardar configuración de columnas'}
          </button>
        </div>
      )}
      <OperacionesTable
        operaciones={operaciones}
        mapItems={mapItems}
        carteraName={carteraName}
        savedColumnOrder={prefs.columnOrder}
        savedColumnVisibility={prefs.columnVisibility}
        onPrefsChange={handlePrefsChange}
      />
    </div>
  );
}
