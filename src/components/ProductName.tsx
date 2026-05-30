/**
 * ProductName — 产品名拆分渲染
 *
 * 规则：`主名 (副名)` 或 `主名（副名）` → 主名大字 + 副名小字
 *  - 半角 `()` 和全角 `（）` 都支持
 *  - 没有括号 → 整段当主名
 *  - 副名前自动加一行/一空格，可通过 layout 控制
 *
 * 用法：
 *   <ProductName name={product.name_cn} />
 *   <ProductName name={product.name_cn} size="lg" layout="inline" />
 */

import { View, Text, type TextStyle } from 'react-native';

type Size = 'sm' | 'md' | 'lg' | 'xl';
type Layout = 'stack' | 'inline';

interface Props {
  name: string;
  /** 主名字号档位（小字会按主名比例缩） */
  size?: Size;
  /** stack: 副名换行；inline: 副名跟在同一行 */
  layout?: Layout;
  /** 颜色控制（主、副）— 不传走默认 */
  mainStyle?: TextStyle;
  subStyle?: TextStyle;
  /** className 传给主名（NativeWind） */
  className?: string;
  /** className 传给副名 */
  subClassName?: string;
  /** 单行省略（主名） */
  numberOfLines?: number;
}

const MAIN_SIZE: Record<Size, number> = { sm: 14, md: 16, lg: 20, xl: 24 };
const SUB_SIZE: Record<Size, number> = { sm: 10, md: 11, lg: 13, xl: 14 };

/** 半角/全角括号都吃；只取第一对括号作为副名 */
export function parseProductName(name: string): { main: string; sub: string | null } {
  if (!name) return { main: '', sub: null };
  const m = name.match(/^(.*?)[\s]*[（(]([^（）()]+)[）)]\s*$/);
  if (!m) return { main: name.trim(), sub: null };
  return { main: m[1].trim(), sub: m[2].trim() };
}

export function ProductName({
  name,
  size = 'md',
  layout = 'stack',
  mainStyle,
  subStyle,
  className,
  subClassName,
  numberOfLines,
}: Props) {
  const { main, sub } = parseProductName(name);
  const mainFs = MAIN_SIZE[size];
  const subFs = SUB_SIZE[size];

  if (!sub) {
    return (
      <Text
        className={className}
        style={[{ fontSize: mainFs, fontWeight: '700' }, mainStyle]}
        numberOfLines={numberOfLines}
      >
        {main}
      </Text>
    );
  }

  if (layout === 'inline') {
    return (
      <Text className={className} numberOfLines={numberOfLines}>
        <Text style={[{ fontSize: mainFs, fontWeight: '700' }, mainStyle]}>{main}</Text>
        <Text style={[{ fontSize: subFs, fontWeight: '400', opacity: 0.65 }, subStyle]}>
          {`  ${sub}`}
        </Text>
      </Text>
    );
  }

  // stack：主名一行、副名一行
  return (
    <View>
      <Text
        className={className}
        style={[{ fontSize: mainFs, fontWeight: '700' }, mainStyle]}
        numberOfLines={numberOfLines}
      >
        {main}
      </Text>
      <Text
        className={subClassName}
        style={[{ fontSize: subFs, fontWeight: '400', opacity: 0.65, marginTop: 1 }, subStyle]}
        numberOfLines={1}
      >
        {sub}
      </Text>
    </View>
  );
}
