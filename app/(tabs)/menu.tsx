import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { ProductSheet } from '../../src/components/ProductSheet';
import { productsApi, type Product, formatRM } from '../../src/api/products';
import { FruitInfoInline } from '../../src/components/FruitInfo';
import { DEFAULT_OUTLET_ID } from '../../src/lib/env';
import { useCartStore } from '../../src/store/cart';

export default function MenuScreen() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const cartCount = useCartStore((s) => s.count());

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['menu', DEFAULT_OUTLET_ID],
    queryFn: () => productsApi.getMenu(DEFAULT_OUTLET_ID),
  });

  const categories = data?.categories ?? [];
  const currentCategoryId = activeCategoryId ?? categories[0]?.id ?? null;

  const currentProducts = useMemo(() => {
    const cat = categories.find((c) => c.id === currentCategoryId);
    return cat?.products ?? [];
  }, [categories, currentCategoryId]);

  return (
    <Screen bg="bg-ink-50">
      {/* Header */}
      <View className="px-5 pt-2 pb-3 bg-white">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 40, height: 40, marginRight: 10 }}
              resizeMode="contain"
            />
            <View>
              <Text className="text-2xl font-bold text-ink-900">爱我果饮</Text>
              <Text className="text-xs text-ink-500 mt-0.5">UTAR 主摊位 · 营业中</Text>
            </View>
          </View>
          <Text className="text-xs text-brand-600 font-semibold">每日鲜采</Text>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#52c41a" />
          <Text className="text-ink-500 mt-3">加载菜单中...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-4xl mb-3">😵</Text>
          <Text className="text-ink-700 font-semibold">菜单加载失败</Text>
          <Text className="text-ink-500 text-sm mt-1 text-center">
            检查一下网络，或稍后再试
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mt-4 px-5 py-2 rounded-full bg-brand-500 active:bg-brand-600"
          >
            <Text className="text-white font-semibold">重试</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1 flex-row">
          {/* 左边：分类 */}
          <View className="w-24 bg-ink-100">
            <ScrollView>
              {categories.map((cat) => {
                const active = cat.id === currentCategoryId;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setActiveCategoryId(cat.id)}
                    className={`px-3 py-4 ${active ? 'bg-white border-l-4 border-brand-500' : ''}`}
                  >
                    <Text
                      className={`text-sm text-center ${
                        active ? 'text-brand-600 font-bold' : 'text-ink-700 font-medium'
                      }`}
                    >
                      {cat.name_cn}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* 右边：产品列表 */}
          <FlatList
            className="flex-1 bg-white"
            data={currentProducts}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <ProductRow product={item} onPlusPress={() => setSheetProduct(item)} />
            )}
            ItemSeparatorComponent={() => <View className="h-px bg-ink-100 ml-24" />}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#52c41a" />
            }
            ListEmptyComponent={
              <View className="items-center py-20">
                <Text className="text-ink-400">这个分类暂无产品</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      )}

      {/* 底部购物车浮层 */}
      {cartCount > 0 && (
        <Pressable onPress={() => router.push('/cart')}>
          {({ pressed }) => (
            <View
              className="absolute bottom-4 left-4 right-4 bg-brand-500 rounded-full px-5 py-3 flex-row items-center justify-between"
              style={{
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 12,
                elevation: 6,
                opacity: pressed ? 0.7 : 1,
              }}
            >
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
              <Text className="text-white font-bold">{cartCount}</Text>
            </View>
            <Text className="text-white font-semibold">查看购物车</Text>
          </View>
          <Text className="text-white">前往结算 →</Text>
            </View>
          )}
        </Pressable>
      )}

      {/* 选项浮层 */}
      <ProductSheet
        product={sheetProduct}
        visible={!!sheetProduct}
        onClose={() => setSheetProduct(null)}
      />
    </Screen>
  );
}

// ─── 产品行 ────────────────────────────────────────────
function ProductRow({
  product,
  onPlusPress,
}: {
  product: Product;
  onPlusPress: () => void;
}) {
  return (
    <View className="relative">
      {/* 整行可点 — 跳详情页（右边留出 + 号区域） */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        className="flex-row px-3 py-3 pr-14 active:bg-ink-50"
      >
        {/* 图片占位 */}
        <View className="w-20 h-20 rounded-xl bg-brand-50 items-center justify-center mr-3">
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} className="w-20 h-20 rounded-xl" />
          ) : (
            <Text className="text-3xl">🥤</Text>
          )}
        </View>

        <View className="flex-1 justify-between py-1">
          <View>
            <Text className="text-base font-semibold text-ink-900" numberOfLines={1}>
              {product.name_cn}
            </Text>
            {/* 简短描述（V2）优先；fallback 到长描述（V1 兼容） */}
            {(product.short_desc || product.description) ? (
              <Text className="text-xs text-ink-500 mt-1" numberOfLines={2}>
                {product.short_desc || product.description}
              </Text>
            ) : null}
            <FruitInfoInline items={product.fruit_info} />
          </View>

          <Text className="text-base font-bold text-brand-600">
            {formatRM(product.price)}
          </Text>
        </View>
      </Pressable>

      {/* + 号独立 Pressable — 绝对定位，覆盖在行 Z 轴上层，事件不会冒到外层 */}
      <Pressable
        onPress={onPlusPress}
        hitSlop={10}
        className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-brand-500 active:bg-brand-600 items-center justify-center"
        style={{
          shadowColor: '#52c41a',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 2 },
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-white text-xl font-bold leading-[22px]">+</Text>
      </Pressable>
    </View>
  );
}
