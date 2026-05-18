import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { ordersApi, type OrderStatus } from '../../src/api/orders';
import { formatRM } from '../../src/api/products';
import { useCartStore } from '../../src/store/cart';
import { Alert } from 'react-native';

const STATUS_LABELS: Record<OrderStatus, { label: string; emoji: string; desc: string }> = {
  pending_payment: { label: '待支付',  emoji: '⏳', desc: '到店时跟摊位老板说订单号' },
  paid:            { label: '已支付',  emoji: '💚', desc: '等待出餐...' },
  preparing:       { label: '制作中',  emoji: '👨‍🍳', desc: '正在为你现榨' },
  ready:           { label: '可取餐',  emoji: '🎉', desc: '到摊位报取餐码' },
  completed:       { label: '已完成',  emoji: '✅', desc: '感谢光临，期待再见！' },
  cancelled:       { label: '已取消',  emoji: '❌', desc: '订单已取消' },
};

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.detail(id!),
    refetchInterval: 10000, // 每 10 秒轮询订单状态
  });

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#52c41a" />
        </View>
      </Screen>
    );
  }

  const order = data?.order;
  const items = data?.items ?? [];
  if (!order) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-ink-700">没找到这个订单</Text>
          <View className="mt-4">
            <Button onPress={() => router.replace('/(tabs)/menu')}>回菜单</Button>
          </View>
        </View>
      </Screen>
    );
  }

  const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending_payment;

  return (
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 bg-white flex-row items-center justify-between">
        <Pressable
          onPress={() => router.replace('/(tabs)/orders')}
          className="w-9 h-9 rounded-full bg-ink-100 items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-xl text-ink-900">‹</Text>
        </Pressable>
        <Text className="text-lg font-bold text-ink-900">订单详情</Text>
        <View className="w-9" />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 状态卡 */}
        <View className="mx-3 mt-3 p-5 bg-brand-500 rounded-3xl">
          <Text className="text-5xl">{status.emoji}</Text>
          <Text className="text-white text-xl font-bold mt-2">{status.label}</Text>
          <Text className="text-white/80 text-sm mt-1">{status.desc}</Text>
        </View>

        {/* 取餐码 — 整页最重要的东西 */}
        <View className="mx-3 mt-3 p-5 bg-white rounded-3xl items-center">
          <Text className="text-xs text-ink-500 uppercase tracking-wider">取餐码</Text>
          <Text className="text-5xl font-bold text-brand-600 tracking-widest mt-2">
            {order.pickup_code}
          </Text>
          <Text className="text-xs text-ink-400 mt-2">到摊位报这个号码即可</Text>
        </View>

        {/* 商品 */}
        <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
          <Text className="text-sm font-bold text-ink-900 mb-3">商品</Text>
          {items.map((item, idx) => (
            <View
              key={item.id}
              className={`flex-row items-start ${idx > 0 ? 'mt-3 pt-3 border-t border-ink-100' : ''}`}
            >
              <View className="w-12 h-12 rounded-lg bg-brand-50 items-center justify-center mr-3">
                <Text className="text-xl">🥤</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-ink-900">{item.name_cn}</Text>
                {item.customizations && Object.keys(item.customizations).length > 0 ? (
                  <Text className="text-xs text-ink-500 mt-0.5">
                    {Object.values(item.customizations).join(' / ')}
                  </Text>
                ) : null}
                <Text className="text-xs text-ink-500 mt-1">× {item.quantity}</Text>
              </View>
              <Text className="text-sm font-bold text-ink-900">{formatRM(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* 金额明细 */}
        <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-ink-500">小计</Text>
            <Text className="text-sm text-ink-900">{formatRM(order.subtotal)}</Text>
          </View>
          {parseFloat(order.discount_amount) > 0 ? (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-ink-500">优惠</Text>
              <Text className="text-sm text-brand-600">- {formatRM(order.discount_amount)}</Text>
            </View>
          ) : null}
          {parseFloat(order.wallet_used) > 0 ? (
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-ink-500">钱包抵扣</Text>
              <Text className="text-sm text-brand-600">- {formatRM(order.wallet_used)}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between pt-2 mt-1 border-t border-ink-100">
            <Text className="text-sm font-bold text-ink-900">实付</Text>
            <Text className="text-lg font-bold text-brand-600">{formatRM(order.total_paid)}</Text>
          </View>
        </View>

        {order.notes ? (
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-xs text-ink-500 mb-1">备注</Text>
            <Text className="text-sm text-ink-900">{order.notes}</Text>
          </View>
        ) : null}

        {/* 再来一单 — 一键复制订单到购物车 */}
        <View className="mx-3 mt-6" style={{ gap: 8 }}>
          <Button
            fullWidth
            onPress={async () => {
              if (!items.length) return;
              const cart = useCartStore.getState();
              await cart.clear();
              for (const it of items) {
                const opts = (it.customizations && Object.keys(it.customizations).length > 0)
                  ? it.customizations
                  : {};
                const optsLabel = Object.values(opts).join(' / ');
                const cartId = `${it.product_id}__${Object.values(opts).join('_')}__repeat`;
                await cart.add({
                  cart_id: cartId,
                  product_id: it.product_id as any,
                  product_name: it.name_cn,
                  unit_price: parseFloat(it.unit_price),
                  quantity: it.quantity,
                  options: opts as any,
                  options_label: optsLabel,
                  image_url: it.image_url ?? undefined,
                });
              }
              Alert.alert(
                '✅ 已复制到购物车',
                `${items.length} 件商品已加入。直接去结算？`,
                [
                  { text: '继续逛', style: 'cancel' },
                  { text: '去结算', onPress: () => router.replace('/checkout') },
                ],
              );
            }}
          >
            🔁 再来一单
          </Button>
          <Button variant="secondary" fullWidth onPress={() => refetch()} loading={isRefetching}>
            刷新状态
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
