import { View, Text, ScrollView, Pressable, Alert, Linking, Image, Share } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/auth';

const TIERS = [
  { name: '新鲜果粒', min: 0,    next: 100, emoji: '🌱' },
  { name: '鲜榨达人', min: 100,  next: 500, emoji: '🥑' },
  { name: '果饮大师', min: 500,  next: null, emoji: '👑' },
];

function getTier(spent: number) {
  let cur = TIERS[0];
  for (const t of TIERS) if (spent >= t.min) cur = t;
  return cur;
}

function shareReferral(code: string) {
  Share.share({
    message:
      `🥑 来爱我果饮喝真水果！\n用我的邀请码 ${code} 注册，你我各得 RM 5 积分。\n下载顾客 App：avojuice.com（待上架）`,
  }).catch(() => {});
}

export default function ProfileScreen() {
  const { user, signOut, token } = useAuthStore();
  const isAuthed = !!token;

  const handleSignOut = () => {
    Alert.alert('确认登出？', '登出后需要重新输入手机号', [
      { text: '取消', style: 'cancel' },
      {
        text: '登出',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  return (
    <Screen bg="bg-ink-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View className="px-5 pt-2 pb-3 bg-white">
          <Text className="text-2xl font-bold text-ink-900">我的</Text>
        </View>

        {/* 用户卡 */}
        <View className="mx-3 mt-3 p-5 rounded-3xl bg-brand-500">
          {isAuthed && user ? (
            <View className="flex-row items-center">
              <View className="w-16 h-16 rounded-full bg-white items-center justify-center mr-4 overflow-hidden">
                <Image
                  source={require('../../assets/logo.png')}
                  style={{ width: 64, height: 64 }}
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">
                  {user.nickname || '果饮粉丝'}
                </Text>
                <Text className="text-sm text-white/80 mt-1">{user.phone}</Text>
                {user.referral_code ? (
                  <View className="flex-row items-center mt-2">
                    <View className="px-2 py-0.5 rounded-full bg-white/20">
                      <Text className="text-xs text-white">
                        邀请码: {user.referral_code}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-bold text-white">未登录</Text>
              <Text className="text-sm text-white/80 mt-1">登录后可下单、累积积分、看历史</Text>
              <View className="mt-4">
                <Pressable
                  onPress={() => router.push('/auth/login')}
                  className="bg-white rounded-full px-5 py-2 self-start"
                >
                  <Text className="text-brand-600 font-bold text-sm">立即登录</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* 常用入口（已登录才显示） */}
        {isAuthed && (
          <View className="mx-3 mt-3 bg-white rounded-2xl overflow-hidden">
            <Row
              icon="📋"
              label="我的订单"
              onPress={() => router.push('/(tabs)/orders')}
            />
            <Divider />
            <Row
              icon="💚"
              label="钱包 · 积分"
              onPress={() => router.push('/(tabs)/wallet')}
            />
            <Divider />
            <Row
              icon="🎁"
              label="优惠券"
              subtitle="V2 上线"
              disabled
            />
            <Divider />
            <Row
              icon="👥"
              label="邀请好友"
              subtitle="送 TA RM 5，自己也得 RM 5"
              onPress={() => {
                if (user?.referral_code) shareReferral(user.referral_code);
                else Alert.alert('暂未生成邀请码', '请重新登录刷新');
              }}
            />
          </View>
        )}

        {/* 会员等级卡（已登录显示）*/}
        {isAuthed && (
          <TierCard />
        )}

        {/* 帮助 / 关于 */}
        <View className="mx-3 mt-3 bg-white rounded-2xl overflow-hidden">
          <Row
            icon="💬"
            label="联系客服"
            onPress={() => {
              Alert.alert(
                '联系我们',
                '老板手机：+60 12-XXX XXXX\nWhatsApp / IG: @avojuice',
                [{ text: '好的' }],
              );
            }}
          />
          <Divider />
          <Row
            icon="📜"
            label="用户协议"
            onPress={() => Alert.alert('用户协议', '完整版 V2 上线', [{ text: '好的' }])}
          />
          <Divider />
          <Row
            icon="🔐"
            label="隐私政策"
            onPress={() => Alert.alert('隐私政策', '完整版 V2 上线', [{ text: '好的' }])}
          />
          <Divider />
          <Row icon="ℹ️" label="关于" subtitle="爱我果饮 v1.0.0" />
        </View>

        {/* 登出 */}
        {isAuthed && (
          <View className="mx-3 mt-6">
            <Button variant="ghost" fullWidth onPress={handleSignOut}>
              登出账号
            </Button>
          </View>
        )}

        <Text className="text-center text-xs text-ink-400 mt-6">
          爱我果饮 · UTAR · 真水果 · 一步一脚印
        </Text>
      </ScrollView>
    </Screen>
  );
}

function TierCard() {
  // V1：从 user_stats 取 total_spent（如果没接 API 暂时用 0）
  // V2：可以从后端拉 GET /admin/customers/:id 拿真实数据
  const totalSpent = 0
  const tier = getTier(totalSpent)
  const progress = tier.next ? Math.min(100, (totalSpent / tier.next) * 100) : 100

  return (
    <View className="mx-3 mt-3 p-4 bg-white rounded-3xl">
      <View className="flex-row items-center mb-3">
        <Text className="text-3xl mr-3">{tier.emoji}</Text>
        <View className="flex-1">
          <Text className="text-base font-bold text-ink-900">{tier.name}</Text>
          <Text className="text-xs text-ink-500 mt-0.5">
            {tier.next
              ? `距下一级还差 RM ${(tier.next - totalSpent).toFixed(0)}`
              : '已是最高等级'}
          </Text>
        </View>
        <Text className="text-xs text-ink-400">累计 RM {totalSpent.toFixed(0)}</Text>
      </View>
      <View className="h-2 bg-ink-100 rounded-full overflow-hidden">
        <View
          className="h-2 bg-brand-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  )
}

function Row({
  icon,
  label,
  subtitle,
  onPress,
  disabled,
}: {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      className={`flex-row items-center px-4 py-3.5 ${onPress && !disabled ? 'active:bg-ink-50' : ''}`}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className={`text-base ${disabled ? 'text-ink-400' : 'text-ink-900'}`}>{label}</Text>
        {subtitle ? <Text className="text-xs text-ink-400 mt-0.5">{subtitle}</Text> : null}
      </View>
      {onPress && !disabled && <Text className="text-ink-300 text-lg">›</Text>}
    </Pressable>
  );
}

function Divider() {
  return <View className="h-px bg-ink-100 ml-12" />;
}
