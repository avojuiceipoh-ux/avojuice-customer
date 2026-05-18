import { SafeAreaView } from 'react-native-safe-area-context';
import { View, type ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  /** 是否要 safe-area padding（默认 true） */
  safe?: boolean;
  /** 背景色 className，默认白 */
  bg?: string;
}

/** 统一页面容器 — 处理 safe-area 和背景 */
export function Screen({ children, safe = true, bg = 'bg-white', className, ...rest }: ScreenProps & { className?: string }) {
  const Container = safe ? SafeAreaView : View;
  return (
    <Container className={`flex-1 ${bg} ${className ?? ''}`} {...(rest as any)}>
      {children}
    </Container>
  );
}
