import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, RefreshCw, Repeat, PackageCheck } from 'lucide-react-native';
import { ordersApi, type OrderStatus, type OrderItem } from '../../src/api/orders';
import { formatRM } from '../../src/api/products';
import { useCartStore } from '../../src/store/cart';
import { useTheme } from '../../src/lib/theme';

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
  const { isDark } = useTheme();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.detail(id!),
    refetchInterval: 10000,
  });

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: bg }}>
        <Text style={{ color: sub }}>加载中...</Text>
      </View>
    );
  }

  const order = data?.order;
  const items: OrderItem[] = (order as { items?: OrderItem[] } | undefined)?.items ?? data?.items ?? [];

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bg }}>
        <Text style={{ color: sub }}>没找到这个订单</Text>
        <Pressable onPress={() => router.replace('/(tabs)/orders')} className="mt-4 bg-brand-500 px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold">回订单列表</Text>
        </Pressable>
      </View>
    );
  }

  const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending_payment;

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      {/* Header */}
      <View className="px-5 pt-14 pb-4 flex-row items-center" style={{ backgroundColor: isDark ? '#171717' : '#fff', borderBottomWidth: 0.5, borderBottomColor: border }}>
        <Pressable onPress={() => router.replace('/(tabs)/orders')} className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }} hitSlop={8}>
          <ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} />
        </Pressable>
        <Text style={{ color: text }} className="text-lg font-bold">订单详情</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 状态卡 */}
        <View className="mx-3 mt-3 p-5 rounded-3xl" style={{ backgroundColor: '#649b29' }}>
          <Text className="text-5xl">{status.emoji}</Text>
          <Text className="text-white text-xl font-bold mt-2">{status.label}</Text>
          <Text className="text-white/80 text-sm mt-1">{status.desc}</Text>
        </View>

        {/* 取餐码 */}
        <View className="mx-3 mt-3 p-5 rounded-3xl items-center" style={{ backgroundColor: cardBg }}>
          <Text style={{ color: sub }} className="text-xs uppercase tracking-wider">取餐码</Text>
          <Text className="text-5xl font-extrabold text-brand-600 tracking-widest mt-2">{order.pickup_code}</Text>
          <Text style={{ color: sub }} className="text-xs mt-2">到摊位报这个号码即可</Text>
        </View>

        {/* 商品 */}
        <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
          <Text style={{ color: text }} className="text-sm font-bold mb-3">商品</Text>
          {items.map((item, idx) => (
            <View key={item.id} className={`flex-row items-start ${idx > 0 ? 'mt-3 pt-3' : ''}`} style={{ borderTopWidth: idx > 0 ? 0.5 : 0, borderTopColor: border }}>
              <View className="w-12 h-12 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#1a2e14' : '#e8f5e0' }}>
                <Text className="text-xl">🥤</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: text }} className="text-sm font-semibold">{item.name_cn}</Text>
                {item.customizations && Object.keys(item.customizations).length > 0 ? (
                  <Text style={{ color: sub }} className="text-xs mt-0.5">{Object.values(item.customizations).join(' / ')}</Text>
                ) : null}
                <Text style={{ color: sub }} className="text-xs mt-1">× {item.quantity}</Text>
              </View>
              <Text style={{ color: text }} className="text-sm font-bold">{formatRM(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* 金额明细 */}
        <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
          <View className="flex-row justify-between mb-2"><Text style={{ color: sub }} className="text-sm">小计</Text><Text style={{ color: text }} className="text-sm">{formatRM(order.subtotal)}</Text></View>
          {parseFloat(order.discount_amount) > 0 ? <View className="flex-row justify-between mb-2"><Text style={{ color: sub }} className="text-sm">优惠</Text><Text className="text-sm text-brand-600">- {formatRM(order.discount_amount)}</Text></View> : null}
          {parseFloat(order.wallet_used) > 0 ? <View className="flex-row justify-between mb-2"><Text style={{ color: sub }} className="text-sm">钱包抵扣</Text><Text className="text-sm text-brand-600">- {formatRM(order.wallet_used)}</Text></View> : null}
          {order.voucher_used && parseFloat(order.voucher_discount ?? '0') > 0 ? <View className="flex-row justify-between mb-2"><Text style={{ color: isDark ? '#fbbf24' : '#b45309' }} className="text-sm">🎁 免费券抵扣</Text><Text className="text-sm font-bold text-brand-600">− {formatRM(order.voucher_discount)}</Text></View> : null}
          <View className="flex-row justify-between pt-2 mt-1" style={{ borderTopWidth: 0.5, borderTopColor: border }}><Text style={{ color: text }} className="text-sm font-bold">实付</Text><Text className="text-lg font-bold text-brand-600">{formatRM(order.total_paid)}</Text></View>
        </View>

        {order.cups_awarded > 0 ? (
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: isDark ? '#2a3320' : '#e8f5e0' }}>
            <View className="flex-row items-center mb-2"><PackageCheck size={16} color="#649b29" /><Text className="text-brand-600 text-sm font-bold ml-2">🎉 本单获得</Text></View>
            <View className="flex-row items-center justify-between"><Text style={{ color: sub }} className="text-sm">集杯换饮</Text><Text className="text-sm font-bold text-brand-600">+ {order.cups_awarded} 杯</Text></View>
            <Text style={{ color: sub }} className="text-xs mt-1">集满 10 杯免费送 1 杯</Text>
          </View>
        ) : null}

        {order.notes ? (
          <View className="mx-3 mt-3 p-4 rounded-2xl" style={{ backgroundColor: cardBg }}>
            <Text style={{ color: sub }} className="text-xs mb-1">备注</Text>
            <Text style={{ color: text }} className="text-sm">{order.notes}</Text>
          </View>
        ) : null}

        <View className="mx-3 mt-6" style={{ gap: 8 }}>
          <Pressable
            onPress={async () => {
              if (!items.length) return;
              const cart = useCartStore.getState();
              await cart.clear();
              for (const it of items) {
                const opts = (it.customizations && Object.keys(it.customizations).length > 0) ? it.customizations : {};
                const optsLabel = Object.values(opts).join(' / ');
                const cartId = `${it.product_id}__${Object.values(opts).join('_')}__repeat`;
                await cart.add({ cart_id: cartId, product_id: it.product_id as any, product_name: it.name_cn, unit_price: parseFloat(it.unit_price), quantity: it.quantity, options: opts as any, options_label: optsLabel, image_url: it.image_url ?? undefined });
              }
              Alert.alert('✅ 已复制到购物车', `${items.length} 件商品已加入。直接去结算？`, [
                { text: '继续逛', style: 'cancel' },
                { text: '去结算', onPress: () => router.replace('/checkout') },
              ]);
            }}
            className="rounded-2xl py-4 items-center flex-row justify-center"
            style={{ backgroundColor: isDark ? '#262626' : '#fff' }}
          >
            <Repeat size={18} color="#649b29" />
            <Text className="text-brand-600 font-bold text-base ml-2">再来一单</Text>
          </Pressable>
          <Pressable
            onPress={() => refetch()}
            className="rounded-2xl py-3 items-center flex-row justify-center"
            style={{ backgroundColor: isDark ? '#262626' : '#fff' }}
          >
            <RefreshCw size={16} color={isDark ? '#a3a3a3' : '#737373'} />
            <Text style={{ color: sub }} className="text-sm font-semibold ml-2">{isRefetching ? '刷新中...' : '刷新状态'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
