import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, ShoppingBag, Gift, Wallet, CreditCard, Building2, Check } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { VoucherWonModal } from '../src/components/VoucherWonModal';
import { useCartStore } from '../src/store/cart';
import { useAuthStore } from '../src/store/auth';
import { formatRM } from '../src/api/products';
import { ordersApi, type PaymentMethod } from '../src/api/orders';
import { walletApi } from '../src/api/wallet';
import { DEFAULT_OUTLET_ID } from '../src/lib/env';
import { useTheme } from '../src/lib/theme';
import type { ApiError } from '../src/api/client';

const VOUCHER_MAX_VALUE = 8.00;

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; subtitle: string; enabled: boolean; icon: typeof Wallet }[] = [
  { value: 'cash', label: '现金 / QR Pay 到店付', subtitle: '到摊位付款，扫码即可', enabled: true, icon: Wallet },
  { value: 'wallet', label: '钱包余额', subtitle: 'V1 mock，可下单但不扣款', enabled: true, icon: CreditCard },
  { value: 'tng', label: 'Touch \'n Go eWallet', subtitle: '商户审核中，敬请期待', enabled: false, icon: Wallet },
  { value: 'fpx', label: 'FPX 网银', subtitle: '商户审核中，敬请期待', enabled: false, icon: Building2 },
];

