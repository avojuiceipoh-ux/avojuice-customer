import { api } from './client';

export interface User {
  id: string;
  phone: string;
  nickname?: string;
  avatar_url?: string;
  referral_code?: string;
  membership_tier?: string;
  total_cups?: number;
}

export interface VerifyResponse {
  success: boolean;
  token: string;
  user: User;
  is_new_user?: boolean;
}

export const authApi = {
  async requestOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post('/auth/request-otp', { phone });
    return data;
  },

  async verifyOtp(phone: string, otp: string, referral_code?: string): Promise<VerifyResponse> {
    const { data } = await api.post<VerifyResponse>('/auth/verify-otp', {
      phone,
      otp,
      referral_code,
    });
    return data;
  },
};
