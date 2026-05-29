'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { initEnrichmentAction } from '../actions/enrichment-actions';

type Props = {
  operacionId: number;
  /** Si ya existe enrichment, lo tendremos aquí para navegar directamente */
  enrichmentId?: number | null;
};

export default function InitEnrichmentButton({ operacionId, enrichmentId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    // Si ya existe enrichment, navegar directamente
    if (enrichmentId) {
      router.push(`/dashboard/operaciones/${operacionId}/enrichment`);
      return;
    }

    startTransition(async () => {
      const result = await initEnrichmentAction(operacionId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success('Enrichment iniciado');
      router.push(`/dashboard/operaciones/${operacionId}/enrichment`);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
    >
      <Sparkles size={16} />
      {isPending
        ? 'Iniciando...'
        : enrichmentId
          ? 'Ver Enrichment'
          : 'Iniciar Enrichment'}
    </button>
  );
}
