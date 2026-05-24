import { api } from './client';

export type OrderStatus =
  | 'pending_payment'  // 未支付
  | 'paid'             // 已支付，等出餐
  | 'preparing'        // 制作中
  | 'ready'            // 可取餐
  | 'completed'        // 已完成
  | 'cancelled';       // 已取消

export type PaymentMethod = 'wallet' | 'cash' | 'tng' | 'fpx';

export interface OrderItemInput {
  product_id: string;                // UUID
  quantity: number;
  customizations?: Record<string, string | string[]>;
  is_free_drink?: boolean;
}

export interface CreateOrderPayload {
  outlet_id: string;
  items: OrderItemInput[];
  payment_method: PaymentMethod;
  wallet_amount?: number;
  /** 用免费券下单时传券 ID；后端自动选最贵那杯作为兑换目标 */
  voucher_id?: string;
  promotion_code?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  total_paid: number;
  cups_awarded: number;
  /** 本单触发了几张免费券（满 10 杯发 1 张） */
  vouchers_issued: number;
  /** 本单后的集杯进度（0-9） */
  progress_after: number;
  /** 本单是否使用了免费券 */
  voucher_used: boolean;
  /** 免费券抵扣金额（最高 RM 8） */
  voucher_discount: number;
  /** 推荐人是否获得返现（顾客本人下单时若有推荐关系才会有值） */
  referrer_cashback: {
    referrerId: string;
    actualCashback: number;
    newBalance: number;
  } | null;
  message: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discount_amount: string;
  wallet_used: string;
  voucher_used: boolean;
  voucher_discount: string;
  total_paid: string;
  pickup_code: string;
  cups_awarded: number;
  created_at: string;
  item_count: string;
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  customizations: Record<string, any>;
  subtotal: string;
  is_free_drink: boolean;
  name_cn: string;
  name_en?: string;
  image_url?: string;
}

export interface OrderDetail extends OrderSummary {
  outlet_id: string;
  outlet_name: string;
  user_id: string;
  payment_method: PaymentMethod;
  voucher_used: boolean;
  notes?: string;
  promotion_id?: string;
  items?: OrderItem[];
}

export const ordersApi = {
  async create(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const { data } = await api.post<CreateOrderResponse>('/orders', payload);
    return data;
  },

  async list(params?: { page?: number; limit?: number }) {
    const { data } = await api.get<{ success: boolean; orders: OrderSummary[] }>('/orders', {
      params,
    });
    return data;
  },

  async detail(id: string) {
    const { data } = await api.get<{
      success: boolean;
      order: OrderDetail;
      items: OrderItem[];
    }>(`/orders/${id}`);
    return data;
  },

  async cancel(id: string) {
    const { data } = await api.delete<{ success: boolean }>(`/orders/${id}/cancel`);
    return data;
  },
};
