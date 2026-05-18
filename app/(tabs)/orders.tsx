import { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { ordersApi, type OrderSummary, type OrderStatus } from '../../src/api/orders';
import { formatRM } from '../../src/api/products';
import { useAuthStore } from '../../src/store/auth';

type Tab = 'active' | 'history';

const ACTIVE_STATUSES: OrderStatus[] = ['pending_payment', 'paid', 'preparing', 'ready'];

const STATUS_STYLE: Record<OrderStatus, { label: string; color: string; emoji: string }> = {
  pending_payment: { label: '待支付', color: 'text-amber-600 bg-amber-50',  emoji: '⏳' },
  paid:            { label: '已支付', color: 'text-blue-600 bg-blue-50',    emoji: '💚' },
  preparing:       { label: '制作中', color: 'text-purple-600 bg-purple-50', emoji: '👨‍🍳' },
  ready:           { label: '可取餐', color: 'text-brand-700 bg-brand-50 font-bold', emoji: '🎉' },
  completed:       { label: '已完成', color: 'text-ink-500 bg-ink-100',      emoji: '✅' },
  cancelled:       { label: '已取消', color: 'text-ink-400 bg-ink-100',      emoji: '❌' },
};

export default function OrdersScreen() {
  const [tab, setTab] = useState<Tab>('active');
  const isAuthed = !!useAuthStore((s) => s.token);

  // 进行中订单短轮询（10 秒）；历史订单不轮询
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list({ limit: 50 }),
    enabled: isAuthed,
    refetchInterval: tab === 'active' ? 10000 : false,
  });

  const orders = data?.orders ?? [];

  const filtered = useMemo(() => {
    return orders.filter((o) =>
      tab === 'active'
        ? ACTIVE_STATUSES.includes(o.status)
        : !ACTIVE_STATUSES.includes(o.status),
    );
  }, [orders, tab]);

  // 未登录态
  if (!isAuthed) {
    return (
      <Screen bg="bg-ink-50">
        <View className="px-5 pt-2 pb-4 bg-white">
          <Text className="text-2xl font-bold text-ink-900">订单</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🔒</Text>
          <Text className="text-ink-700 font-semibold">登录后查看订单</Text>
          <Text className="text-ink-500 text-sm mt-1">手机号 + OTP 一键登录</Text>
          <View className="mt-6 w-48">
            <Button fullWidth onPress={() => router.push('/auth/login')}>
              立即登录
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-3 bg-white">
        <Text className="text-2xl font-bold text-ink-900">订单</Text>
      </View>

      {/* Tab 切换 */}
      <View className="flex-row bg-white px-5 pb-3 border-b border-ink-100">
        {(['active', 'history'] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              className="mr-6"
              hitSlop={4}
            >
              <Text
                className={`text-base ${
                  active ? 'text-brand-600 font-bold' : 'text-ink-500'
                }`}
              >
                {t === 'active' ? '进行中' : '历史订单'}
              </Text>
              {active && <View className="h-0.5 mt-1 bg-brand-500 rounded-full" />}
            </Pressable>
          );
        })}
      </View>

      {/* 列表 */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#52c41a" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#52c41a" />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-24">
              <Text className="text-5xl mb-3">{tab === 'active' ? '🛒' : '📋'}</Text>
              <Text className="text-ink-500">
                {tab === 'active' ? '暂无进行中订单' : '没有历史订单'}
              </Text>
              {tab === 'active' && (
                <View className="mt-6 w-48">
                  <Button
                    variant="secondary"
                    fullWidth
                    onPress={() => router.replace('/(tabs)/menu')}
                  >
                    去点单
                  </Button>
                </View>
              )}
            </View>
          }
        />
      )}
    </Screen>
  );
}

// ─── 订单卡片 ─────────────────────────────────────────
function OrderCard({ order }: { order: OrderSummary }) {
  const style = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending_payment;
  const isReady = order.status === 'ready';

  return (
    <Pressable
      onPress={() => router.push(`/order/${order.id}`)}
      className={`mb-3 p-4 bg-white rounded-2xl active:bg-ink-50 ${
        isReady ? 'border-2 border-brand-500' : ''
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className={`px-2.5 py-1 rounded-full ${style.color}`}>
          <Text className={`text-xs ${style.color}`}>
            {style.emoji} {style.label}
          </Text>
        </View>
        <Text className="text-xs text-ink-400">
          {new Date(order.created_at).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View className="mt-3 flex-row items-end justify-between">
        <View className="flex-1">
          <Text className="text-xs text-ink-500">取餐码</Text>
          <Text className="text-2xl font-bold text-brand-600 tracking-wider mt-0.5">
            {order.pickup_code}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-ink-500">{order.item_count} 杯</Text>
          <Text className="text-lg font-bold text-ink-900 mt-0.5">
            {formatRM(order.total_paid)}
          </Text>
        </View>
      </View>

      {isReady && (
        <View className="mt-3 pt-3 border-t border-brand-100">
          <Text className="text-xs text-brand-700 font-semibold">
            🎉 可以取餐了！到摊位报取餐码即可
          </Text>
        </View>
      )}
    </Pressable>
  );
}
