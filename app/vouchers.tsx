import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Ticket, Clock, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../src/lib/theme';
import { vouchersApi, type Voucher } from '../src/api/vouchers';
import { useAuthStore } from '../src/store/auth';

/** 免费饮品券页面 — 接入真实数据 */
export default function VouchersScreen() {
  const { isDark } = useTheme();
  const isAuthed = !!useAuthStore((s) => s.token);

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['vouchers'],
    queryFn: () => vouchersApi.list(),
    enabled: isAuthed,
  });

  const available = data?.available ?? [];
  const redeemed = data?.redeemed ?? [];
  const expired = data?.expired ?? [];
  const history = [...redeemed, ...expired];

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
        <Text style={{ color: text }} className="text-2xl font-bold">优惠券</Text>
        <View className="flex-1" />
        <Text style={{ color: brandGreen }} className="text-sm font-semibold">
          {available.length} 张可用
        </Text>
      </View>

      {!isAuthed ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ color: sub }} className="text-sm">登录查看优惠券</Text>
          <Pressable
            onPress={() => router.push('/auth/login')}
            className="mt-4 bg-brand-500 px-8 py-2.5 rounded-2xl"
          >
            <Text className="text-white font-bold">立即登录</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={brandGreen} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={brandGreen} />
          }
        >
          {/* ── 可用券 ── */}
          {available.length > 0 ? (
            <>
              <Text
                style={{ color: sub }}
                className="text-xs font-semibold mt-2 mb-3 uppercase tracking-wide"
              >
                可使用
              </Text>
              {available.map((v) => (
                <AvailableCard
                  key={v.id}
                  voucher={v}
                  cardBg={cardBg}
                  text={text}
                  sub={sub}
                  isDark={isDark}
                  brandGreen={brandGreen}
                  onUse={() => router.push('/(tabs)/menu')}
                />
              ))}
            </>
          ) : (
            <View className="items-center py-12">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: isDark ? '#262626' : '#e8f5e0' }}
              >
                <Ticket size={28} color="#a3a3a3" />
              </View>
              <Text style={{ color: text }} className="font-bold">还没有免费券</Text>
              <Text style={{ color: sub }} className="text-xs mt-1 text-center">
                集满 10 杯送 1 张免费券（抵 RM 8）
              </Text>
            </View>
          )}

          {/* ── 已使用 / 已过期 ── */}
          {history.length > 0 ? (
            <>
              <Text
                style={{ color: sub }}
                className="text-xs font-semibold mt-6 mb-3 uppercase tracking-wide"
              >
                已使用 / 已过期
              </Text>
              {history.map((v) => (
                <HistoryCard
                  key={v.id}
                  voucher={v}
                  cardBg={cardBg}
                  text={text}
                  sub={sub}
                  isDark={isDark}
                />
              ))}
            </>
          ) : null}

          <View className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// ─── 可用券卡片 ───────────────────────────────────────
function AvailableCard({
  voucher,
  cardBg,
  text,
  sub,
  isDark,
  brandGreen,
  onUse,
}: {
  voucher: Voucher;
  cardBg: string;
  text: string;
  sub: string;
  isDark: boolean;
  brandGreen: string;
  onUse: () => void;
}) {
  const expDate = new Date(voucher.expires_at);
  const expStr = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;
  const maxValue = parseFloat(voucher.max_value).toFixed(0);
  const daysLeft = Math.max(0, voucher.days_left);
  const expSoon = daysLeft <= 3;

  return (
    <Pressable
      className="rounded-xl mb-2.5 flex-row overflow-hidden"
      style={{
        backgroundColor: cardBg,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View className="w-2" style={{ backgroundColor: brandGreen }} />
      <View className="flex-1 p-4 flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)',
          }}
        >
          <Ticket size={18} color={brandGreen} />
        </View>
        <View className="flex-1">
          <Text style={{ color: text }} className="font-bold text-sm">
            免费饮品券 · 抵 RM {maxValue}
          </Text>
          <Text style={{ color: sub }} className="text-xs mt-0.5">
            集 10 杯送 1 杯 · 超出补差价
          </Text>
          <View className="flex-row items-center mt-1.5">
            <Clock size={12} color={expSoon ? '#dc2626' : sub} />
            <Text
              style={{ color: expSoon ? '#dc2626' : sub }}
              className="text-xs ml-1"
            >
              {expSoon ? `${daysLeft} 天后过期` : `有效期至 ${expStr}`}
            </Text>
          </View>
        </View>
        <Pressable onPress={onUse} className="bg-brand-500 px-3 py-1.5 rounded-full">
          <Text className="text-white text-xs font-bold">去使用</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

// ─── 历史券卡片 ───────────────────────────────────────
function HistoryCard({
  voucher,
  cardBg,
  text,
  sub,
  isDark,
}: {
  voucher: Voucher;
  cardBg: string;
  text: string;
  sub: string;
  isDark: boolean;
}) {
  const expDate = new Date(voucher.expires_at);
  const expStr = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}-${String(expDate.getDate()).padStart(2, '0')}`;
  const maxValue = parseFloat(voucher.max_value).toFixed(0);
  const usedLabel = voucher.effective_status === 'redeemed' ? '已使用' : '已过期';

  return (
    <View
      className="rounded-xl mb-2.5 flex-row overflow-hidden"
      style={{ backgroundColor: cardBg, opacity: 0.5 }}
    >
      <View className="w-2" style={{ backgroundColor: '#a3a3a3' }} />
      <View className="flex-1 p-4 flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: isDark ? 'rgba(115,115,115,0.15)' : '#f5f5f5',
          }}
        >
          <CheckCircle2 size={18} color="#a3a3a3" />
        </View>
        <View className="flex-1">
          <Text style={{ color: text }} className="font-bold text-sm">
            免费饮品券 · 抵 RM {maxValue}
          </Text>
          <Text style={{ color: sub }} className="text-xs mt-0.5">
            集 10 杯送 1 杯
          </Text>
          <View className="flex-row items-center mt-1.5">
            <Clock size={12} color={sub} />
            <Text style={{ color: sub }} className="text-xs ml-1">
              有效期至 {expStr}
            </Text>
          </View>
        </View>
        <Text style={{ color: sub }} className="text-xs font-semibold">{usedLabel}</Text>
      </View>
    </View>
  );
}
