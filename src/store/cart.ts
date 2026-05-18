import { create } from 'zustand';
import { STORAGE_KEYS } from '../lib/env';
import { storage } from '../lib/storage';

export interface CartItem {
  /** 在购物车中唯一标识（产品 ID + 选项组合的 hash） */
  cart_id: string;
  product_id: number;
  product_name: string;
  unit_price: number;     // 含选项加价后的单价
  quantity: number;
  options: Record<string, string | string[]>;
  options_label: string;  // 用于展示，比如 "全糖 / 加椰果"
  image_url?: string;
  notes?: string;
}

interface CartState {
  items: CartItem[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  add: (item: CartItem) => Promise<void>;
  remove: (cartId: string) => Promise<void>;
  setQuantity: (cartId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;

  /** 总价 */
  total: () => number;
  /** 总件数 */
  count: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  hydrated: false,

  async hydrate() {
    const items = (await storage.get<CartItem[]>(STORAGE_KEYS.cart)) ?? [];
    set({ items, hydrated: true });
  },

  async add(item) {
    const items = [...get().items];
    const existing = items.find((i) => i.cart_id === item.cart_id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push(item);
    }
    await storage.set(STORAGE_KEYS.cart, items);
    set({ items });
  },

  async remove(cartId) {
    const items = get().items.filter((i) => i.cart_id !== cartId);
    await storage.set(STORAGE_KEYS.cart, items);
    set({ items });
  },

  async setQuantity(cartId, quantity) {
    if (quantity <= 0) return get().remove(cartId);
    const items = get().items.map((i) =>
      i.cart_id === cartId ? { ...i, quantity } : i,
    );
    await storage.set(STORAGE_KEYS.cart, items);
    set({ items });
  },

  async clear() {
    await storage.remove(STORAGE_KEYS.cart);
    set({ items: [] });
  },

  total() {
    return get().items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  },

  count() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
