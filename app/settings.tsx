import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronRight, HelpCircle, MessageSquare, Mail, FileText, Shield } from 'lucide-react-native';
import { router } from 'expo-router';
import { useTheme } from '../src/lib/theme';

/** 设置 — Help Center + Feedback + Contact Us + Terms + Privacy */
export default function SettingsScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const iconColor = isDark ? '#a3a3a3' : '#525252';

  const items = [
    { icon: HelpCircle, label: 'Help Center', href: null },
    { icon: MessageSquare, label: 'Feedback', href: null },
    { icon: Mail, label: 'Contact Us', href: null },
    { icon: FileText, label: 'Terms of Service', href: null },
    { icon: Shield, label: 'Privacy Policy', href: null },
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
        <Text style={{ color: text }} className="text-2xl font-bold">设置</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Menu items */}
        <View className="px-5 mt-2">
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg }}>
            {items.map((item, i) => (
              <View key={item.label}>
                {i > 0 && (
                  <View
                    className="ml-12"
                    style={{ height: 1, backgroundColor: isDark ? '#333' : '#f0f0f0' }}
                  />
                )}
                <Pressable>
                  {({ pressed }) => (
                    <View
                      className="flex-row items-center px-4 py-4"
                      style={{ opacity: pressed ? 0.6 : 1 }}
                    >
                      <item.icon size={20} color={iconColor} />
                      <Text style={{ color: text }} className="flex-1 ml-3 font-semibold text-sm">
                        {item.label}
                      </Text>
                      <ChevronRight size={16} color={isDark ? '#525252' : '#d4d4d4'} />
                    </View>
                  )}
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        <Text style={{ color: sub }} className="text-center text-xs mt-8">
          爱我果饮 · 本真之味 · 果中显
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
