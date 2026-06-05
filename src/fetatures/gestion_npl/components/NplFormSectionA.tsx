'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { FormError, FormInput, FormLabel } from '@/src/shared/components/forms';
import { NplInput } from '../schemas/nplSchema';
import {
  NPL_TIPOS_INMUEBLE,
  NPL_TIPO_INMUEBLE_LABELS,
} from '../types/npl.types';
import NplImageUploader from './NplImageUploader';
import NplRichTextEditor from './NplRichTextEditor';
import ProvinciasMunicipiosSelect from './ProvinciasMunicipiosSelect';
import CatastroLookupButton from './CatastroLookupButton';
import NplMapPreview from './NplMapPreview';

export default function NplFormSectionA() {
  const {
    register,
    watch,
    control,
    formState: { errors },
  } = useFormContext<NplInput>();

  const codigoGenerado = watch('nuestroCodigoNpl');

  return (
    <div className="space-y-6">
      <h3 className="text-base font-semibold text-gray-900 border-b pb-2">
        A. Superficies y datos registrales
      </h3>

      {/* Código NPL (display-only en edición, generado automáticamente al crear) */}
      {codigoGenerado && (
        <div className="rounded-md bg-orange-50 border border-orange-200 px-4 py-2 flex items-center gap-3">
          <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">
            Código NPL
          </span>
          <span className="font-mono text-base font-bold text-orange-900">
            {codigoGenerado}
          </span>
          <input type="hidden" {...register('nuestroCodigoNpl')} />
        </div>
      )}

      {/* Título */}
      <div>
        <FormLabel htmlFor="tituloOperacion">
          Título de la operación *
        </FormLabel>
        <FormInput
          id="tituloOperacion"
          type="text"
          placeholder="Ej. Operación Caravaca de la Cruz"
          {...register('tituloOperacion')}
        />
        {errors.tituloOperacion && (
          <FormError>{errors.tituloOperacion.message}</FormError>
        )}
      </div>

      {/* Referencia Fondo + Fondo */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="referenciaOrigen">Referencia Fondo</FormLabel>
          <FormInput
            id="referenciaOrigen"
            type="text"
            {...register('referenciaOrigen')}
          />
        </div>
        <div>
          <FormLabel htmlFor="fondo">Fondo</FormLabel>
          <FormInput
            id="fondo"
            type="text"
            placeholder="Nombre del fondo"
            maxLength={100}
            {...register('fondo')}
          />
          {errors.fondo && <FormError>{errors.fondo.message}</FormError>}
        </div>
      </div>

      {/* IDUFIR + CRU */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="idufir">IDUFIR</FormLabel>
          <FormInput id="idufir" type="text" maxLength={50} {...register('idufir')} />
        </div>
        <div>
          <FormLabel htmlFor="cru">CRU</FormLabel>
          <FormInput id="cru" type="text" maxLength={50} {...register('cru')} />
        </div>
      </div>

      {/* Tipo inmueble */}
      <div>
        <FormLabel htmlFor="tipoInmueble">Tipo de inmueble *</FormLabel>
        <select
          id="tipoInmueble"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          {...register('tipoInmueble')}
        >
          {NPL_TIPOS_INMUEBLE.map((tipo) => (
            <option key={tipo} value={tipo}>
              {NPL_TIPO_INMUEBLE_LABELS[tipo]}
            </option>
          ))}
        </select>
        {errors.tipoInmueble && (
          <FormError>{errors.tipoInmueble.message}</FormError>
        )}
      </div>

      {/* Dirección */}
      <div>
        <FormLabel htmlFor="direccion">Dirección</FormLabel>
        <FormInput
          id="direccion"
          type="text"
          placeholder="Calle, número..."
          {...register('direccion')}
        />
      </div>

      {/* ─── Provincia → Municipio en cascada ─────────────────────────────── */}
      <ProvinciasMunicipiosSelect />

      {/* Comunidad autónoma */}
      <div>
        <FormLabel htmlFor="comunidadAutonoma">Comunidad autónoma</FormLabel>
        <FormInput id="comunidadAutonoma" type="text" maxLength={100} {...register('comunidadAutonoma')} />
      </div>

      {/* Código postal */}
      <div>
        <FormLabel htmlFor="codigoPostal">Código postal</FormLabel>
        <FormInput
          id="codigoPostal"
          type="text"
          maxLength={10}
          {...register('codigoPostal')}
        />
      </div>

      {/* Distribución resumida */}
      <div>
        <FormLabel htmlFor="distribucionResumida">
          Distribución resumida
        </FormLabel>
        <FormInput
          id="distribucionResumida"
          type="text"
          maxLength={255}
          placeholder="Ej. 3 hab., 2 baños, salón, cocina, terraza"
          {...register('distribucionResumida')}
        />
        {errors.distribucionResumida && (
          <FormError>{errors.distribucionResumida.message}</FormError>
        )}
      </div>

      {/* Distribución detallada (TipTap) */}
      <div>
        <FormLabel>Distribución detallada</FormLabel>
        <Controller
          name="distribucion"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Descripción de la distribución..."
              error={errors.distribucion?.message}
            />
          )}
        />
      </div>

      {/* Superficies */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="superficieConst">
            Superficie construida (m²)
          </FormLabel>
          <FormInput
            id="superficieConst"
            type="number"
            step="0.01"
            min="0"
            {...register('superficieConst')}
          />
          {errors.superficieConst && (
            <FormError>{errors.superficieConst.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="superficieUtil">
            Superficie útil (m²)
          </FormLabel>
          <FormInput
            id="superficieUtil"
            type="number"
            step="0.01"
            min="0"
            {...register('superficieUtil')}
          />
        </div>
        <div>
          <FormLabel htmlFor="superficieParcela">
            Superficie parcela (m²)
          </FormLabel>
          <FormInput
            id="superficieParcela"
            type="number"
            step="0.01"
            min="0"
            {...register('superficieParcela')}
          />
          {errors.superficieParcela && (
            <FormError>{errors.superficieParcela.message}</FormError>
          )}
        </div>
      </div>

      <div>
        <FormLabel htmlFor="superficieDetalles">
          Detalles de superficies
        </FormLabel>
        <FormInput
          id="superficieDetalles"
          type="text"
          placeholder="Ej. 218,50 m² edificados + terraza 14,80 m²"
          {...register('superficieDetalles')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="anyConstruccion">Año de construcción</FormLabel>
          <FormInput
            id="anyConstruccion"
            type="number"
            min="1800"
            max="2100"
            placeholder="2005"
            {...register('anyConstruccion')}
          />
          {errors.anyConstruccion && (
            <FormError>{errors.anyConstruccion.message}</FormError>
          )}
        </div>
        <div>
          <FormLabel htmlFor="fincaRegistral">Finca registral</FormLabel>
          <FormInput
            id="fincaRegistral"
            type="text"
            {...register('fincaRegistral')}
          />
        </div>
      </div>

      {/* Ref. catastral + buscador Catastro */}
      <div>
        <FormLabel htmlFor="refCatastral">Ref. catastral</FormLabel>
        <FormInput
          id="refCatastral"
          type="text"
          placeholder="Ej. 6405410PB5260N0128FD"
          {...register('refCatastral')}
        />
        <CatastroLookupButton />
      </div>

      {/* Uso catastral + valores */}
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <FormLabel htmlFor="usoCatastral">Uso catastral</FormLabel>
          <FormInput id="usoCatastral" type="text" maxLength={100} placeholder="Residencial, Industrial..." {...register('usoCatastral')} />
        </div>
        <div>
          <FormLabel htmlFor="valorRefCatastral">Valor ref. catastral (€)</FormLabel>
          <FormInput id="valorRefCatastral" type="number" step="0.01" min="0" placeholder="0.00" {...register('valorRefCatastral')} />
        </div>
        <div>
          <FormLabel htmlFor="valorCatastral">Valor catastral (€)</FormLabel>
          <FormInput id="valorCatastral" type="number" step="0.01" min="0" placeholder="0.00" {...register('valorCatastral')} />
        </div>
      </div>

      {/* Coordenadas Catastro — editables manualmente, se graban con el formulario */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FormLabel htmlFor="latCatastro">Latitud (Catastro)</FormLabel>
          <FormInput
            id="latCatastro"
            type="text"
            placeholder="Ej. 37.215010"
            {...register('latCatastro')}
          />
        </div>
        <div>
          <FormLabel htmlFor="lngCatastro">Longitud (Catastro)</FormLabel>
          <FormInput
            id="lngCatastro"
            type="text"
            placeholder="Ej. -7.235894"
            {...register('lngCatastro')}
          />
        </div>
      </div>

      {/* Mapa — aparece en cuanto hay coordenadas válidas */}
      <NplMapPreview />

      <div>
        <FormLabel htmlFor="datosRegistro">Datos de registro</FormLabel>
        <textarea
          id="datosRegistro"
          rows={2}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          placeholder="Tomo, libro, folio, inscripción..."
          {...register('datosRegistro')}
        />
      </div>

      {/* Notas y observaciones (TipTap) */}
      <div>
        <FormLabel>Notas y observaciones</FormLabel>
        <Controller
          control={control}
          name="notasObservaciones"
          render={({ field }) => (
            <NplRichTextEditor
              value={field.value ?? ''}
              onChange={field.onChange}
              placeholder="Observaciones generales, contexto, condicionantes, oportunidades detectadas..."
            />
          )}
        />
      </div>

      {/* Imagen principal */}
      <div>
        <FormLabel>Imagen principal</FormLabel>
        <NplImageUploader fieldName="imagenAsociada" multiple={false} />
      </div>

      {/* Imágenes adicionales */}
      <div>
        <FormLabel>Imágenes adicionales</FormLabel>
        <NplImageUploader fieldName="imagenesAdicionales" multiple={true} />
      </div>
    </div>
  );
}
