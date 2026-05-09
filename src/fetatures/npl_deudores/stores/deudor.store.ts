import { create } from 'zustand';
import { SelectNplDeudor } from '../types/deudor.types';

type DeudorStore = {
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  selectedDeudor: SelectNplDeudor | null;
  setSelectedDeudor: (deudor: SelectNplDeudor | null) => void;
};

export const useDeudorStore = create<DeudorStore>((set) => ({
  deleteOpen: false,
  setDeleteOpen: (open) => set({ deleteOpen: open }),
  selectedDeudor: null,
  setSelectedDeudor: (deudor) => set({ selectedDeudor: deudor }),
}));
