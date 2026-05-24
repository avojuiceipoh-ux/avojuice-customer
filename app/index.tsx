import { useEffect } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../src/lib/theme';

export default function HomeScreen() {
  const { isDark } = useTheme();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  // Logo 呼吸动画 (入场后持续浮动)
  const logoFloat = useSharedValue(0);

  useEffect(() => {
    // 入场动画序列：logo → tagline → 按钮
    logoOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.5)) });

    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));
    btnOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

    // Logo 持续浮动动画 (入场结束后开始)
    logoFloat.value = withDelay(
      1000,
      withRepeat(
        withSequence(
          withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoFloat.value },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const btnStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
  }));

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#171717' : '#f6ffed' }}
    >
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo */}
        <Animated.View style={logoStyle} className="items-center">
          <Image
            source={require('../assets/logo.png')}
            className="w-40 h-40"
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={taglineStyle} className="mt-10 items-center">
          <Text className="text-ink-500 text-xl text-center font-bold tracking-wider">
            本真之味，果中显
          </Text>
          <Text className="text-ink-400 text-sm text-center mt-3 leading-relaxed">
            真实·真诚·真心 对待每一个客人
          </Text>
        </Animated.View>

        {/* CTA 按钮 */}
        <Animated.View style={btnStyle} className="mt-16 w-full max-w-xs">
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            className="bg-brand-500 active:bg-brand-600 rounded-2xl py-4 px-8 items-center justify-center"
            style={{ shadowColor: '#649b29', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } }}
          >
            <Text className="text-white font-semibold text-lg">开始点单</Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* 底部品牌条 */}
      <View className="pb-8 items-center">
        <Text className="text-ink-300 text-xs">
          金宝 · 万里望 · 东区 · 第一花园 · 华城
        </Text>
      </View>
    </SafeAreaView>
  );
}
