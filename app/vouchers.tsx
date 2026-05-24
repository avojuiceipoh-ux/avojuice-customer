import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Ticket, Clock, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';

/** 优惠券页面 */
export default function VouchersScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  const vouchers = [
    { id: 1, name: '满 RM10 减 RM2', desc: '消费满 RM10 即可使用', expiry: '2026-06-15', used: false },
    { id: 2, name: '买一送一', desc: '牛油果奶昔买一送一', expiry: '2026-05-30', used: false },
    { id: 3, name: '免费加料券', desc: '任选一种免费加料', expiry: '2026-06-01', used: true },
    { id: 4, name: '学生专享 9 折', desc: '凭学生证享全单 9 折', expiry: '2026-07-31', used: false },
    { id: 5, name: '生日礼', desc: '生日当月免费赠饮一杯', expiry: '2026-12-31', used: true },
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
        <Text style={{ color: text }} className="text-2xl font-bold">优惠券</Text>
        <View className="flex-1" />
        <Text style={{ color: brandGreen }} className="text-sm font-semibold">
          {vouchers.filter(v => !v.used).length} 张可用
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        {/* 可用券 */}
        <Text style={{ color: sub }} className="text-xs font-semibold mt-2 mb-3 uppercase tracking-wide">
          可使用
        </Text>
        {vouchers.filter(v => !v.used).map((v) => (
          <Pressable
            key={v.id}
            className="rounded-xl mb-2.5 flex-row overflow-hidden"
            style={{
              backgroundColor: cardBg,
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
          >
            {/* 左侧色条 */}
            <View className="w-2" style={{ backgroundColor: brandGreen }} />
            <View className="flex-1 p-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)' }}
              >
                <Ticket size={18} color={brandGreen} />
              </View>
              <View className="flex-1">
                <Text style={{ color: text }} className="font-bold text-sm">{v.name}</Text>
                <Text style={{ color: sub }} className="text-xs mt-0.5">{v.desc}</Text>
                <View className="flex-row items-center mt-1.5">
                  <Clock size={12} color={sub} />
                  <Text style={{ color: sub }} className="text-xs ml-1">有效期至 {v.expiry}</Text>
                </View>
              </View>
              <Pressable className="bg-brand-500 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-bold">去使用</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}

        {/* 已使用 */}
        <Text style={{ color: sub }} className="text-xs font-semibold mt-6 mb-3 uppercase tracking-wide">
          已使用 / 已过期
        </Text>
        {vouchers.filter(v => v.used).map((v) => (
          <View
            key={v.id}
            className="rounded-xl mb-2.5 flex-row overflow-hidden"
            style={{
              backgroundColor: cardBg,
              opacity: 0.5,
            }}
          >
            <View className="w-2" style={{ backgroundColor: '#a3a3a3' }} />
            <View className="flex-1 p-4 flex-row items-center">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: isDark ? 'rgba(115,115,115,0.15)' : '#f5f5f5' }}
              >
                <CheckCircle2 size={18} color="#a3a3a3" />
              </View>
              <View className="flex-1">
                <Text style={{ color: text }} className="font-bold text-sm">{v.name}</Text>
                <Text style={{ color: sub }} className="text-xs mt-0.5">{v.desc}</Text>
                <View className="flex-row items-center mt-1.5">
                  <Clock size={12} color={sub} />
                  <Text style={{ color: sub }} className="text-xs ml-1">有效期至 {v.expiry}</Text>
                </View>
              </View>
              <Text style={{ color: sub }} className="text-xs font-semibold">已使用</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
