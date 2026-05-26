import { View, Text, ScrollView, Pressable, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Crown, CupSoda, Check, Star } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../src/lib/theme';
import { useAuthStore } from '../src/store/auth';
import { walletApi } from '../src/api/wallet';

/** 会员等级 — 4 级横滑 */
const TIERS = [
  {
    name: '爱·初芽',
    emoji: '🌱',
    points: '0 - 14',
    min: 0,
    color: '#a8d88a',
    bgColor: '#3d6b1e',
    desc: '初来乍到，每一杯都是新的开始',
    tagline: '初次接触，像嫩芽破土',
    featured: [],
    regular: ['消费积杯累计', '生日当月赠饮一杯', '新品优先通知'],
  },
  {
    name: '我·成长',
    emoji: '🥑',
    points: '15 - 89',
    min: 15,
    color: '#649b29',
    bgColor: '#2d4a0e',
    desc: '慢慢了解我们，你已经是熟客了',
    tagline: '逐渐熟悉，与我成长',
    featured: ['共享股东分红 5%', '每周五双倍积分'],
    regular: ['消费积杯累计', '生日当月赠饮一杯', '新品优先通知'],
    isCurrent: true,
  },
  {
    name: '果·绽放',
    emoji: '🌟',
    points: '90 - 299',
    min: 90,
    color: '#f59e0b',
    bgColor: '#78350f',
    desc: '你是我们的超级粉丝，值得特别对待',
    tagline: '果实成熟，品味本真',
    featured: ['共享股东分红 5%', '每周五双倍积分', '额外优惠卷 × 2/月'],
    regular: ['消费积杯累计', '生日当月赠饮一杯', '新品优先通知'],
  },
  {
    name: '饮·圆满',
    emoji: '👑',
    points: '300+',
    min: 300,
    color: '#f0c040',
    bgColor: '#3d2600',
    desc: '你是 AVO Juice 最重要的人',
    tagline: '一杯好饮，圆满体验',
    featured: ['共享股东分红 10%', '每周五双倍积分', '额外优惠卷 × 2/月', '优先取餐通道', '新品试饮邀请'],
    regular: ['消费积杯累计', '生日当月赠饮一杯', '新品优先通知'],
  },
];

