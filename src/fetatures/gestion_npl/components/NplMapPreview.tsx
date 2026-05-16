'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { NplInput } from '../schemas/nplSchema';
import { DynamicNplLocation } from './DynamicNplLocation';

/**
 * Se usa dentro del NplForm (edición).
 * Lee latCatastro/lngCatastro del contexto del formulario y muestra el mapa
 * si hay coordenadas — tanto las guardadas en BD como las recién obtenidas
 * del Catastro antes de guardar.
 */
export default function NplMapPreview() {
  const { control } = useFormContext<NplInput>();

  const latStr   = useWatch({ control, name: 'latCatastro' });
  const lngStr   = useWatch({ control, name: 'lngCatastro' });
  const direccion = useWatch({ control, name: 'direccion' });
  const municipio = useWatch({ control, name: 'municipio' });
  const provincia = useWatch({ control, name: 'provincia' });
  const titulo    = useWatch({ control, name: 'tituloOperacion' });

  const lat = latStr ? parseFloat(latStr) : null;
  const lng = lngStr ? parseFloat(lngStr) : null;

  if (!lat || !lng || isNaN(lat) || isNaN(lng)) return null;

  const direccionCompleta = [direccion, municipio, provincia]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          📍 Ubicación catastral
        </h3>
        <span className="font-mono text-[10px] text-gray-400">
          {lat.toFixed(6)}, {lng.toFixed(6)}
        </span>
      </div>
      {direccionCompleta && (
        <p className="text-xs text-gray-500">{direccionCompleta}</p>
      )}
      <DynamicNplLocation
        lat={lat}
        lng={lng}
        direccion={direccionCompleta}
        titulo={titulo ?? ''}
      />
    </div>
  );
}
