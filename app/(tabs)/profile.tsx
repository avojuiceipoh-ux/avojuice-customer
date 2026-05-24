import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, ChevronRight, Crown, Wallet, Ticket,
  Settings, Phone, Camera, DollarSign,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/lib/theme';

export default function ProfileScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const transGreen = isDark ? 'rgba(42,51,32,0.85)' : 'rgba(232,245,224,0.85)';
  const transGreenText = isDark ? '#a8d88a' : '#3d6b1e';

  const userName = 'Andrew Heng';
  const phoneNum = '012-345 6789';
  const avatarUrl = null;
  const points = 13;
  const walletBalance = 15.50;
  const voucherCount = 3;
  const cashbackAmount = 5.20;

  // 会员等级系统 — 四级：爱·初芽 → 我·成长 → 果·绽放 → 饮·圆满
  // 颜色与 membership 页面统一
  const tiers = [
    { min: 0,   name: '爱·初芽', color: '#a8d88a', bgColor: '#3d6b1e', icon: '🌱' },
    { min: 15,  name: '我·成长', color: '#649b29', bgColor: '#2d4a0e', icon: '🥑' },
    { min: 90,  name: '果·绽放', color: '#f59e0b', bgColor: '#78350f', icon: '🌟' },
    { min: 300, name: '饮·圆满', color: '#f0c040', bgColor: '#3d2600', icon: '👑' },
  ];
  const currentTier = [...tiers].reverse().find(t => points >= t.min) || tiers[0];
  const nextTierIdx = tiers.indexOf(currentTier) + 1;
  const nextTierInfo = tiers[nextTierIdx] || null;
  const tierName = currentTier.name;
  const tierColor = currentTier.color;
  const tierIcon = currentTier.icon;
  const nextTier = nextTierInfo?.min ?? currentTier.min;
  const pointsToNext = nextTierInfo ? nextTier - points : 0;

  // 海报轮播
  const screenW = Dimensions.get('window').width;
  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerW = Math.min(screenW * 0.85, 400);
  const bannerH = Math.round(bannerW * 100 / 330);
  const bannerGap = 10;
  const bannerSnap = bannerW + bannerGap;
  const sidePad = (screenW - bannerW) / 2;
  const banners = [
    { emoji: '🥑', title: '牛油果季特惠', desc: '全系列牛油果 RM2 OFF', color: '#649b29' },
    { emoji: '🎓', title: '学生专享', desc: '凭学生证享 9 折优惠', color: isDark ? '#4ade80' : '#16a34a' },
    { emoji: '🎉', title: '新品上市', desc: '火龙果椰奶冰沙尝鲜价', color: isDark ? '#f87171' : '#dc2626' },
  ];

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setBannerIdx(Math.round(e.nativeEvent.contentOffset.x / bannerSnap));
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      {/* Header */}
      <View className="px-5 pt-3 pb-2 flex-row items-center justify-between">
        <Text style={{ color: text }} className="text-2xl font-bold">我的</Text>
        <Pressable className="w-10 h-10 rounded-full items-center justify-center relative" style={{ backgroundColor: cardBg }}>
          <Bell size={22} color={isDark ? '#d4d4d4' : '#525252'} />
          <View className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2" style={{ borderColor: isDark ? '#262626' : '#fff' }} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* 头像 + 名字 */}
        <View className="px-5 mt-2 flex-row items-center">
          <Pressable className="relative">
            <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#2a3320' : '#e8f5e0' }}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-16 h-16 rounded-full" resizeMode="cover" />
              ) : (
                <Crown size={28} color="#649b29" />
              )}
            </View>
            <View className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: '#649b29', borderWidth: 2, borderColor: bg }}>
              <Camera size={12} color="#fff" />
            </View>
          </Pressable>
          <Pressable className="ml-3 flex-1" onPress={() => router.push('/personal' as any)}>
            <Text style={{ color: text }} className="text-lg font-bold">{userName}</Text>
            <View className="flex-row items-center mt-0.5">
              <Phone size={13} color={sub} />
              <Text style={{ color: sub }} className="text-sm ml-1">{phoneNum}</Text>
            </View>
          </Pressable>
        </View>

        {/* 会员等级卡 */}
        <View className="px-5 mt-4">
          <Pressable
            className="rounded-2xl p-4"
            style={{ backgroundColor: currentTier.color }}
            onPress={() => router.push('/membership' as any)}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-2">
                  <Text className="text-base">{tierIcon}</Text>
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">{tierName}</Text>
                  {pointsToNext > 0 ? (
                    <Text className="text-white/60 text-xs">再集 {pointsToNext} 积分升级</Text>
                  ) : (
                    <Text className="text-white/60 text-xs">已达最高等级 🎉</Text>
                  )}
                </View>
              </View>
              <View className="flex-row items-center bg-white/15 rounded-full px-3 py-1">
                <Text className="text-white text-xs font-semibold">查看权益</Text>
                <ChevronRight size={14} color="#fff" style={{ marginLeft: 2 }} />
              </View>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-white text-4xl font-extrabold">{points}</Text>
              <Text className="text-white/60 text-sm ml-2">积分</Text>
            </View>
            <View className="mt-3">
              <View className="h-2 bg-white/20 rounded-full overflow-hidden">
                <View className="h-full bg-white rounded-full" style={{ width: `${(points / nextTier) * 100}%` }} />
              </View>
            </View>
          </Pressable>
        </View>

        {/* 钱包 + Reward + 优惠券 */}
        <View className="px-5 mt-3 flex-row" style={{ gap: 10 }}>
          <Pressable
            className="flex-1 rounded-2xl p-3 items-center"
            style={{ backgroundColor: transGreen }}
            onPress={() => router.push('/wallet' as any)}
          >
            <Wallet size={24} color={transGreenText} />
            <Text
              style={{ color: transGreenText, textAlign: 'center' }}
              className="text-[10px] font-semibold mt-1"
              numberOfLines={1}
            >钱包</Text>
            <Text style={{ color: transGreenText, textAlign: 'center' }} className="text-lg font-extrabold mt-0.5">{walletBalance.toFixed(2)}</Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-2xl p-3 items-center"
            style={{ backgroundColor: transGreen }}
            onPress={() => router.push('/reward' as any)}
          >
            <DollarSign size={24} color={transGreenText} />
            <Text
              style={{ color: transGreenText, textAlign: 'center' }}
              className="text-[10px] font-semibold mt-1"
              numberOfLines={1}
            >Reward</Text>
            <Text style={{ color: transGreenText, textAlign: 'center' }} className="text-lg font-extrabold mt-0.5">{cashbackAmount.toFixed(2)}</Text>
          </Pressable>

          <Pressable
            className="flex-1 rounded-2xl p-3 items-center"
            style={{ backgroundColor: transGreen }}
            onPress={() => router.push('/vouchers' as any)}
          >
            <Ticket size={24} color={transGreenText} />
            <Text
              style={{ color: transGreenText, textAlign: 'center' }}
              className="text-[10px] font-semibold mt-1"
              numberOfLines={1}
            >优惠券</Text>
            <Text style={{ color: transGreenText, textAlign: 'center' }} className="text-lg font-extrabold mt-0.5">{voucherCount}</Text>
          </Pressable>
        </View>

        {/* 海报 */}
        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={bannerSnap}
            snapToAlignment="center"
            onMomentumScrollEnd={onBannerScroll}
            contentContainerStyle={{ paddingHorizontal: sidePad, gap: bannerGap }}
          >
            {banners.map((item, i) => (
              <Pressable key={i}>
                {({ pressed }) => (
                  <View
                    className="rounded-2xl px-5 flex-row items-center"
                    style={{
                      width: bannerW,
                      height: bannerH,
                      backgroundColor: item.color,
                      shadowColor: item.color,
                      shadowOpacity: 0.3,
                      shadowRadius: 10,
                      shadowOffset: { width: 0, height: 4 },
                      opacity: pressed ? 0.7 : 1,
                    }}
                  >
                    <Text className="text-4xl mr-4">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-white text-lg font-bold">{item.title}</Text>
                      <Text className="text-white/80 text-sm mt-0.5">{item.desc}</Text>
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>

          <View className="flex-row justify-center mt-3" style={{ gap: 6 }}>
            {banners.map((_, i) => (
              <View
                key={i}
                className="rounded-full"
                style={{
                  width: i === bannerIdx ? 18 : 6,
                  height: 6,
                  backgroundColor: i === bannerIdx ? '#649b29' : (isDark ? '#525252' : '#d4d4d4'),
                }}
              />
            ))}
          </View>
        </View>

        {/* 设置 */}
        <View className="px-5 mt-5">
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg }}>
            <Pressable
              className="flex-row items-center px-4 py-4"
              onPress={() => router.push('/settings' as any)}
            >
              <Settings size={20} color={isDark ? '#a3a3a3' : '#525252'} />
              <Text style={{ color: text }} className="flex-1 ml-3 font-semibold text-sm">设置</Text>
              <ChevronRight size={16} color={isDark ? '#525252' : '#d4d4d4'} />
            </Pressable>
          </View>
        </View>

        <Text style={{ color: sub }} className="text-center text-xs mt-6">
          爱我果饮 · 本真之味 · 果中显
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