export default function CheckoutScreen() {
  const { isDark } = useTheme();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clear = useCartStore((s) => s.clear);
  const isAuthed = !!useAuthStore((s) => s.token);

  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [useVoucher, setUseVoucher] = useState(false);

  const [voucherWon, setVoucherWon] = useState<{
    count: number; progressAfter: number; orderId: string;
  } | null>(null);

  const { data: walletData } = useQuery({
    queryKey: ['wallet'], queryFn: () => walletApi.get(), enabled: isAuthed,
  });
  const availableVouchers = walletData?.free_vouchers ?? [];
  const hasVoucher = availableVouchers.length > 0;

  const maxUnitPrice = items.reduce((max, i) => Math.max(max, i.unit_price), 0);
  const voucherDiscountPreview = useVoucher && hasVoucher ? Math.min(maxUnitPrice, VOUCHER_MAX_VALUE) : 0;
  const voucherSurplusPreview = useVoucher && hasVoucher ? Math.max(0, maxUnitPrice - VOUCHER_MAX_VALUE) : 0;
  const previewCupsRaw = items.reduce((sum, i) => sum + i.quantity, 0);
  const previewCups = useVoucher && hasVoucher ? Math.max(0, previewCupsRaw - 1) : previewCupsRaw;
  const totalAfterVoucher = Math.max(0, total - voucherDiscountPreview);

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const headerBg = isDark ? '#171717' : '#fff';

  if (items.length === 0 && !voucherWon) {
    return (
      <View className="flex-1" style={{ backgroundColor: bg }}>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: sub }}>购物车是空的</Text>
          <Pressable onPress={() => router.replace('/(tabs)/menu')} className="mt-4 bg-brand-500 px-8 py-3 rounded-2xl">
            <Text className="text-white font-bold">去看菜单</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (voucherWon && items.length === 0) {
    return (
      <View className="flex-1" style={{ backgroundColor: bg }}>
        <VoucherWonModal
          visible={!!voucherWon}
          vouchersIssued={voucherWon.count}
          progressAfter={voucherWon.progressAfter}
          onClose={() => {
            const orderId = voucherWon.orderId;
            setVoucherWon(null);
            router.replace(`/order/${orderId}`);
          }}
        />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!isAuthed) {
      Alert.alert('请先登录', '下单前需要登录账号', [
        { text: '取消', style: 'cancel' },
        { text: '去登录', onPress: () => router.push('/auth/login') },
      ]);
      return;
    }
    try {
      setSubmitting(true);
      const res = await ordersApi.create({
        outlet_id: DEFAULT_OUTLET_ID,
        items: items.map((i) => ({ product_id: i.product_id as any, quantity: i.quantity, customizations: i.options })),
        payment_method: payment,
        voucher_id: useVoucher && hasVoucher ? availableVouchers[0].id : undefined,
        notes: notes.trim() || undefined,
      });
      await clear();
      if (res.vouchers_issued && res.vouchers_issued > 0) {
        setVoucherWon({ count: res.vouchers_issued, progressAfter: res.progress_after ?? 0, orderId: res.order_id });
      } else {
        router.replace(`/order/${res.order_id}`);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('下单失败', apiErr.message || '请稍后再试');
    } finally { setSubmitting(false); }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row items-center" style={{ backgroundColor: headerBg, borderBottomWidth: 0.5, borderBottomColor: border }}>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }} hitSlop={8}>
          <ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} />
        </Pressable>
        <Text style={{ color: text }} className="text-lg font-bold">确认订单</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
          {/* 摊位信息 */}
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <View className="flex-row items-center">
              <MapPin size={18} color="#649b29" />
              <Text style={{ color: sub }} className="text-xs ml-2">取餐摊位</Text>
            </View>
            <Text style={{ color: text }} className="text-base font-semibold mt-1.5">爱我果饮 · UTAR 总店</Text>
            <Text style={{ color: sub }} className="text-xs mt-0.5">UTAR 校园 · 现做现取</Text>
          </View>

          {/* 商品列表 */}
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <View className="flex-row items-center mb-3">
              <ShoppingBag size={16} color="#649b29" />
              <Text style={{ color: text }} className="text-sm font-bold ml-2">商品明细</Text>
            </View>
            {items.map((item, idx) => (
              <View key={item.cart_id} className={`flex-row items-start ${idx > 0 ? 'mt-3 pt-3' : ''}`}
                style={{ borderTopWidth: idx > 0 ? 0.5 : 0, borderTopColor: border }}>
                <View className="w-12 h-12 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#1a2e14' : '#e8f5e0' }}>
                  <Text className="text-xl">🥤</Text>
                </View>
                <View className="flex-1">
                  <Text style={{ color: text }} className="text-sm font-semibold">{item.product_name}</Text>
                  {item.options_label ? <Text style={{ color: sub }} className="text-xs mt-0.5">{item.options_label}</Text> : null}
                  <Text style={{ color: sub }} className="text-xs mt-1">× {item.quantity}</Text>
                </View>
                <Text style={{ color: text }} className="text-sm font-bold">{formatRM(item.unit_price * item.quantity)}</Text>
              </View>
            ))}
          </View>

          {/* 免费券 */}
          {hasVoucher ? (
            <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: isDark ? '#2a2010' : '#fffbeb', borderWidth: 2, borderColor: isDark ? '#5c4a1f' : '#fcd34d' }}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 flex-row items-center">
                  <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#5c4a1f' : '#f59e0b' }}>
                    <Gift size={18} color="#fff" />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: isDark ? '#fbbf24' : '#92400e' }} className="text-sm font-bold">
                      使用免费券（{availableVouchers.length} 张可用）
                    </Text>
                    <Text style={{ color: isDark ? '#a16207' : '#b45309' }} className="text-xs mt-0.5">
                      每张抵 RM {VOUCHER_MAX_VALUE.toFixed(2)} 饮品，超出补差价
                    </Text>
                  </View>
                </View>
                <Switch value={useVoucher} onValueChange={setUseVoucher} trackColor={{ false: '#e5e5e5', true: '#649b29' }} thumbColor="#fff" />
              </View>
              {useVoucher && maxUnitPrice > 0 ? (
                <View className="mt-3 pt-3" style={{ borderTopWidth: 0.5, borderTopColor: isDark ? '#5c4a1f' : '#fde68a' }}>
                  <View className="flex-row justify-between"><Text style={{ color: isDark ? '#a16207' : '#92400e' }} className="text-xs">用在最贵那杯</Text><Text className="text-xs font-semibold" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>{formatRM(maxUnitPrice)}</Text></View>
                  <View className="flex-row justify-between mt-1.5"><Text style={{ color: isDark ? '#a16207' : '#92400e' }} className="text-xs">券抵扣</Text><Text className="text-xs font-bold text-brand-600">− {formatRM(voucherDiscountPreview)}</Text></View>
                  {voucherSurplusPreview > 0 ? <View className="flex-row justify-between mt-1.5"><Text style={{ color: isDark ? '#a16207' : '#92400e' }} className="text-xs">差价</Text><Text className="text-xs font-semibold" style={{ color: isDark ? '#fbbf24' : '#92400e' }}>{formatRM(voucherSurplusPreview)}</Text></View> : <Text className="text-brand-600 text-xs mt-1.5 font-semibold">✅ 这杯完全免费</Text>}
                </View>
              ) : null}
            </View>
          ) : null}

          {/* 支付方式 */}
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <View className="flex-row items-center mb-3">
              <Wallet size={16} color="#649b29" />
              <Text style={{ color: text }} className="text-sm font-bold ml-2">支付方式</Text>
            </View>
            {PAYMENT_OPTIONS.map((opt) => {
              const active = payment === opt.value;
              const Icon = opt.icon;
              return (
                <Pressable key={opt.value} disabled={!opt.enabled} onPress={() => setPayment(opt.value)}
                  className={`flex-row items-center p-3 rounded-2xl mb-2 ${!opt.enabled ? 'opacity-50' : ''}`}
                  style={{
                    backgroundColor: active ? (isDark ? '#2a3320' : '#e8f5e0') : cardBg,
                    borderWidth: 1.5,
                    borderColor: active ? '#649b29' : border,
                  }}>
                  <Icon size={22} color={active ? '#649b29' : (isDark ? '#a3a3a3' : '#737373')} />
                  <View className="flex-1 ml-3">
                    <Text style={{ color: text }} className="text-sm font-semibold">{opt.label}</Text>
                    <Text style={{ color: sub }} className="text-xs mt-0.5">{opt.subtitle}</Text>
                  </View>
                  {active && (
                    <View className="w-6 h-6 rounded-full bg-brand-500 items-center justify-center">
                      <Check size={14} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* 备注 */}
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <Text style={{ color: text }} className="text-sm font-bold mb-2">备注（可选）</Text>
            <TextInput value={notes} onChangeText={setNotes} placeholder="例如：少冰、不加配料" placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
              multiline maxLength={100} className="text-sm min-h-[60px]" style={{ color: text, textAlignVertical: 'top' }} />
          </View>
        </ScrollView>

        {/* 底部结算栏 */}
        <View className="px-5 pt-4 pb-8" style={{ backgroundColor: headerBg, borderTopWidth: 0.5, borderTopColor: border }}>
          {useVoucher && voucherDiscountPreview > 0 ? (
            <View className="mb-3"><View className="flex-row items-center justify-between"><Text style={{ color: sub }} className="text-xs">小计</Text><Text style={{ color: text }} className="text-xs">{formatRM(total)}</Text></View>
              <View className="flex-row items-center justify-between mt-1"><Text style={{ color: isDark ? '#fbbf24' : '#b45309' }} className="text-xs">🎁 免费券抵扣</Text><Text className="text-xs font-bold text-brand-600">− {formatRM(voucherDiscountPreview)}</Text></View>
              <View className="flex-row items-center justify-between mt-2 pt-2" style={{ borderTopWidth: 0.5, borderTopColor: border }}><Text style={{ color: sub }} className="text-sm">实付</Text><Text className="text-2xl font-bold text-brand-600">{formatRM(totalAfterVoucher)}</Text></View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between mb-3"><Text style={{ color: sub }} className="text-sm">合计</Text><Text className="text-2xl font-bold text-brand-600">{formatRM(total)}</Text></View>
          )}
          {previewCups > 0 ? (
            <View className="flex-row items-center justify-between mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: isDark ? '#2a3320' : '#e8f5e0' }}>
              <Text className="text-brand-600 text-xs">🎯 下单可获</Text><Text className="text-brand-600 text-xs font-bold">+{previewCups} 杯（集 10 送 1）</Text>
            </View>
          ) : null}
          <Pressable onPress={handleSubmit} disabled={submitting}
            className="rounded-2xl py-4 items-center"
            style={{ backgroundColor: submitting ? '#95de64' : '#649b29', shadowColor: '#649b29', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}>
            <Text className="text-white font-bold text-lg">{submitting ? '提交中...' : '确认下单'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <VoucherWonModal visible={!!voucherWon} vouchersIssued={voucherWon?.count ?? 0} progressAfter={voucherWon?.progressAfter ?? 0}
        onClose={() => { const orderId = voucherWon?.orderId; setVoucherWon(null); if (orderId) router.replace(`/order/${orderId}`); }} />
    </View>
  );
}
