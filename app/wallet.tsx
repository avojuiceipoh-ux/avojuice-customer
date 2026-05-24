import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Plus, ArrowUpRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';

/** 钱包 — 余额 + 交易记录 + 充值 */
export default function WalletScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  // Mock
  const balance = 15.50;

  const transactions = [
    { id: 1, type: 'topup', amount: 10.00, desc: '充值', date: '5/24 周六', time: '14:30' },
    { id: 2, type: 'spend', amount: 8.50, desc: '牛油果奶昔 × 1', date: '5/23 周五', time: '18:15' },
    { id: 3, type: 'spend', amount: 6.00, desc: '芒果椰奶冰沙 × 1', date: '5/22 周四', time: '20:00' },
    { id: 4, type: 'topup', amount: 20.00, desc: '充值', date: '5/20 周二', time: '10:45' },
    { id: 5, type: 'spend', amount: 12.00, desc: '火龙果柠檬气泡 × 2', date: '5/18 周日', time: '16:30' },
  ];

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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
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
          </View>
        </View>

        {/* ── 交易记录 ── */}
        <View className="px-5 mt-6">
          <Text style={{ color: text }} className="text-lg font-bold mb-3">
            Transaction History
          </Text>

          {transactions.map((tx) => (
            <View
              key={tx.id}
              className="flex-row items-center py-3 border-b"
              style={{ borderBottomColor: border }}
            >
              {/* 图标 */}
              <View
                className="w-9 h-9 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: tx.type === 'topup'
                    ? (isDark ? 'rgba(100,155,41,0.3)' : 'rgba(100,155,41,0.1)')
                    : (isDark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.08)'),
                }}
              >
                {tx.type === 'topup' ? (
                  <Plus size={16} color={brandGreen} />
                ) : (
                  <ArrowUpRight size={16} color="#dc2626" />
                )}
              </View>

              {/* 内容 */}
              <View className="flex-1">
                <Text style={{ color: text }} className="font-semibold text-sm">
                  {tx.desc}
                </Text>
                <Text style={{ color: sub }} className="text-xs mt-0.5">
                  {tx.date} · {tx.time}
                </Text>
              </View>

              {/* 金额 */}
              <Text
                className="font-bold text-sm"
                style={{ color: tx.type === 'topup' ? brandGreen : '#dc2626' }}
              >
                {tx.type === 'topup' ? '+' : '-'} RM {tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ── 充值按钮 — 固定在底部 ── */}
      <View className="px-5 py-4" style={{ borderTopWidth: 1, borderTopColor: border }}>
        <Pressable>
          {({ pressed }) => (
            <View
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: brandGreen,
                shadowColor: brandGreen,
                shadowOpacity: 0.3,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                opacity: pressed ? 0.7 : 1,
              }}
            >
              <Text className="text-white text-base font-bold">Top Up</Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
