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
  voucher_id?: string;
  promotion_code?: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  total_paid: number;
  message: string;
}

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  subtotal: string;
  discount_amount: string;
  wallet_used: string;
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
