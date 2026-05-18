import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { walletApi, type WalletTransaction } from '../../src/api/wallet';
import { useAuthStore } from '../../src/store/auth';
import { formatRM, toPrice } from '../../src/api/products';

export default function WalletScreen() {
  const isAuthed = !!useAuthStore((s) => s.token);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get(),
    enabled: isAuthed,
  });

  if (!isAuthed) {
    return (
      <Screen bg="bg-ink-50">
        <View className="px-5 pt-2 pb-4 bg-white">
          <Text className="text-2xl font-bold text-ink-900">钱包 · 积分</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🔒</Text>
          <Text className="text-ink-700 font-semibold">登录查看积分钱包</Text>
          <Text className="text-ink-500 text-sm mt-1 text-center">
            消费即返现，下次抵现金{'\n'}积分越多优惠越大
          </Text>
          <View className="mt-6 w-48">
            <Button fullWidth onPress={() => router.push('/auth/login')}>
              立即登录
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const wallet = data?.wallet;
  const transactions = data?.transactions ?? [];
  const monthlyRemaining = data?.monthly_remaining ?? 30;

  return (
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-3 bg-white">
        <Text className="text-2xl font-bold text-ink-900">钱包 · 积分</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#52c41a" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#52c41a" />
          }
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* 余额卡 */}
          <View className="mx-3 mt-3 p-5 rounded-3xl bg-brand-500">
            <Text className="text-white/80 text-sm">钱包余额（可抵现）</Text>
            <Text className="text-white text-4xl font-bold mt-1">
              {formatRM(wallet?.balance)}
            </Text>

            <View className="flex-row mt-5 -mx-1">
              <Stat label="累计获得" value={formatRM(wallet?.total_earned)} />
              <Stat label="累计抵扣" value={formatRM(wallet?.total_spent)} />
              <Stat label="本月可获" value={`RM ${monthlyRemaining.toFixed(0)}`} />
            </View>
          </View>

          {/* 说明卡 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-bold text-ink-900 mb-2">💡 怎么获得余额</Text>
            <Text className="text-xs text-ink-600 leading-5">
              每消费 RM 1 返 RM 0.05（5%），自动进钱包；下次下单可抵现金。{'\n'}
              新会员消费 10 杯送一杯免费 — 现在累计 <Text className="font-bold text-brand-600">0</Text> 杯。
            </Text>
          </View>

          {/* 充值入口（V2 才接通） */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-semibold text-ink-900">余额充值</Text>
                <Text className="text-xs text-ink-500 mt-1">
                  Touch ’n Go / FPX 商户审核中
                </Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-ink-100">
                <Text className="text-xs text-ink-500">敬请期待</Text>
              </View>
            </View>
          </View>

          {/* 流水 */}
          <View className="mx-3 mt-3 p-4 bg-white rounded-2xl">
            <Text className="text-sm font-bold text-ink-900 mb-3">交易记录</Text>
            {transactions.length === 0 ? (
              <Text className="text-center text-ink-400 text-sm py-6">还没有记录</Text>
            ) : (
              transactions.map((tx, idx) => (
                <TransactionRow key={idx} tx={tx} isLast={idx === transactions.length - 1} />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

// ─── 小组件 ───────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 px-1">
      <Text className="text-white/70 text-xs">{label}</Text>
      <Text className="text-white text-base font-bold mt-0.5">{value}</Text>
    </View>
  );
}

function TransactionRow({ tx, isLast }: { tx: WalletTransaction; isLast: boolean }) {
  const isCredit = tx.type === 'credit';
  return (
    <View className={`flex-row items-center py-3 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <View
        className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
          isCredit ? 'bg-brand-50' : 'bg-ink-100'
        }`}
      >
        <Text className="text-base">{isCredit ? '➕' : '➖'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-ink-900">
          {tx.description ?? sourceLabel(tx.source_type)}
        </Text>
        <Text className="text-xs text-ink-400 mt-0.5">
          {new Date(tx.created_at).toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-bold ${isCredit ? 'text-brand-600' : 'text-ink-700'}`}
        >
          {isCredit ? '+' : '-'}
          {formatRM(tx.amount)}
        </Text>
        <Text className="text-xs text-ink-400 mt-0.5">
          余 {formatRM(tx.balance_after)}
        </Text>
      </View>
    </View>
  );
}

function sourceLabel(source: string): string {
  return (
    {
      order_cashback: '订单返现',
      order_deduction: '订单抵扣',
      manual_credit: '系统赠送',
      manual_debit: '系统扣减',
      referral_bonus: '推荐奖励',
    }[source] ?? source
  );
}
