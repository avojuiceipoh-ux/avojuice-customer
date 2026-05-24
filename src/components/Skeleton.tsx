import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/** 骨架屏脉冲动画 */
function usePulse() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.6, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, []);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
}

/** 骨架块 — 圆角矩形 + 脉冲 */
function Bone({ className = '' }: { className?: string }) {
  const pulseStyle = usePulse();
  return (
    <Animated.View
      style={pulseStyle}
      className={`bg-ink-200 rounded-md ${className}`}
    />
  );
}

/** 产品卡片骨架 */
export function ProductCardSkeleton() {
  return (
    <View className="bg-white rounded-xl p-3 shadow-sm mb-3">
      {/* 图片占位 */}
      <Bone className="w-full h-36 rounded-lg mb-3" />
      {/* 标题 */}
      <Bone className="w-3/4 h-4 mb-2" />
      {/* 描述 */}
      <Bone className="w-full h-3 mb-3" />
      {/* 价格 */}
      <View className="flex-row justify-between items-center">
        <Bone className="w-20 h-5" />
        <Bone className="w-16 h-8 rounded-full" />
      </View>
    </View>
  );
}

/** 列表页骨架（N 个产品卡片） */
export function MenuSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View className="px-4 pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  );
}

/** 单行文字骨架 */
export function TextSkeleton({ width = 'w-32', className = '' }: { width?: string; className?: string }) {
  return <Bone className={`h-4 ${width} ${className}`} />;
}

/** 头像骨架 */
export function AvatarSkeleton({ size = 12 }: { size?: number }) {
  const sizeCls = `w-${size} h-${size}`;
  return <Bone className={`${sizeCls} rounded-full`} />;
}

export { Bone };
