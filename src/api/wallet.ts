import { api } from './client';

export interface WalletSnapshot {
  balance: string | number;
  total_earned: string | number;
  total_spent: string | number;
  monthly_earned: string | number;
}

export interface WalletTransaction {
  type: 'credit' | 'debit';
  amount: string;
  source_type: string;
  balance_after: string;
  description?: string;
  created_at: string;
}

export interface FreeVoucher {
  id: string;
  max_value: string;
  issued_at: string;
  expires_at: string;
}

export interface WalletResponse {
  success: boolean;
  wallet: WalletSnapshot;
  transactions: WalletTransaction[];
  monthly_remaining: number;
  /** 累计杯数（含已兑券对应的完整轮次） */
  cups_total: number;
  /** 当前轮次已积杯数（0-9） */
  cups_progress: number;
  /** 距离下一张免费券还差几杯 */
  cups_to_next_reward: number;
  /** 历史触发的免费券总数（含已用） */
  free_drinks_earned: number;
  /** 当前可用的免费券列表（max_value 默认 RM 8，30 天有效） */
  free_vouchers: FreeVoucher[];
  /** 可用券数量 */
  free_voucher_count: number;
}

export const walletApi = {
  async get(): Promise<WalletResponse> {
    const { data } = await api.get<WalletResponse>('/wallet');
    return data;
  },
};
