import { create } from 'zustand';

export interface CartItem {
  ServiceID: number;
  ServiceName: string;
  Price: number;
  Quantity: number;
  ImageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'Quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find((i) => i.ServiceID === item.ServiceID);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.ServiceID === item.ServiceID ? { ...i, Quantity: i.Quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...get().items, { ...item, Quantity: 1 }] });
    }
  },

  removeItem: (id) => {
    set({ items: get().items.filter((i) => i.ServiceID !== id) });
  },

  updateQuantity: (id, delta) => {
    set({
      items: get()
        .items.map((i) =>
          i.ServiceID === id ? { ...i, Quantity: Math.max(1, i.Quantity + delta) } : i
        )
        .filter((i) => i.Quantity > 0),
    });
  },

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => get().items.reduce((sum, item) => sum + Number(item.Price) * item.Quantity, 0),
  
  getTotalItems: () => get().items.reduce((sum, item) => sum + item.Quantity, 0),
}));