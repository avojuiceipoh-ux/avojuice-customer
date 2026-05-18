import { api } from './client';

export interface ProductOption {
  id: number;
  type: 'sweetness' | 'ice' | string;
  label: string;
  is_default: boolean;
}

export interface Product {
  id: string;                  // UUID
  category_id: number;
  name_cn: string;
  name_en?: string;
  description?: string;
  price: string;               // 后端返回字符串 "12.00"
  image_url?: string | null;
  /** 真材展示：[{name:"鳄梨", qty:2, unit:"颗"}, {name:"草莓", qty:50, unit:"g"}] */
  fruit_info?: Array<{ name: string; qty: number; unit: string; emoji?: string }> | null;
  is_available: boolean;
  sort_order: number;
  options: ProductOption[];
}

export interface Category {
  id: number;
  name_cn: string;
  name_en?: string;
  sort_order: number;
  products: Product[];
}

export interface MenuResponse {
  success: boolean;
  from_cache?: boolean;
  categories: Category[];
}

export const productsApi = {
  /** 获取完整菜单 */
  async getMenu(outletId: string): Promise<MenuResponse> {
    const { data } = await api.get<MenuResponse>('/products', {
      params: { outlet_id: outletId },
    });
    return data;
  },
};

/** 工具：把字符串价格转成 number（后端返回 NUMERIC → 字符串） */
export const toPrice = (s: string | number | undefined): number => {
  if (s == null) return 0;
  const n = typeof s === 'string' ? parseFloat(s) : s;
  return Number.isFinite(n) ? n : 0;
};

/** 工具：格式化为 RM x.xx */
export const formatRM = (s: string | number | undefined): string =>
  `RM ${toPrice(s).toFixed(2)}`;
