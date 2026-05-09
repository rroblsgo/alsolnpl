import { create } from 'zustand';
import { SelectNpl } from '../types/npl.types';

type NplStore = {
  // Modal de confirmación de borrado
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  // NPL seleccionado para acciones (editar / borrar / cambiar estado)
  selectedNpl: SelectNpl | null;
  setSelectedNpl: (npl: SelectNpl | null) => void;
  // Filtro activo en el grid público
  filtroEstado: 'TODAS' | 'ACTIVO' | 'RESERVADO' | 'VENDIDO';
  setFiltroEstado: (estado: NplStore['filtroEstado']) => void;
};

export const useNplStore = create<NplStore>((set) => ({
  deleteOpen: false,
  setDeleteOpen: (open) => set({ deleteOpen: open }),
  selectedNpl: null,
  setSelectedNpl: (npl) => set({ selectedNpl: npl }),
  filtroEstado: 'TODAS',
  setFiltroEstado: (estado) => set({ filtroEstado: estado }),
}));
