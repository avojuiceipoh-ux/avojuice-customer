import { SafeAreaView } from 'react-native-safe-area-context';
import { View, type ViewProps } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '../lib/theme';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  safe?: boolean;
  /** 亮色模式背景（深色模式下自动用 bg-ink-900 覆盖） */
  bg?: string;
}

export function Screen({ children, safe = true, bg, className, ...rest }: ScreenProps & { className?: string }) {
  const { isDark } = useTheme();
  // 深色模式下强制用深色背景，忽略传入的亮色 bg
  const resolvedBg = isDark ? 'bg-ink-900' : (bg ?? 'bg-white');
  const Container = safe ? SafeAreaView : View;
  return (
    <Container className={`flex-1 ${resolvedBg} ${className ?? ''}`} {...(rest as any)}>
      {children}
    </Container>
  );
}
