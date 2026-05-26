import { View, Text, ScrollView, Pressable, Share, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, Share2, Copy } from 'lucide-react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../src/lib/theme';
import { walletApi } from '../src/api/wallet';
import { useAuthStore } from '../src/store/auth';

/** Referral Reward 页面 — 接入 wallet.total_earned 作为推荐总奖励 */
export default function RewardScreen() {
  const { isDark } = useTheme();
  const isAuthed = !!useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const brandGreen = '#649b29';

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get(),
    enabled: isAuthed,
  });

  const totalReward = parseFloat(String(data?.wallet?.total_earned ?? 0));
  const monthlyRemaining = data?.monthly_remaining ?? 30;
  const referralCode = user?.referral_code ?? '';

  // 从交易记录里筛"推荐返现"作为最近返现历史（每条 = 一笔被推荐人消费返现）
  const cashbackHistory = (data?.transactions ?? []).filter(
    (tx) => tx.type === 'credit' && tx.source_type === 'referral_cashback',
  );

  const handleShare = async () => {
    if (!referralCode) {
      Alert.alert('暂无邀请码', '请重新登录刷新');
      return;
    }
    try {
      await Share.share({
        message: `🥑 用我的推荐码 ${referralCode} 注册爱我果饮，每次消费我都拿 5% 进我钱包（你也有奖）！`,
      });
    } catch {
      // user cancelled
    }
  };

  const handleCopy = async () => {
    if (!referralCode) return;
    try {
      // @ts-ignore — 动态 import 避免没装 expo-clipboard 时崩
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(referralCode);
      Alert.alert('✅ 邀请码已复制', `${referralCode} 已复制，发给朋友吧`);
    } catch {
      Alert.alert('邀请码', referralCode);
    }
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center">
        <Pressable
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: cardBg }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={text} />
        </Pressable>
        <Text style={{ color: text }} className="text-2xl font-bold">Reward</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={brandGreen} />
        }
      >
        {/* 总奖励卡片 */}
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
            <Text className="text-white/70 text-sm font-semibold">Total Reward</Text>
            <Text className="text-white text-5xl font-extrabold mt-2">
              RM {totalReward.toFixed(2)}
            </Text>
            <View className="flex-row items-center mt-3 bg-white/15 rounded-full px-4 py-1.5">
              <Users size={14} color="#fff" />
              <Text className="text-white/80 text-xs ml-1.5">
                本月还可获 RM {monthlyRemaining.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        {/* 邀请码卡片 */}
        {referralCode ? (
          <View className="px-5 mt-4">
            <View
              className="rounded-xl p-4"
              style={{ backgroundColor: cardBg }}
            >
              <Text style={{ color: sub }} className="text-xs font-semibold uppercase tracking-wide">
                你的邀请码
              </Text>
              <View className="flex-row items-center justify-between mt-2">
                <Text style={{ color: text, letterSpacing: 2 }} className="text-2xl font-extrabold">
                  {referralCode}
                </Text>
                <Pressable
                  onPress={handleCopy}
                  className="px-3 py-1.5 rounded-full flex-row items-center"
                  style={{
                    backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)',
                  }}
                >
                  <Copy size={14} color={brandGreen} />
                  <Text style={{ color: brandGreen }} className="text-xs font-bold ml-1">
                    复制
                  </Text>
                </Pressable>
              </View>
              <Text style={{ color: sub }} className="text-xs mt-2 leading-4">
                朋友用这个码注册，每次他消费你都拿 5% 进钱包。月上限 RM 30。
              </Text>
            </View>
          </View>
        ) : null}

        {/* 分享按钮 */}
        <View className="px-5 mt-4">
          <Pressable
            className="rounded-xl py-3.5 flex-row items-center justify-center"
            style={{
              borderWidth: 1.5,
              borderColor: brandGreen,
              backgroundColor: isDark ? 'rgba(100,155,41,0.1)' : 'rgba(100,155,41,0.05)',
            }}
            onPress={handleShare}
          >
            <Share2 size={18} color={brandGreen} />
            <Text style={{ color: brandGreen }} className="text-sm font-bold ml-2">
              邀请好友赚奖励
            </Text>
          </Pressable>
        </View>

        {/* 奖励记录 */}
        <View className="px-5 mt-6 pb-6">
          <Text style={{ color: text }} className="text-lg font-bold mb-3">
            Reward History
          </Text>

          {!isAuthed ? (
            <Text style={{ color: sub }} className="text-sm text-center py-6">
              登录查看返现记录
            </Text>
          ) : isLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={brandGreen} />
            </View>
          ) : cashbackHistory.length === 0 ? (
            <View
              className="rounded-xl p-6 items-center"
              style={{ backgroundColor: cardBg }}
            >
              <Text style={{ color: text }} className="font-semibold">
                还没有返现记录
              </Text>
              <Text style={{ color: sub }} className="text-xs mt-1 text-center leading-4">
                邀请好友用你的码注册{'\n'}
                他们每次消费你都拿 5%
              </Text>
            </View>
          ) : (
            cashbackHistory.map((tx, idx) => {
              const amount = parseFloat(tx.amount);
              const dt = new Date(tx.created_at);
              const dateStr = `${dt.getMonth() + 1}/${dt.getDate()}`;
              return (
                <View
                  key={`${tx.created_at}-${idx}`}
                  className="rounded-xl p-4 mb-2.5 flex-row items-center"
                  style={{ backgroundColor: cardBg }}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)',
                    }}
                  >
                    <Users size={18} color={brandGreen} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: text }} className="font-semibold text-sm">
                      {tx.description ?? '推荐返现'}
                    </Text>
                    <Text style={{ color: sub }} className="text-xs mt-0.5">
                      {dateStr}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text style={{ color: brandGreen }} className="font-bold text-sm">
                      + RM {amount.toFixed(2)}
                    </Text>
                    <Text style={{ color: sub }} className="text-xs mt-0.5">
                      5% reward
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
