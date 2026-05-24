/**
 * favorites.ts — 产品收藏 API 封装
 */
import { api } from './client';

export interface FavoriteProduct {
  id: string;
  name_cn: string;
  name_en: string;
  price: string | number;
  image_url: string | null;
  description_cn?: string | null;
  is_available: boolean;
  outlet_id: string | null;
  favorited_at: string;
}

export interface FavoritesResponse {
  success: boolean;
  favorites: FavoriteProduct[];
  count: number;
}

export const favoritesApi = {
  /** 列出当前用户收藏的所有产品 */
  async list(): Promise<FavoritesResponse> {
    const { data } = await api.get<FavoritesResponse>('/favorites');
    return data;
  },

  /** 添加收藏（幂等） */
  async add(productId: string): Promise<void> {
    await api.post(`/favorites/${productId}`);
  },

  /** 取消收藏 */
  async remove(productId: string): Promise<void> {
    await api.delete(`/favorites/${productId}`);
  },
};
