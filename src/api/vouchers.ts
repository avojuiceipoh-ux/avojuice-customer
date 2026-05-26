/**
 * vouchers.ts — 免费饮品券 API
 */
import { api } from './client';

export interface Voucher {
  id: string;
  max_value: string;
  issued_at: string;
  expires_at: string;
  status: 'available' | 'redeemed' | 'expired';
  redeemed_at: string | null;
  effective_status: 'available' | 'redeemed' | 'expired';
  days_left: number;
}

export interface VouchersResponse {
  success: boolean;
  /** 旧字段：可用券（向后兼容） */
  vouchers: Voucher[];
  available: Voucher[];
  redeemed: Voucher[];
  expired: Voucher[];
  count: {
    available: number;
    redeemed: number;
    expired: number;
  };
}

export const vouchersApi = {
  async list(): Promise<VouchersResponse> {
    const { data } = await api.get<VouchersResponse>('/vouchers');
    return data;
  },
};
