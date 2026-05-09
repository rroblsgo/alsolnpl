import { create } from 'zustand';
import { SelectCliente } from '../types/cliente.types';

type ClienteStore = {
  deleteOpen: boolean;
  setDeleteOpen: (open: boolean) => void;
  selectedCliente: SelectCliente | null;
  setSelectedCliente: (cliente: SelectCliente | null) => void;
};

export const useClienteStore = create<ClienteStore>((set) => ({
  deleteOpen: false,
  setDeleteOpen: (open) => set({ deleteOpen: open }),
  selectedCliente: null,
  setSelectedCliente: (cliente) => set({ selectedCliente: cliente }),
}));
