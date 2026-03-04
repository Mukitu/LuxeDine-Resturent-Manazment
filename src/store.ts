import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'owner' | 'manager' | 'waiter' | 'customer';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      isCartOpen: false,
      addItem: (item) => {
        const items = [...get().items];
        const existingItem = items.find((i) => i.id === item.id);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          items.push(item);
        }
        const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items, total, isCartOpen: true });
      },
      removeItem: (id) => {
        const items = get().items.filter((i) => i.id !== id);
        const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items, total });
      },
      updateQuantity: (id, quantity) => {
        const items = get().items.map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, quantity) } : i
        ).filter(i => i.quantity > 0);
        const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        set({ items, total });
      },
      clearCart: () => set({ items: [], total: 0 }),
      setCartOpen: (isCartOpen) => set({ isCartOpen }),
    }),
    {
      name: 'cart-storage',
    }
  )
);
