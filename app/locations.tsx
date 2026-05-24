import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';

const SCHEDULE = [
  { day: '星期一', location: '万里望新市镇', time: '17:00 - 22:00' },
  { day: '星期二', location: '怡保东区', time: '17:00 - 22:00' },
  { day: '星期三', location: '金宝夜市', time: '17:00 - 22:00' },
  { day: '星期四', location: '万里望新市镇', time: '17:00 - 22:00' },
  { day: '星期五', location: '怡保第一花园', time: '17:00 - 22:00' },
  { day: '星期六', location: '华城夜市', time: '17:00 - 22:00' },
];

export default function LocationsScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const brandGreen = '#649b29';

  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const todayIdx = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayLabel = dayNames[todayIdx];

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
        <Text style={{ color: text }} className="text-2xl font-bold">营业地点</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        {/* 今天在哪 */}
        {SCHEDULE.map((item, i) => {
          const isToday = item.day === todayLabel;
          if (!isToday) return null;
          return (
            <View key={i} className="mt-2 mb-4">
              <View
                className="rounded-2xl p-5"
                style={{
                  backgroundColor: brandGreen,
                  shadowColor: brandGreen,
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View className="bg-white/20 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-bold">今天</Text>
                  </View>
                </View>
                <Text className="text-white text-2xl font-bold">{item.location}</Text>
                <View className="flex-row items-center mt-3">
                  <Navigation size={16} color="rgba(255,255,255,0.7)" />
                  <Text className="text-white/70 text-sm ml-1.5">{item.time}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* 本周营业表 */}
        <Text style={{ color: text }} className="text-lg font-bold mb-3">
          本周营业时间
        </Text>

        {SCHEDULE.map((item, i) => {
          const isToday = item.day === todayLabel;
          return (
            <View
              key={i}
              className="rounded-xl p-4 mb-2 flex-row items-center"
              style={{
                backgroundColor: isToday ? (isDark ? 'rgba(100,155,41,0.2)' : 'rgba(100,155,41,0.1)') : cardBg,
                borderWidth: isToday ? 1.5 : 0,
                borderColor: isToday ? brandGreen : 'transparent',
              }}
            >
              {/* 星期 */}
              <View className="w-16">
                <Text
                  style={{ color: isToday ? brandGreen : text }}
                  className="font-bold text-sm"
                >
                  {item.day}
                </Text>
                {isToday && (
                  <View className="bg-brand-500 rounded-full px-2 py-0.5 mt-1 self-start">
                    <Text className="text-white text-[10px] font-bold">今天</Text>
                  </View>
                )}
              </View>

              {/* 地点 + 时间 */}
              <View className="flex-1 flex-row items-center ml-2">
                <MapPin size={14} color={isToday ? brandGreen : sub} />
                <Text
                  style={{ color: isToday ? brandGreen : text }}
                  className="font-semibold text-sm ml-1.5"
                >
                  {item.location}
                </Text>
              </View>

              <Text style={{ color: sub }} className="text-xs">{item.time}</Text>
            </View>
          );
        })}

        {/* 周日休息 */}
        <View
          className="rounded-xl p-4 mb-8 flex-row items-center"
          style={{ backgroundColor: cardBg, opacity: 0.5 }}
        >
          <View className="w-16">
            <Text style={{ color: sub }} className="font-bold text-sm">星期日</Text>
          </View>
          <View className="flex-1 flex-row items-center ml-2">
            <MapPin size={14} color={sub} />
            <Text style={{ color: sub }} className="text-sm ml-1.5">休息</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
