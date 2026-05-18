/**
 * ProductSheet — 菜单页 + 号弹出的底部浮层
 *
 * 客户不用跳详情页，直接选 甜度 / 冰量 / 数量，一键加入购物车。
 * 详情页保留给"想看大图、读描述"的用户。
 */

import { useState, useMemo, useEffect } from 'react';
import { View, Text, Modal, Pressable, ScrollView } from 'react-native';
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

interface Props {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
}

export function ProductSheet({ product, visible, onClose }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, ProductOption>>({});

  // 按 type 分组（保留后端顺序）
  const optionGroups = useMemo(() => {
    if (!product) return {};
    return product.options.reduce<Record<string, ProductOption[]>>((acc, o) => {
      (acc[o.type] = acc[o.type] || []).push(o);
      return acc;
    }, {});
  }, [product]);

  // 每次打开重置选项 + 数量
  useEffect(() => {
    if (!visible || !product) return;
    const defaults: Record<string, ProductOption> = {};
    Object.entries(optionGroups).forEach(([type, opts]) => {
      const def = opts.find((o) => o.is_default) ?? opts[0];
      if (def) defaults[type] = def;
    });
    setSelected(defaults);
    setQuantity(1);
  }, [visible, product, optionGroups]);

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

    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* backdrop — 点击关闭 */}
      <Pressable onPress={onClose} className="flex-1 bg-black/50 justify-end">
        {/* 卡片内容 — Pressable 阻止点击穿透到 backdrop */}
        <Pressable onPress={() => {}}>
          <View className="bg-white rounded-t-3xl pb-8">
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

            {/* 选项分组 — 内容多时可滚动 */}
            <ScrollView
              className="px-5"
              style={{ maxHeight: 320 }}
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
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
