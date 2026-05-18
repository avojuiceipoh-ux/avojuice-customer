/**
 * FruitInfo — 真材展示组件
 *
 * 展示"每杯用了 X 颗鳄梨 + Y g 草莓"
 * 这是品牌核心差异化：跟那些用浓缩果汁的店区分开
 */

import { View, Text } from 'react-native';

interface FruitInfoProps {
  items?: Array<{ name: string; qty: number; unit: string; emoji?: string }> | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// 常见水果 emoji 映射 — 如果后端没传 emoji，前端自动补
const FRUIT_EMOJI: Record<string, string> = {
  鳄梨: '🥑', 牛油果: '🥑', avocado: '🥑',
  芒果: '🥭', mango: '🥭',
  草莓: '🍓', strawberry: '🍓',
  蓝莓: '🫐', blueberry: '🫐',
  葡萄: '🍇', grape: '🍇',
  葡萄柚: '🍊',
  柠檬: '🍋', lemon: '🍋',
  橙: '🍊', orange: '🍊',
  橘: '🍊',
  西瓜: '🍉', watermelon: '🍉',
  凤梨: '🍍', 菠萝: '🍍', pineapple: '🍍',
  百香果: '🥭', passion: '🥭',
  桃: '🍑', 蜜桃: '🍑', peach: '🍑',
  香蕉: '🍌', banana: '🍌',
  奇异果: '🥝', 猕猴桃: '🥝', kiwi: '🥝',
  椰子: '🥥', coconut: '🥥', 椰: '🥥',
  牛奶: '🥛', milk: '🥛',
  豆奶: '🥛', 燕麦奶: '🌾', oat: '🌾',
  蜂蜜: '🍯', honey: '🍯',
  茶: '🍵', tea: '🍵',
  珍珠: '⚫', boba: '⚫',
};

const getEmoji = (item: { name: string; emoji?: string }) => {
  if (item.emoji) return item.emoji;
  const key = item.name.toLowerCase();
  for (const k of Object.keys(FRUIT_EMOJI)) {
    if (key.includes(k.toLowerCase()) || item.name.includes(k)) {
      return FRUIT_EMOJI[k];
    }
  }
  return '🥑'; // 默认
};

export function FruitInfo({ items, size = 'md', showLabel = true }: FruitInfoProps) {
  if (!items || items.length === 0) return null;

  const labelText = size === 'sm' ? 'text-xs' : 'text-sm';
  const valueText = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View>
      {showLabel && (
        <Text className={`${labelText} font-bold text-brand-700 mb-2`}>
          🌱 每杯真材实料
        </Text>
      )}
      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
        {items.map((item, idx) => (
          <View
            key={idx}
            className="flex-row items-center bg-brand-50 rounded-full px-3 py-1.5"
          >
            <Text className="text-base mr-1">{getEmoji(item)}</Text>
            <Text className={`${valueText} font-semibold text-ink-900`}>
              {item.qty} {item.unit}
            </Text>
            <Text className={`${valueText} text-ink-600 ml-1`}>{item.name}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** 紧凑版 — 用在菜单卡片上（一行内 inline 显示） */
export function FruitInfoInline({ items }: { items?: FruitInfoProps['items'] }) {
  if (!items || items.length === 0) return null;
  return (
    <View className="flex-row items-center mt-1">
      <Text className="text-[10px] text-brand-700 font-medium">🌱 </Text>
      {items.slice(0, 3).map((item, idx) => (
        <Text key={idx} className="text-[10px] text-brand-700 font-medium">
          {getEmoji(item)}{item.qty}{item.unit}{idx < Math.min(items.length, 3) - 1 ? ' · ' : ''}
        </Text>
      ))}
    </View>
  );
}
