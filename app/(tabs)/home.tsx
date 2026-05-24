import { useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ChevronRight, Copy, Wallet, MapPin, CupSoda } from 'lucide-react-native';
import { useTheme } from '../../src/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_WIDTH = SCREEN_WIDTH - 40; // px-5 padding × 2

/** 首页 — 新布局 */
export default function HomeScreen() {
  const { isDark } = useTheme();
  const carouselRef = useRef<ScrollView>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const cups = 24;
  const nextFreeAt = 30;
  const walletBalance = 15.50;
  const userName = 'Andrew';
  const referralCode = 'AVOJUICE88';

  // 促销海报数据
  const banners = [
    { id: '1', title: '🥑 牛油果季特惠', subtitle: '全系列 RM2 OFF', color: '#4a7c20', tag: '限时' },
    { id: '2', title: '🆕 火龙果气泡', subtitle: '新品上市 · 尝鲜价 RM5', color: '#c2415c', tag: '新品' },
    { id: '3', title: '🎓 学生专属', subtitle: '凭学生证减 RM1', color: '#2563eb', tag: '福利' },
  ];

  // 营业地点
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const locations: Record<number, string> = {
    1: '万里望新市镇',
    2: '怡保东区',
    3: '金宝夜市',
    4: '万里望新市镇',
    5: '怡保第一花园',
    6: '华城夜市',
  };
  const today = new Date().getDay();
  const todayLocation = locations[today] || '今日休息';
  const todayLabel = dayNames[today];

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    setActiveSlide(idx);
  };

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <View className="px-5 pt-3 pb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 36, height: 36, marginRight: 10 }}
              resizeMode="contain"
            />
            <View>
              <Text style={{ color: text }} className="text-lg font-bold">
                嗨，{userName} 👋
              </Text>
              <Text className="text-brand-600 text-xs font-semibold">
                金宝 UTAR 主摊位 · 营业中
              </Text>
            </View>
          </View>
        </View>

        {/* ── 钱包 + 积分 双栏 ── */}
        <View className="px-5 flex-row" style={{ gap: 10 }}>
          {/* 钱包余额 — 半透明背景 */}
          <View
            className="flex-1 rounded-2xl p-3 pb-3 relative"
            style={{
              backgroundColor: isDark ? 'rgba(38,50,20,0.7)' : 'rgba(232,245,224,0.85)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(100,155,41,0.3)' : 'rgba(100,155,41,0.25)',
            }}
          >
            {/* ➕ 按钮 — 右上角 */}
            <Pressable
              className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
              style={{ backgroundColor: isDark ? '#4a7c20' : '#649b29' }}
              onPress={() => router.push('/wallet' as any)}
            >
              <Plus size={14} color="#fff" />
            </Pressable>

            <View className="flex-row items-center">
              <Wallet size={18} color={isDark ? '#a3c97a' : '#4a7c20'} />
              <Text style={{ color: isDark ? '#a3c97a' : '#4a7c20' }} className="text-xs font-semibold ml-1.5">
                钱包余额
              </Text>
            </View>
            <View className="flex-1 items-center justify-center">
              <Text className="text-brand-600 text-3xl font-extrabold">
              RM {walletBalance.toFixed(2)}
            </Text>
            </View>
          </View>

          {/* 积杯卡 — 绿色实底 */}
          <View
            className="flex-1 rounded-2xl p-3"
            style={{
              backgroundColor: isDark ? 'rgba(42,51,32,0.85)' : 'rgba(232,245,224,0.85)',
              shadowColor: '#649b29',
              shadowOpacity: 0.15,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-between mb-1">
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,155,41,0.15)' }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{ color: isDark ? '#d4d4d4' : '#4a7c20' }}
                >
                  🥑 会员
                </Text>
              </View>
              <Text
                className="text-[10px]"
                style={{ color: isDark ? '#a3a3a3' : '#6b8f3a' }}
              >
                {nextFreeAt - cups} 杯后送一杯
              </Text>
            </View>

            <View className="flex-row items-baseline gap-1 mt-1">
              <CupSoda size={18} color={isDark ? '#a3c97a' : '#4a7c20'} />
              <Text
                className="text-3xl font-extrabold"
                style={{ color: isDark ? '#e8f5e0' : '#3d6b1e' }}
              >
                {cups}
              </Text>
            </View>
            <Text
              className="text-[10px]"
              style={{ color: isDark ? '#a3a3a3' : '#6b8f3a' }}
            >
              累计杯数
            </Text>

            {/* 进度条 */}
            <View className="mt-2">
              <View
                className="h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,155,41,0.15)' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{ backgroundColor: isDark ? '#8bc34a' : '#649b29', width: `${(cups / nextFreeAt) * 100}%` }}
                />
              </View>
              <Text
                className="text-[10px] mt-1"
                style={{ color: isDark ? '#a3a3a3' : '#6b8f3a' }}
              >
                🎁 满 {nextFreeAt} 杯送一杯
              </Text>
            </View>
          </View>
        </View>

        {/* ── 促销海报 — 大正方形可左右滑动 ── */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: text }} className="text-base font-bold">
              🔥 促销活动
            </Text>
            {/* 页码指示器 */}
            <View className="flex-row" style={{ gap: 4 }}>
              {banners.map((_, i) => (
                <View
                  key={i}
                  className="rounded-full"
                  style={{
                    width: i === activeSlide ? 16 : 6,
                    height: 6,
                    backgroundColor: i === activeSlide ? '#649b29' : (isDark ? '#404040' : '#d4d4d4'),
                  }}
                />
              ))}
            </View>
          </View>

          <ScrollView
            ref={carouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingRight: CARD_GAP }}
          >
            {banners.map((banner) => (
              <View
                key={banner.id}
                className="rounded-3xl items-center justify-center overflow-hidden"
                style={{
                  width: CARD_WIDTH,
                  height: CARD_WIDTH, // 正方形
                  marginRight: CARD_GAP,
                  backgroundColor: banner.color,
                  shadowColor: banner.color,
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 5,
                }}
              >
                {/* 标签 */}
                <View className="absolute top-4 left-4 bg-white/20 rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-bold">{banner.tag}</Text>
                </View>

                {/* 内容 */}
                <Text className="text-white text-2xl font-extrabold px-6 text-center leading-8">
                  {banner.title}
                </Text>
                <Text className="text-white/80 text-sm mt-3 px-6 text-center">
                  {banner.subtitle}
                </Text>

                {/* 底部 CTA */}
                <View className="absolute bottom-6 bg-white rounded-full px-6 py-2">
                  <Text className="font-bold text-sm" style={{ color: banner.color }}>立即查看 →</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── 推荐码 — 长方形（正方形一半高） ── */}
        <View className="px-5 mt-4">
          <View
            className="rounded-3xl p-5 flex-row items-center justify-between overflow-hidden"
            style={{
              backgroundColor: isDark ? '#262626' : '#fff',
              height: CARD_WIDTH / 2, // 正方形的一半
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            {/* 左侧装饰 — 品牌绿竖条 */}
            <View className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: '#649b29' }} />

            <View className="pl-3 flex-1">
              <Text style={{ color: text }} className="text-sm font-bold mb-1">
                邀请好友 · 双方得优惠
              </Text>
              <Text style={{ color: sub }} className="text-xs leading-4">
                分享你的推荐码，好友注册后{'\n'}你和他各得 RM3 优惠券
              </Text>

              {/* 推荐码 */}
              <View
                className="flex-row items-center mt-3 px-3 py-2 rounded-lg self-start"
                style={{
                  backgroundColor: isDark ? '#1a2e14' : '#e8f5e0',
                  borderWidth: 1,
                  borderColor: 'rgba(100,155,41,0.3)',
                  borderStyle: 'dashed',
                }}
              >
                <Text className="text-brand-600 font-bold text-base tracking-widest mr-2">
                  {referralCode}
                </Text>
                <Pressable className="w-7 h-7 rounded-full bg-brand-500 items-center justify-center">
                  <Copy size={13} color="#fff" />
                </Pressable>
              </View>
            </View>

            {/* 右侧图标 */}
            <View className="pr-2">
              <Text className="text-5xl">🎁</Text>
            </View>
          </View>
        </View>

        {/* ── 出摊信息 ── */}
        <View className="px-5 mt-4 mb-8">
          <Pressable onPress={() => router.push('/locations' as any)}>
            {({ pressed }) => (
              <View
                className="rounded-2xl p-4 flex-row items-center"
                style={{
                  backgroundColor: cardBg,
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)' }}
                >
                  <MapPin size={20} color="#649b29" />
                </View>
                <View className="flex-1">
                  <Text style={{ color: text }} className="font-bold text-sm">
                    {todayLabel} · {todayLocation}
                  </Text>
                  <Text style={{ color: sub }} className="text-xs mt-0.5">
                    周一万里望 · 周二东区 · 周三金宝 · 周四万里望 · 周五第一花园 · 周六华城
                  </Text>
                </View>
                <ChevronRight size={18} color={sub} />
              </View>
            )}
          </Pressable>
        </View>

        {/* 版本号 */}
        <View className="items-center mt-4 mb-6">
          <Text style={{ color: sub }} className="text-xs">v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
