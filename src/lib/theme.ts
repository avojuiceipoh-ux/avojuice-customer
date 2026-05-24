import { useColorScheme } from 'react-native';

/** 轻量主题 hook — 不引入额外依赖，直接用系统 API */
export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    isDark,
    colorScheme,
    /** 两个值二选一 */
    select: <T>(light: T, dark: T) => (isDark ? dark : light),
  };
}
