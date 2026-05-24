/**
 * ProductSheet — Reanimated 底部抽屉
 *
 * 弹簧动画滑出/收回，支持下滑关闭，60fps 流畅。
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  formatRM,
  toPrice,
  type Product,
  type ProductOption,
} from '../api/products';
import { useCartStore } from '../store/cart';
import { FruitInfo } from './FruitInfo';

const OPTION_TYPE_LABELS: Record<string, string> = {
  sweetness: '甜度',
  ice: '冰量',
  topping: '加料',
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.75;
const DISMISS_THRESHOLD = 120;

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export function ProductSheet({ product, visible, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, ProductOption>>({});

  // Reanimated values
  const translateY = useSharedValue(SHEET_MAX_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // 按 type 分组
  const optionGroups = useMemo(() => {
    if (!product) return {};
    return product.options.reduce<Record<string, ProductOption[]>>((acc, o) => {
      (acc[o.type] = acc[o.type] || []).push(o);
      return acc;
    }, {});
  }, [product]);

  // 打开/关闭动画
  useEffect(() => {
    if (visible && product) {
      // 重置选项
      const defaults: Record<string, ProductOption> = {};
      Object.entries(optionGroups).forEach(([type, opts]) => {
        const def = opts.find((o) => o.is_default) ?? opts[0];
        if (def) defaults[type] = def;
      });
      setSelected(defaults);
      setQuantity(1);

      // 动画：滑入
      translateY.value = withSpring(0, {
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      });
      backdropOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateY.value = withSpring(SHEET_MAX_HEIGHT, { stiffness: 300, damping: 30 });
      backdropOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, product]);

  const dismiss = useCallback(() => {
    translateY.value = withSpring(SHEET_MAX_HEIGHT, { stiffness: 300, damping: 30 }, () => {
      runOnJS(onClose)();
    });
    backdropOpacity.value = withTiming(0, { duration: 200 });
  }, []);

  // 手势：下滑关闭
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(
          e.translationY,
          [0, DISMISS_THRESHOLD],
          [1, 0],
          Extrapolation.CLAMP,
        );
      }
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD || e.velocityY > 500) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withSpring(0, { stiffness: 300, damping: 30 });
        backdropOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!product) return null;

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
      product_id: product.id as any,
      product_name: product.name_cn,
      unit_price: unitPrice,
      quantity,
      options: optionsRecord,
      options_label: labels.join(' / '),
      image_url: product.image_url ?? undefined,
    });

    dismiss();
  };

  return (
    <>
      {/* Backdrop */}
      {visible && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40,
            },
            backdropStyle,
          ]}
        >
          <Pressable style={{ flex: 1 }} onPress={dismiss} />
        </Animated.View>
      )}

      {/* Sheet */}
      {visible && (
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                maxHeight: SHEET_MAX_HEIGHT,
                backgroundColor: '#fff',
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: 32,
                zIndex: 50,
              },
              sheetStyle,
            ]}
          >
            {/* 把手 */}
            <View className="items-center pt-3 pb-1">
              <View className="w-12 h-1 rounded-full bg-ink-200" />
            </View>

            {/* 标题区 */}
            <View className="px-5 pt-3 pb-3 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="text-xl font-bold text-ink-900">{product.name_cn}</Text>
                {product.description ? (
                  <Text className="text-xs text-ink-500 mt-1.5" numberOfLines={2}>
                    {product.description}
                  </Text>
                ) : null}
              </View>
              <Text className="text-xl font-bold text-brand-600 mt-0.5">
                {formatRM(product.price)}
              </Text>
            </View>

            {/* 真材展示 */}
            {product.fruit_info && product.fruit_info.length > 0 && (
              <View className="px-5 pb-3">
                <FruitInfo items={product.fruit_info} size="sm" />
              </View>
            )}

            {/* 选项分组 */}
            <ScrollView
              className="px-5"
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
            >
              {Object.entries(optionGroups).map(([type, opts]) => (
                <View key={type} className="mb-4">
                  <Text className="text-sm font-bold text-ink-900 mb-2">
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
              <View className="h-2" />
            </ScrollView>

            {/* 底部：数量 + 加入购物车 */}
            <View className="px-4 pt-3 flex-row items-center">
              <View className="flex-row items-center bg-ink-100 rounded-full mr-3">
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 items-center justify-center"
                  hitSlop={4}
                >
                  <Text className="text-xl text-ink-700">−</Text>
                </Pressable>
                <Text className="text-base font-bold text-ink-900 w-6 text-center">
                  {quantity}
                </Text>
                <Pressable
                  onPress={() => setQuantity((q) => Math.min(20, q + 1))}
                  className="w-10 h-10 items-center justify-center"
                  hitSlop={4}
                >
                  <Text className="text-xl text-ink-700">+</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleAddToCart}
                className="flex-1 bg-brand-500 active:bg-brand-600 rounded-full py-3 flex-row items-center justify-center"
              >
                <Text className="text-white font-bold text-base">
                  加入购物车 · {formatRM(totalPrice)}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </GestureDetector>
      )}
    </>
  );
}
