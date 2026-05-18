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

export interface WalletResponse {
  success: boolean;
  wallet: WalletSnapshot;
  transactions: WalletTransaction[];
  monthly_remaining: number;
}

export const walletApi = {
  async get(): Promise<WalletResponse> {
    const { data } = await api.get<WalletResponse>('/wallet');
    return data;
  },
};
