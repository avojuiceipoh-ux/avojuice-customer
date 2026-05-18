import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { useCartStore } from '../src/store/cart';
import { useAuthStore } from '../src/store/auth';
import { formatRM } from '../src/api/products';
import { ordersApi, type PaymentMethod } from '../src/api/orders';
import { DEFAULT_OUTLET_ID } from '../src/lib/env';
import type { ApiError } from '../src/api/client';

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  subtitle: string;
  emoji: string;
  enabled: boolean;
}[] = [
  {
    value: 'cash',
    label: '现金 / QR Pay 到店付',
    subtitle: '到摊位付款，扫码即可',
    emoji: '💵',
    enabled: true,
  },
  {
    value: 'wallet',
    label: '钱包余额',
    subtitle: 'V1 mock，可下单但不扣款',
    emoji: '💚',
    enabled: true,
  },
  {
    value: 'tng',
    label: 'Touch ’n Go eWallet',
    subtitle: '商户审核中，敬请期待',
    emoji: '🅣',
    enabled: false,
  },
  {
    value: 'fpx',
    label: 'FPX 网银',
    subtitle: '商户审核中，敬请期待',
    emoji: '🏦',
    enabled: false,
  },
];

export default function CheckoutScreen() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const clear = useCartStore((s) => s.clear);
  const isAuthed = !!useAuthStore((s) => s.token);

  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (items.length === 0) {
    // 防御：空车不应该到这里
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-ink-500">购物车是空的</Text>
          <View className="mt-4">
            <Button onPress={() => router.replace('/(tabs)/menu')}>去看菜单</Button>
          </View>
        </View>
      </Screen>
    );
  }

  const handleSubmit = async () => {
    // 未登录 → 跳登录
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
        items: items.map((i) => ({
          product_id: i.product_id as any,
          quantity: i.quantity,
          customizations: i.options,
        })),
        payment_method: payment,
        notes: notes.trim() || undefined,
      });

      // 下单成功 → 清空购物车 → 跳订单详情
      await clear();
      router.replace(`/order/${res.order_id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('下单失败', apiErr.message || '请稍后再试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 bg-white flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-ink-100 items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-xl text-ink-900">‹</Text>
        </Pressable>
        <Text className="text-lg font-bold text-ink-900">确认订单</Text>
        <View className="w-9" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
          {/* 摊位信息 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-xs text-ink-500">取餐摊位</Text>
            <Text className="text-base font-semibold text-ink-900 mt-1">爱我果饮 · UTAR 总店</Text>
            <Text className="text-xs text-ink-500 mt-1">UTAR 校园 · 现做现取</Text>
          </View>

          {/* 商品列表 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-bold text-ink-900 mb-3">商品明细</Text>
            {items.map((item, idx) => (
              <View
                key={item.cart_id}
                className={`flex-row items-start ${idx > 0 ? 'mt-3 pt-3 border-t border-ink-100' : ''}`}
              >
                <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mr-3">
                  <Text className="text-xl">🥤</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-ink-900">{item.product_name}</Text>
                  {item.options_label ? (
                    <Text className="text-xs text-ink-500 mt-0.5">{item.options_label}</Text>
                  ) : null}
                  <Text className="text-xs text-ink-500 mt-1">× {item.quantity}</Text>
                </View>
                <Text className="text-sm font-bold text-ink-900">
                  {formatRM(item.unit_price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* 支付方式 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-bold text-ink-900 mb-3">支付方式</Text>
            {PAYMENT_OPTIONS.map((opt) => {
              const active = payment === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  disabled={!opt.enabled}
                  onPress={() => setPayment(opt.value)}
                  className={`flex-row items-center p-3 rounded-2xl mb-2 ${
                    active ? 'bg-brand-50 border-2 border-brand-500' : 'border-2 border-ink-100'
                  } ${!opt.enabled ? 'opacity-50' : ''}`}
                >
                  <Text className="text-2xl mr-3">{opt.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-ink-900">{opt.label}</Text>
                    <Text className="text-xs text-ink-500 mt-0.5">{opt.subtitle}</Text>
                  </View>
                  {active && (
                    <View className="w-6 h-6 rounded-full bg-brand-500 items-center justify-center">
                      <Text className="text-white text-xs font-bold">✓</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* 备注 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-bold text-ink-900 mb-2">备注（可选）</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="例如：少冰、不加配料"
              placeholderTextColor="#a3a3a3"
              multiline
              maxLength={100}
              className="text-sm text-ink-900 min-h-[60px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>

        {/* 底部固定栏：合计 + 下单 */}
        <View className="bg-white px-4 pt-3 pb-6 border-t border-ink-100">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-sm text-ink-500">合计</Text>
            <Text className="text-2xl font-bold text-brand-600">{formatRM(total)}</Text>
          </View>
          <Button fullWidth loading={submitting} onPress={handleSubmit}>
            {submitting ? '提交中...' : '确认下单'}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