export default function MembershipScreen() {
  const { isDark } = useTheme();
  const user = useAuthStore(s => s.user);
  const isAuthed = !!useAuthStore(s => s.token);

  // 用 useQuery 共享 cache：从 home / wallet 进来如果已经拉过，立即就有数据，不再闪到 tier 1
  const { data: walletData, isLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: () => walletApi.get(),
    enabled: isAuthed,
  });

  // 数据"已知" = 已经从后端拿到了；未知时不渲染 My Tier 角标，避免误导
  const isLoaded = !!walletData;
  const currentCups = walletData?.cups_total ?? 0;

  // 计算当前等级
  const currentTier = [...TIERS].reverse().find(t => currentCups >= t.min) || TIERS[0];
  const currentTierIdx = TIERS.indexOf(currentTier);
  const nextTierIdx = currentTierIdx + 1;
  const nextTier = TIERS[nextTierIdx] || null;
  const cupsToNext = nextTier ? nextTier.min - currentCups : 0;

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';

  const screenW = Dimensions.get('window').width;
  const scrollRef = useRef<ScrollView>(null);
  const [active, setActive] = useState(currentTierIdx); // 初始默认用 currentTierIdx（未登录时 = 0）

  // 数据加载完成后，自动滚到用户当前等级的卡片
  useEffect(() => {
    if (isLoaded && scrollRef.current) {
      scrollRef.current.scrollTo({ x: currentTierIdx * screenW, animated: true });
      setActive(currentTierIdx);
    }
  }, [isLoaded, currentTierIdx, screenW]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / screenW);
    setActive(idx);
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
        <Text style={{ color: text }} className="text-2xl font-bold">会员等级</Text>
      </View>

      {/* 当前杯数提示 — 加载完才显具体数字，避免闪烁 */}
      <View className="px-5 mb-3">
        <View
          className="rounded-xl px-4 py-2.5 flex-row items-center"
          style={{ backgroundColor: isDark ? 'rgba(100,155,41,0.15)' : 'rgba(100,155,41,0.08)' }}
        >
          <CupSoda size={16} color="#649b29" />
          <Text style={{ color: '#649b29' }} className="text-sm font-semibold ml-2">
            {!isAuthed
              ? '登录查看你的等级'
              : !isLoaded
              ? '加载中...'
              : `当前杯数：${currentCups} · ${
                  cupsToNext > 0
                    ? `再集 ${cupsToNext} 杯升级「${nextTier?.name}」`
                    : '已达最高等级 🎉'
                }`}
          </Text>
        </View>
      </View>

      {/* 四级横滑 */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        className="flex-1"
      >
        {TIERS.map((tier, i) => (
          <View key={i} style={{ width: screenW }} className="px-5 pb-8">
            {/* 卡片 */}
            <View
              className="rounded-3xl p-6 flex-1"
              style={{
                backgroundColor: tier.bgColor,
                shadowColor: tier.color,
                shadowOpacity: 0.4,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 8 },
                minHeight: 500,
                overflow: 'visible',
              }}
            >
              {/* My Tier 角标 — 仅在数据加载完成后显示，避免误贴到 tier 1 */}
              {isLoaded && tier.name === currentTier.name && (
                <View
                  className="absolute top-4 left-4 rounded-full px-3 py-0.5 flex-row items-center"
                  style={{ backgroundColor: tier.color }}
                >
                  <Crown size={12} color="#fff" />
                  <Text className="text-white text-xs font-bold ml-1">My Tier</Text>
                </View>
              )}

              {/* Emoji + 等级名 */}
              <View className="items-center mt-2">
                <Text className="text-4xl mt-2">{tier.emoji}</Text>
                <Text className="text-white text-3xl font-bold mt-4">{tier.name}</Text>
                <View
                  className="rounded-full px-4 py-1 mt-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <Text className="text-white/70 text-sm">{tier.points} 杯</Text>
                </View>
              </View>

              {/* 专属短句 */}
              <Text className="text-white/60 text-center text-sm leading-relaxed mt-5">
                {tier.tagline}
              </Text>

              {/* 描述 */}
              <Text className="text-white/40 text-center text-sm mt-1 leading-relaxed">
                {tier.desc}
              </Text>

              {/* 分割线 */}
              <View className="h-px mt-6 mb-5" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />

              {/* 权益列表 */}
              <Text className="text-white/70 text-xs font-semibold mb-3 uppercase tracking-wider">
                等级权益
              </Text>
              {/* 亮点权益 — 荧光色 + 置顶 */}
              {tier.featured.map((benefit, j) => (
                <View key={`f-${j}`} className="flex-row items-center mb-3">
                  <Star size={16} color={tier.color} fill={tier.color} />
                  <Text style={{ color: tier.color }} className="text-sm font-bold ml-2.5">
                    {benefit}
                  </Text>
                </View>
              ))}
              {/* 基础权益 */}
              {tier.regular.map((benefit, j) => (
                <View key={`r-${j}`} className="flex-row items-center mb-3">
                  <Check size={16} color={tier.color} />
                  <Text className="text-white/70 text-sm ml-2.5">{benefit}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 页码点 */}
      <View className="flex-row justify-center pb-4" style={{ gap: 8 }}>
        {TIERS.map((_, i) => (
          <View
            key={i}
            className="rounded-full"
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              backgroundColor: i === active ? TIERS[i].color : (isDark ? '#525252' : '#d4d4d4'),
            }}
          />
        ))}
      </View>

      {/* 底部提示 */}
      <View className="px-5 pb-6">
        <Text style={{ color: sub }} className="text-center text-xs">
          左右滑动查看四个会员等级
        </Text>
      </View>
    </SafeAreaView>
  );
}
