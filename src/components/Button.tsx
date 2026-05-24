import { ActivityIndicator, Text } from 'react-native';
import { ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

const VARIANT_BG: Record<Variant, string> = {
  primary:     'bg-brand-500',
  secondary:   'bg-ink-100',
  ghost:       'bg-transparent',
  destructive: 'bg-danger-500',
};

const VARIANT_ACTIVE: Record<Variant, string> = {
  primary:     'bg-brand-600',
  secondary:   'bg-ink-200',
  ghost:       'bg-ink-100',
  destructive: 'bg-danger-600',
};

const VARIANT_TEXT: Record<Variant, string> = {
  primary:     'text-white',
  secondary:   'text-ink-900',
  ghost:       'text-brand-600',
  destructive: 'text-white',
};

const SIZE_PADDING: Record<Size, string> = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-5 py-4',
};

const SIZE_TEXT: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

/** 品牌按钮 — Reanimated 缩放反馈 + loading 态 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  onPress,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { stiffness: 400, damping: 20 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { stiffness: 400, damping: 20 });
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth ? { width: '100%' } : undefined]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        className={`
          flex-row items-center justify-center rounded-2xl
          ${VARIANT_BG[variant]} ${SIZE_PADDING[size]}
          ${fullWidth ? 'w-full' : ''}
          ${isDisabled ? 'opacity-50' : ''}
        `}
        style={variant === 'primary' ? {
          shadowColor: '#649b29',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        } : undefined}
      >
        {loading && (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#649b29'}
            className="mr-2"
          />
        )}
        {typeof children === 'string' ? (
          <Text className={`font-semibold ${VARIANT_TEXT[variant]} ${SIZE_TEXT[size]}`}>
            {children}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    </Animated.View>
  );
}
