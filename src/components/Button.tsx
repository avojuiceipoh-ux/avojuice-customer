import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';
import { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_BG: Record<Variant, string> = {
  primary:     'bg-brand-500 active:bg-brand-600',
  secondary:   'bg-ink-100 active:bg-ink-200',
  ghost:       'bg-transparent active:bg-ink-100',
  destructive: 'bg-red-500 active:bg-red-600',
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

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-2xl ${VARIANT_BG[variant]} ${SIZE_PADDING[size]} ${
        fullWidth ? 'w-full' : ''
      } ${isDisabled ? 'opacity-50' : ''}`}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#52c41a'}
          className="mr-2"
        />
      )}
      {typeof children === 'string' ? (
        <Text className={`font-semibold ${VARIANT_TEXT[variant]} ${SIZE_TEXT[size]}`}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
