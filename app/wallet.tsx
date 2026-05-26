import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, ArrowUpRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../src/lib/theme';
import { walletApi, type WalletTransaction } from '../src/api/wallet';
import { useAuthStore } from '../src/store/auth';

/** 钱包 — 余额 + 交易记录（充值待定，V0 不开） */
export default function WalletScreen() {
  const { isDark } = useTheme();
  const isAuthed = !!useAuthStore((s) => s.token);

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get(),
    enabled: isAuthed,
  });

  const balance = parseFloat(String(data?.wallet?.balance ?? 0));
  const transactions = data?.transactions ?? [];

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      {/* ── Header ── */}
      <View className="px-5 pt-3 pb-3 flex-row items-center">
        <Pressable
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: cardBg }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={text} />
        </Pressable>
        <Text style={{ color: text }} className="text-2xl font-bold">钱包</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={brandGreen} />
        }
      >
        {/* ── 余额卡片 ── */}
        <View className="px-5 mt-2">
          <View
            className="rounded-2xl p-6 items-center"
            style={{
              backgroundColor: brandGreen,
              shadowColor: brandGreen,
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            <Text className="text-white/70 text-sm font-semibold">Wallet Balance</Text>
            <Text className="text-white text-5xl font-extrabold mt-2">
              RM {balance.toFixed(2)}
            </Text>
            <Text className="text-white/80 text-xs mt-2">
              邀请好友消费返现 5% · 月上限 RM 30
            </Text>
          </View>
        </View>

        {/* ── 交易记录 ── */}
        <View className="px-5 mt-6 pb-6">
          <Text style={{ color: text }} className="text-lg font-bold mb-3">
            Transaction History
          </Text>

          {!isAuthed ? (
            <View className="items-center py-10">
              <Text style={{ color: sub }} className="text-sm">
                登录后查看交易记录
              </Text>
            </View>
          ) : isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color={brandGreen} />
            </View>
          ) : transactions.length === 0 ? (
            <View className="items-center py-10">
              <Text style={{ color: sub }} className="text-sm">
                还没有交易记录
              </Text>
              <Text style={{ color: sub }} className="text-xs mt-1">
                邀请好友消费就有返现
              </Text>
            </View>
          ) : (
            transactions.map((tx, idx) => (
              <TransactionRow
                key={`${tx.created_at}-${idx}`}
                tx={tx}
                isDark={isDark}
                text={text}
                sub={sub}
                border={border}
                brandGreen={brandGreen}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── 充值按钮 — V0 不开放（推荐返现自动入账） ── */}
      <View className="px-5 py-4" style={{ borderTopWidth: 1, borderTopColor: border }}>
        <Pressable
          onPress={() =>
            Alert.alert(
              '充值功能',
              'V1 阶段钱包余额由邀请好友消费的 5% 返现产生，暂不支持充值。\n\nTouch ’n Go / FPX 充值在商户审核中。',
              [{ text: '好' }],
            )
          }
        >
          {({ pressed }) => (
            <View
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: brandGreen,
                shadowColor: brandGreen,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                opacity: pressed ? 0.7 : 0.55, // 全程半透明提示"暂未开放"
              }}
            >
              <Text className="text-white text-base font-bold">
                Top Up（敬请期待）
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── 交易记录行 ───────────────────────────────────────
function TransactionRow({
  tx,
  isDark,
  text,
  sub,
  border,
  brandGreen,
}: {
  tx: WalletTransaction;
  isDark: boolean;
  text: string;
  sub: string;
  border: string;
  brandGreen: string;
}) {
  const isCredit = tx.type === 'credit'; // credit = 入账（"topup" 视觉），debit = 消费（"spend" 视觉）
  const amount = parseFloat(tx.amount);
  const dt = new Date(tx.created_at);
  const dateStr = `${dt.getMonth() + 1}/${dt.getDate()} ${
    ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dt.getDay()]
  }`;
  const timeStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  const desc = tx.description || sourceLabel(tx.source_type);

  return (
    <View
      className="flex-row items-center py-3 border-b"
      style={{ borderBottomColor: border }}
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center mr-3"
        style={{
          backgroundColor: isCredit
            ? (isDark ? 'rgba(100,155,41,0.3)' : 'rgba(100,155,41,0.1)')
            : (isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.08)'),
        }}
      >
        {isCredit ? (
          <Plus size={16} color={brandGreen} />
        ) : (
          <ArrowUpRight size={16} color="#dc2626" />
        )}
      </View>

      <View className="flex-1">
        <Text style={{ color: text }} className="font-semibold text-sm">
          {desc}
        </Text>
        <Text style={{ color: sub }} className="text-xs mt-0.5">
          {dateStr} · {timeStr}
        </Text>
      </View>

      <Text
        className="font-bold text-sm"
        style={{ color: isCredit ? brandGreen : '#dc2626' }}
      >
        {isCredit ? '+' : '-'} RM {amount.toFixed(2)}
      </Text>
    </View>
  );
}

function sourceLabel(source: string): string {
  return (
    {
      order_cashback:    '订单返现',
      order_deduction:   '订单抵扣',
      referral_cashback: '推荐返现',
      referral_bonus:    '推荐奖励',
      manual_credit:     '系统赠送',
      manual_debit:      '系统扣减',
    }[source] ?? source
  );
}
