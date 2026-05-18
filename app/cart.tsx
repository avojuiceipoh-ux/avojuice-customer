import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../src/components/Screen';
import { Button } from '../src/components/Button';
import { useCartStore } from '../src/store/cart';
import { formatRM } from '../src/api/products';

export default function CartScreen() {
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
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-4 bg-white flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-ink-100 items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-xl text-ink-900">‹</Text>
        </Pressable>
        <Text className="text-lg font-bold text-ink-900">购物车 ({count})</Text>
        {items.length > 0 ? (
          <Pressable onPress={handleClear} hitSlop={8}>
            <Text className="text-sm text-ink-500">清空</Text>
          </Pressable>
        ) : (
          <View className="w-9" />
        )}
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-5xl mb-4">🛒</Text>
          <Text className="text-ink-700 font-semibold">购物车空空的</Text>
          <Text className="text-ink-500 text-sm mt-1">去菜单挑一杯吧</Text>
          <View className="mt-6">
            <Button onPress={() => router.replace('/(tabs)/menu')}>去看菜单</Button>
          </View>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 12 }}>
            {items.map((item) => (
              <View
                key={item.cart_id}
                className="mx-3 mb-2 p-3 bg-white rounded-2xl flex-row"
              >
                {/* 图标 */}
                <View className="w-16 h-16 rounded-xl bg-brand-50 items-center justify-center mr-3">
                  <Text className="text-2xl">🥤</Text>
                </View>

                {/* 内容 */}
                <View className="flex-1 justify-between">
                  <View>
                    <Text className="text-base font-semibold text-ink-900">
                      {item.product_name}
                    </Text>
                    {item.options_label ? (
                      <Text className="text-xs text-ink-500 mt-0.5">{item.options_label}</Text>
                    ) : null}
                  </View>

                  <View className="flex-row items-end justify-between mt-2">
                    <Text className="text-base font-bold text-brand-600">
                      {formatRM(item.unit_price * item.quantity)}
                    </Text>

                    {/* 数量调节 */}
                    <View className="flex-row items-center bg-ink-100 rounded-full">
                      <Pressable
                        onPress={() => setQuantity(item.cart_id, item.quantity - 1)}
                        hitSlop={4}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-lg text-ink-700">−</Text>
                      </Pressable>
                      <Text className="text-base font-bold text-ink-900 w-6 text-center">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => setQuantity(item.cart_id, item.quantity + 1)}
                        hitSlop={4}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-lg text-ink-700">+</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* 底部结算栏 */}
          <View className="bg-white px-4 pt-3 pb-6 border-t border-ink-100">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm text-ink-500">合计</Text>
              <Text className="text-2xl font-bold text-brand-600">{formatRM(total)}</Text>
            </View>
            <Button fullWidth onPress={() => router.push('/checkout')}>
              去结算
            </Button>
          </View>
        </>
      )}
    </Screen>
  );
}
