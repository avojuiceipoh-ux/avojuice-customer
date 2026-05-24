import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, ShoppingBag, Minus, Plus } from 'lucide-react-native';
import { useCartStore } from '../src/store/cart';
import { formatRM } from '../src/api/products';
import { useTheme } from '../src/lib/theme';

export default function CartScreen() {
  const { isDark } = useTheme();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const count = useCartStore((s) => s.count());
  const setQuantity = useCartStore((s) => s.setQuantity);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const handleClear = () => {
    Alert.alert('清空购物车？', '所有商品将被移除', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: () => clear() },
    ]);
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? '#171717' : '#f5f8f0' }}
    >
      {/* Header */}
      <View
        className="px-5 pt-14 pb-4 flex-row items-center justify-between"
        style={{
          backgroundColor: isDark ? '#171717' : '#fff',
          borderBottomWidth: 0.5,
          borderBottomColor: isDark ? '#262626' : '#e5e5e5',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: isDark ? '#262626' : '#f5f5f5' }}
          hitSlop={8}
        >
          <ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} />
        </Pressable>
        <Text
          style={{ color: isDark ? '#fafafa' : '#1a1a1a' }}
          className="text-lg font-bold"
        >
          购物车 ({count})
        </Text>
        {items.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={8} className="flex-row items-center">
            <Trash2 size={16} color={isDark ? '#737373' : '#a3a3a3'} />
            <Text className="text-sm ml-1" style={{ color: isDark ? '#737373' : '#a3a3a3' }}>
              清空
            </Text>
          </Pressable>
        ) : (
          <View className="w-14" />
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: isDark ? '#262626' : '#e8f5e0' }}
          >
            <ShoppingBag size={40} color="#649b29" />
          </View>
          <Text
            style={{ color: isDark ? '#fafafa' : '#1a1a1a' }}
            className="text-lg font-bold"
          >
            购物车空空的
          </Text>
          <Text className="text-ink-400 text-sm mt-1">去菜单挑一杯吧</Text>
          <Pressable
            onPress={() => router.replace('/(tabs)/menu')}
            className="mt-6 bg-brand-500 px-8 py-3 rounded-2xl"
            style={{
              shadowColor: '#649b29',
              shadowOpacity: 0.3,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
            }}
          >
            <Text className="text-white font-bold text-base">去看菜单</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}>
            {items.map((item) => (
              <View
                key={item.cart_id}
                className="mb-2.5 p-3.5 rounded-2xl flex-row"
                style={{ backgroundColor: isDark ? '#262626' : '#fff' }}
              >
                {/* 图标 */}
                <View
                  className="w-16 h-16 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: isDark ? '#1a2e14' : '#e8f5e0' }}
                >
                  <Text className="text-2xl">🥤</Text>
                </View>

                {/* 内容 */}
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <Text
                      style={{ color: isDark ? '#fafafa' : '#1a1a1a' }}
                      className="text-base font-semibold flex-1 pr-2"
                      numberOfLines={1}
                    >
                      {item.product_name}
                    </Text>
                    <Pressable
                      onPress={() => remove(item.cart_id)}
                      hitSlop={8}
                      className="p-1"
                    >
                      <Trash2 size={14} color={isDark ? '#525252' : '#d4d4d4'} />
                    </Pressable>
                  </View>
                  {item.options_label ? (
                    <Text className="text-xs mt-0.5" style={{ color: isDark ? '#737373' : '#a3a3a3' }}>
                      {item.options_label}
                    </Text>
                  ) : null}

                  <View className="flex-row items-end justify-between mt-3">
                    <Text className="text-base font-bold text-brand-600">
                      {formatRM(item.unit_price * item.quantity)}
                    </Text>

                    {/* 数量调节 */}
                    <View
                      className="flex-row items-center rounded-full"
                      style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}
                    >
                      <Pressable
                        onPress={() => setQuantity(item.cart_id, item.quantity - 1)}
                        hitSlop={4}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Minus size={14} color={isDark ? '#a3a3a3' : '#737373'} />
                      </Pressable>
                      <Text
                        style={{ color: isDark ? '#fafafa' : '#1a1a1a' }}
                        className="text-sm font-bold w-7 text-center"
                      >
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => setQuantity(item.cart_id, item.quantity + 1)}
                        hitSlop={4}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Plus size={14} color={isDark ? '#a3a3a3' : '#737373'} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* 底部结算栏 */}
          <View
            className="px-5 pt-4 pb-8"
            style={{
              backgroundColor: isDark ? '#171717' : '#fff',
              borderTopWidth: 0.5,
              borderTopColor: isDark ? '#262626' : '#e5e5e5',
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text style={{ color: isDark ? '#a3a3a3' : '#737373' }} className="text-sm">
                合计
              </Text>
              <Text className="text-2xl font-bold text-brand-600">{formatRM(total)}</Text>
            </View>
            <Pressable
              onPress={() => router.push('/checkout')}
              className="rounded-2xl py-4 items-center"
              style={{
                backgroundColor: '#649b29',
                shadowColor: '#649b29',
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              <Text className="text-white font-bold text-lg">去结算</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
