import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import {
  productsApi,
  formatRM,
  toPrice,
  type Product,
  type ProductOption,
} from '../../src/api/products';
import { DEFAULT_OUTLET_ID } from '../../src/lib/env';
import { useCartStore } from '../../src/store/cart';
import { FruitInfo } from '../../src/components/FruitInfo';

// 选项分组：sweetness / ice 是必选单选；其他类型也归到选项里
const OPTION_TYPE_LABELS: Record<string, string> = {
  sweetness: '甜度',
  ice: '冰量',
};

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, ProductOption>>({});

  // 通过完整菜单查产品（节省额外请求；后端 GET /products/:id 也存在但缓存利用率低）
  const { data, isLoading } = useQuery({
    queryKey: ['menu', DEFAULT_OUTLET_ID],
    queryFn: () => productsApi.getMenu(DEFAULT_OUTLET_ID),
  });

  const product = useMemo<Product | null>(() => {
    if (!data) return null;
    for (const cat of data.categories) {
      const p = cat.products.find((x) => x.id === id);
      if (p) return p;
    }
    return null;
  }, [data, id]);

  // 把 options 按 type 分组
  const optionGroups = useMemo(() => {
    if (!product) return {};
    return product.options.reduce<Record<string, ProductOption[]>>((acc, o) => {
      (acc[o.type] = acc[o.type] || []).push(o);
      return acc;
    }, {});
  }, [product]);

  // 初始化默认选项
  useMemo(() => {
    if (!product || Object.keys(selected).length) return;
    const defaults: Record<string, ProductOption> = {};
    Object.entries(optionGroups).forEach(([type, opts]) => {
      const def = opts.find((o) => o.is_default) ?? opts[0];
      if (def) defaults[type] = def;
    });
    setSelected(defaults);
  }, [product, optionGroups]);

  if (isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#52c41a" />
        </View>
      </Screen>
    );
  }

  if (!product) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-ink-700">没找到这个产品</Text>
          <View className="mt-4">
            <Button variant="secondary" onPress={() => router.back()}>
              返回菜单
            </Button>
          </View>
        </View>
      </Screen>
    );
  }

  const unitPrice = toPrice(product.price);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = async () => {
    const optionsRecord: Record<string, string> = {};
    const labels: string[] = [];
    Object.values(selected).forEach((o) => {
      optionsRecord[o.type] = o.label;
      labels.push(o.label);
    });

    const cartId = `${product.id}__${Object.values(optionsRecord).join('_')}`;

    await useCartStore.getState().add({
      cart_id: cartId,
      product_id: product.id as any,  // backend 用 string UUID
      product_name: product.name_cn,
      unit_price: unitPrice,
      quantity,
      options: optionsRecord,
      options_label: labels.join(' / '),
      image_url: product.image_url ?? undefined,
    });

    router.back();
  };

  return (
    <Screen safe={false}>
      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 顶部图片区 */}
        <View className="h-72 bg-brand-50 items-center justify-center relative">
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} className="w-full h-72" resizeMode="cover" />
          ) : (
            <Text className="text-8xl">🥤</Text>
          )}
          {/* 关闭按钮 */}
          <Pressable
            onPress={() => router.back()}
            className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/90 items-center justify-center"
          >
            <Text className="text-xl text-ink-900">×</Text>
          </Pressable>
        </View>

        {/* 标题 + 描述 */}
        <View className="px-5 pt-5">
          <Text className="text-2xl font-bold text-ink-900">{product.name_cn}</Text>
          {product.name_en ? (
            <Text className="text-sm text-ink-500 mt-1">{product.name_en}</Text>
          ) : null}
          <Text className="text-2xl font-bold text-brand-600 mt-3">{formatRM(product.price)}</Text>
          {product.description ? (
            <Text className="text-sm text-ink-600 mt-3 leading-5">{product.description}</Text>
          ) : null}

          {/* 真材展示 — 品牌差异化卖点 */}
          {product.fruit_info && product.fruit_info.length > 0 && (
            <View className="mt-4 p-4 bg-brand-50 rounded-2xl">
              <FruitInfo items={product.fruit_info} size="md" />
              <Text className="text-xs text-brand-700 mt-2 leading-4">
                💚 我们坚持现采现榨，不用浓缩果汁 — 每一颗水果都看得见
              </Text>
            </View>
          )}
        </View>

        {/* 选项分组 */}
        <View className="px-5 mt-6">
          {Object.entries(optionGroups).map(([type, opts]) => (
            <View key={type} className="mb-5">
              <Text className="text-sm font-bold text-ink-900 mb-3">
                {OPTION_TYPE_LABELS[type] ?? type}
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {opts.map((o) => {
                  const active = selected[type]?.id === o.id;
                  return (
                    <Pressable
                      key={o.id}
                      onPress={() => setSelected((s) => ({ ...s, [type]: o }))}
                      className={`px-4 py-2 rounded-full border ${
                        active
                          ? 'bg-brand-500 border-brand-500'
                          : 'bg-white border-ink-200'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          active ? 'text-white font-semibold' : 'text-ink-700'
                        }`}
                      >
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部固定栏：数量 + 加入购物车 */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-ink-100 px-4 pt-3 pb-8">
        <View className="flex-row items-center">
          {/* 数量调节 */}
          <View className="flex-row items-center bg-ink-100 rounded-full mr-3">
            <Pressable
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-9 h-9 items-center justify-center"
            >
              <Text className="text-xl text-ink-700">−</Text>
            </Pressable>
            <Text className="text-base font-bold text-ink-900 w-6 text-center">{quantity}</Text>
            <Pressable
              onPress={() => setQuantity((q) => Math.min(20, q + 1))}
              className="w-9 h-9 items-center justify-center"
            >
              <Text className="text-xl text-ink-700">+</Text>
            </Pressable>
          </View>

          {/* 加入购物车 */}
          <Pressable
            onPress={handleAddToCart}
            className="flex-1 bg-brand-500 active:bg-brand-600 rounded-full py-3 flex-row items-center justify-center"
          >
            <Text className="text-white font-bold text-base">
              加入购物车 · {formatRM(totalPrice)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
