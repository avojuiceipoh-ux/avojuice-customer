import { Pressable, PressableProps, View, ViewStyle } from 'react-native';

/** Pressable 带按压透明度反馈，不破坏 className */
export function PressableOpacity({
  children,
  style,
  className,
  ...props
}: PressableProps & { className?: string }) {
  return (
    <Pressable {...props}>
      {({ pressed }) => (
        <View
          style={[style as ViewStyle, { opacity: pressed ? 0.65 : 1 }]}
          // @ts-ignore NativeWind className passthrough
          className={className}
        >
          {typeof children === 'function'
            ? (children as (state: { pressed: boolean }) => React.ReactNode)({ pressed })
            : children}
        </View>
      )}
    </Pressable>
  );
}
