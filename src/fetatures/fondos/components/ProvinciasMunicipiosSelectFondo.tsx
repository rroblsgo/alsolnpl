'use client';

import { useFormContext } from 'react-hook-form';
import { FondoInput } from '../schemas/fondoSchema';
import ProvinciasMunicipiosSelectCliente from '@/src/fetatures/clientes/components/ProvinciasMunicipiosSelectCliente';

// Reutilizamos el selector de clientes: internamente lee 'provincia' y 'municipio'
// que coinciden exactamente con los campos del schema de fondos.
export default function ProvinciasMunicipiosSelectFondo() {
  return <ProvinciasMunicipiosSelectCliente />;
}
