import { View, Text, ScrollView, Pressable, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, DollarSign, Users, Share2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';

/** Referral Reward 页面 */
export default function RewardScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  const totalReward = 5.20;
  const referralCode = 'AVOJUICE88';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `用我的推荐码 ${referralCode} 下载 AVO Juice App，你我各得 RM3 优惠券！🥑`,
      });
    } catch (e) {
      // user cancelled
    }
  };

  const referrals = [
    { id: 1, name: 'Jia Wei', spent: 48.00, reward: 2.40, date: '5/24' },
    { id: 2, name: 'Mei Ling', spent: 32.00, reward: 1.60, date: '5/22' },
    { id: 3, name: 'Hao Ran', spent: 24.00, reward: 1.20, date: '5/18' },
  ];

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

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
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
              <Text className="text-white/80 text-xs ml-1.5">{referrals.length} 位好友已消费</Text>
            </View>
          </View>
        </View>

        {/* 邀请按钮 */}
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
            <Text style={{ color: brandGreen }} className="text-sm font-bold ml-2">邀请好友赚奖励</Text>
          </Pressable>
        </View>

        {/* 奖励记录 */}
        <View className="px-5 mt-6">
          <Text style={{ color: text }} className="text-lg font-bold mb-3">
            Reward History
          </Text>

          {referrals.map((r) => (
            <View
              key={r.id}
              className="rounded-xl p-4 mb-2.5 flex-row items-center"
              style={{ backgroundColor: cardBg }}
            >
              {/* 头像占位 */}
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)' }}
              >
                <Text style={{ color: brandGreen }} className="text-sm font-bold">
                  {r.name.charAt(0)}
                </Text>
              </View>

              {/* 信息 */}
              <View className="flex-1">
                <Text style={{ color: text }} className="font-semibold text-sm">{r.name}</Text>
                <Text style={{ color: sub }} className="text-xs mt-0.5">
                  消费 RM {r.spent.toFixed(2)} · {r.date}
                </Text>
              </View>

              {/* 奖励金额 */}
              <View className="items-end">
                <Text style={{ color: brandGreen }} className="font-bold text-sm">
                  + RM {r.reward.toFixed(2)}
                </Text>
                <Text style={{ color: sub }} className="text-xs mt-0.5">5% reward</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
