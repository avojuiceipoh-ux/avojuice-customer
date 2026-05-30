/**
 * banners.ts — 顾客端海报接口
 *
 * GET /banners?placement=home|profile
 */
import { api } from './client';

export type BannerPlacement = 'home' | 'profile';

export interface Banner {
  id: string;
  placement: BannerPlacement;
  title: string | null;
  image_url: string;
  link_type: 'none' | 'product' | 'category' | 'url' | null;
  link_value: string | null;
  sort_order: number;
}

export interface BannersResponse {
  success: boolean;
  placement: BannerPlacement;
  from_cache?: boolean;
  banners: Banner[];
}

export const bannersApi = {
  async list(placement: BannerPlacement): Promise<Banner[]> {
    const { data } = await api.get<BannersResponse>('/banners', {
      params: { placement },
    });
    return data.banners ?? [];
  },
};
