import { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart } from 'lucide-react-native';
import { productsApi, formatRM, toPrice, type Product, type ProductOption, type VariantGroup, type VariantOption, type ModifierGroup, type ModifierItem } from '../../src/api/products';
import { favoritesApi } from '../../src/api/favorites';
import { DEFAULT_OUTLET_ID } from '../../src/lib/env';
import { useCartStore } from '../../src/store/cart';
import { useAuthStore } from '../../src/store/auth';
import { FruitInfo } from '../../src/components/FruitInfo';
import { ProductName } from '../../src/components/ProductName';
import { useTheme } from '../../src/lib/theme';

const OPTION_TYPE_LABELS: Record<string, string> = { sweetness: '甜度', ice: '冰量' };

export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, ProductOption>>({});
  const [variantSelected, setVariantSelected] = useState<Record<string, VariantOption>>({});
  const [modifierSelected, setModifierSelected] = useState<Record<string, ModifierItem[]>>({});
  const isAuthed = !!useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['menu', DEFAULT_OUTLET_ID], queryFn: () => productsApi.getMenu(DEFAULT_OUTLET_ID) });
  const { data: favData } = useQuery({ queryKey: ['favorites'], queryFn: () => favoritesApi.list(), enabled: isAuthed });
  const isFavorited = (favData?.favorites ?? []).some((f) => f.id === id);

  const toggleFav = useMutation({
    mutationFn: async () => { if (isFavorited) await favoritesApi.remove(id!); else await favoritesApi.add(id!); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const product = useMemo<Product | null>(() => {
    if (!data) return null;
    for (const cat of data.categories) { const p = cat.products.find((x) => x.id === id); if (p) return p; }
    return null;
  }, [data, id]);

  const optionGroups = useMemo(() => {
    if (!product) return {};
    return product.options.reduce<Record<string, ProductOption[]>>((acc, o) => { (acc[o.type] = acc[o.type] || []).push(o); return acc; }, {});
  }, [product]);

  useMemo(() => {
    if (!product || Object.keys(selected).length) return;
    const defaults: Record<string, ProductOption> = {};
    Object.entries(optionGroups).forEach(([type, opts]) => { const def = opts.find((o) => o.is_default) ?? opts[0]; if (def) defaults[type] = def; });
    setSelected(defaults);
  }, [product, optionGroups]);

  // V2 变量默认选中
  useMemo(() => {
    if (!product?.variant_groups?.length || Object.keys(variantSelected).length) return;
    const defs: Record<string, VariantOption> = {};
    product.variant_groups.forEach((vg) => {
      const opts = vg.options || [];
      const def = opts.find((o) => o.is_default) ?? opts[0];
      if (def) defs[vg.name] = def;
    });
    setVariantSelected(defs);
  }, [product]);

  const bg = isDark ? '#171717' : '#fff';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';

  if (isLoading) return <View className="flex-1 items-center justify-center" style={{ backgroundColor: bg }}><Text style={{ color: sub }}>加载中...</Text></View>;
  if (!product) return (
    <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: bg }}>
      <Text style={{ color: sub }}>没找到这个产品</Text>
      <Pressable onPress={() => router.back()} className="mt-4 bg-brand-500 px-8 py-3 rounded-2xl"><Text className="text-white font-bold">返回菜单</Text></Pressable>
    </View>
  );

  const unitPrice = toPrice(product.price);
  // 含变量和加料的最终单价
  const variantExtra = Object.values(variantSelected).reduce((s, v) => s + (v.price_delta || 0), 0);
  const modifierExtra = Object.values(modifierSelected).flat().reduce((s, m) => s + (m.price || 0), 0);
  const finalUnitPrice = unitPrice + variantExtra + modifierExtra;
  const totalPrice = finalUnitPrice * quantity;

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* 图片区 */}
        <View className="h-72 items-center justify-center relative" style={{ backgroundColor: isDark ? '#1a2e14' : '#e8f5e0' }}>
          {product.image_url ? <Image source={{ uri: product.image_url }} className="w-full h-72" resizeMode="cover" /> : <Text className="text-8xl">🥤</Text>}
          <Pressable onPress={() => router.back()} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-white/90 items-center justify-center">
            <ArrowLeft size={18} color="#404040" />
          </Pressable>
          <Pressable
            onPress={() => { if (!isAuthed) { router.push('/auth/login'); return; } toggleFav.mutate(); }}
            hitSlop={14}
            style={{ position: 'absolute', top: 48, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Heart size={18} color={isFavorited ? '#ef4444' : '#a3a3a3'} fill={isFavorited ? '#ef4444' : 'none'} />
          </Pressable>
        </View>

        {/* 标题 + 简短描述 + 价格 */}
        <View className="px-5 pt-5">
          <ProductName
            name={product.name_cn}
            size="xl"
            layout="stack"
            mainStyle={{ color: text }}
            subStyle={{ color: sub }}
          />
          {product.name_en ? <Text style={{ color: sub }} className="text-sm mt-1">{product.name_en}</Text> : null}
          {/* 简短描述 — 紧贴标题下，作为副标题 */}
          {product.short_desc ? (
            <Text style={{ color: sub }} className="text-sm mt-2 leading-5">{product.short_desc}</Text>
          ) : null}
          <Text className="text-2xl font-bold text-brand-600 mt-3">{formatRM(product.price)}</Text>
          {/* 长描述（V1 兼容字段，已有的产品） */}
          {product.description ? <Text style={{ color: sub }} className="text-sm mt-3 leading-5">{product.description}</Text> : null}
          {product.fruit_info && product.fruit_info.length > 0 && (
            <View className="mt-4 p-4 rounded-2xl" style={{ backgroundColor: isDark ? '#2a3320' : '#e8f5e0' }}>
              <FruitInfo items={product.fruit_info} size="md" />
              <Text className="text-brand-600 text-xs mt-2 leading-4">💚 我们坚持真果制作，不含浓缩果汁</Text>
            </View>
          )}
          {/* 产品故事 — 大段叙事，强化品牌感 */}
          {product.story ? (
            <View
              className="mt-4 p-4 rounded-2xl"
              style={{ backgroundColor: isDark ? '#1f1f1f' : '#fafafa', borderWidth: 1, borderColor: isDark ? '#2a2a2a' : '#f0f0f0' }}
            >
              <Text style={{ color: '#649b29' }} className="text-xs font-bold mb-2 tracking-wider">🥑 产品故事</Text>
              <Text style={{ color: text }} className="text-sm leading-6">{product.story}</Text>
            </View>
          ) : null}
        </View>

        {/* 选项（旧版 product_options） */}
        <View className="px-5 mt-6">
          {Object.entries(optionGroups).map(([type, opts]) => (
            <View key={type} className="mb-5">
              <Text style={{ color: text }} className="text-sm font-bold mb-3">{OPTION_TYPE_LABELS[type] ?? type}</Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {opts.map((o) => {
                  const active = selected[type]?.id === o.id;
                  return (
                    <Pressable key={o.id} onPress={() => setSelected((s) => ({ ...s, [type]: o }))}
                      className={`px-4 py-2 rounded-full border ${active ? 'bg-brand-500 border-brand-500' : 'border-ink-200'}`}
                      style={{ backgroundColor: active ? '#649b29' : cardBg, borderColor: active ? '#649b29' : (isDark ? '#404040' : '#e5e5e5') }}>
                      <Text className={`text-sm ${active ? 'text-white font-semibold' : ''}`} style={{ color: active ? '#fff' : text }}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* V2 变量组 */}
          {(product.variant_groups ?? []).map((vg) => (
            <View key={`vg-${vg.id}`} className="mb-5">
              <Text style={{ color: text }} className="text-sm font-bold mb-3">
                {vg.name} {vg.is_required ? <Text className="text-red-500">*必选</Text> : null}
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {(vg.options || []).map((vo) => {
                  const active = variantSelected[vg.name]?.id === vo.id;
                  return (
                    <Pressable key={vo.id} onPress={() => setVariantSelected((s) => ({ ...s, [vg.name]: vo }))}
                      className={`px-4 py-2 rounded-full border ${active ? 'bg-brand-500 border-brand-500' : 'border-ink-200'}`}
                      style={{ backgroundColor: active ? '#649b29' : cardBg, borderColor: active ? '#649b29' : (isDark ? '#404040' : '#e5e5e5') }}>
                      <Text className={`text-sm ${active ? 'text-white font-semibold' : ''}`} style={{ color: active ? '#fff' : text }}>
                        {vo.label}{vo.price_delta !== 0 ? (vo.price_delta > 0 ? ` +RM${vo.price_delta}` : ` -RM${Math.abs(vo.price_delta)}`) : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* V2 加料组 */}
          {(product.modifier_groups ?? []).map((mg) => (
            <View key={`mg-${mg.id}`} className="mb-5">
              <Text style={{ color: text }} className="text-sm font-bold mb-3">
                {mg.name} <Text style={{ color: sub, fontSize: 11 }}>({mg.selection_type === 'single' ? '单选' : `多选 ${mg.min_select}-${mg.max_select}`})</Text>
              </Text>
              <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                {(mg.items || []).map((mi) => {
                  const cur = modifierSelected[mg.name] ?? [];
                  const active = cur.some((x) => x.id === mi.id);
                  return (
                    <Pressable key={mi.id}
                      onPress={() => {
                        setModifierSelected((s) => {
                          const cur = s[mg.name] ?? [];
                          if (active) return { ...s, [mg.name]: cur.filter((x) => x.id !== mi.id) };
                          if (mg.selection_type === 'single') return { ...s, [mg.name]: [mi] };
                          if (cur.length >= mg.max_select) return s;
                          return { ...s, [mg.name]: [...cur, mi] };
                        });
                      }}
                      className={`px-4 py-2 rounded-full border ${active ? 'bg-brand-500 border-brand-500' : 'border-ink-200'}`}
                      style={{ backgroundColor: active ? '#649b29' : cardBg, borderColor: active ? '#649b29' : (isDark ? '#404040' : '#e5e5e5') }}>
                      <Text className={`text-sm ${active ? 'text-white font-semibold' : ''}`} style={{ color: active ? '#fff' : text }}>
                        {mi.label} +RM{mi.price}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 底部 */}
      <View className="absolute bottom-0 left-0 right-0 px-4 pt-3 pb-8" style={{ backgroundColor: isDark ? '#171717' : '#fff', borderTopWidth: 0.5, borderTopColor: isDark ? '#404040' : '#e5e5e5' }}>
        <View className="flex-row items-center">
          <View className="flex-row items-center rounded-full mr-3" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}>
            <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} className="w-9 h-9 items-center justify-center"><Minus size={14} color={isDark ? '#a3a3a3' : '#737373'} /></Pressable>
            <Text style={{ color: text }} className="text-base font-bold w-6 text-center">{quantity}</Text>
            <Pressable onPress={() => setQuantity((q) => Math.min(20, q + 1))} className="w-9 h-9 items-center justify-center"><Plus size={14} color={isDark ? '#a3a3a3' : '#737373'} /></Pressable>
          </View>
          <Pressable
            onPress={async () => {
              const optionsRecord: Record<string, string> = {}; const labels: string[] = [];
              Object.values(selected).forEach((o) => { optionsRecord[o.type] = o.label; labels.push(o.label); });
              // V2 变量和加料并入 options
              Object.values(variantSelected).forEach((v) => { optionsRecord[`var_${v.id}`] = v.label; labels.push(v.label); });
              Object.values(modifierSelected).flat().forEach((m) => { optionsRecord[`mod_${m.id}`] = m.label; labels.push(`+${m.label}`); });
              await useCartStore.getState().add({ cart_id: `${product.id}__${Object.values(optionsRecord).join('_')}`, product_id: product.id as any, product_name: product.name_cn, unit_price: finalUnitPrice, quantity, options: optionsRecord, options_label: labels.join(' / '), image_url: product.image_url ?? undefined });
              router.back();
            }}
            className="flex-1 bg-brand-500 rounded-full py-3 flex-row items-center justify-center"
            style={{ shadowColor: '#649b29', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } }}
          >
            <ShoppingCart size={18} color="#fff" />
            <Text className="text-white font-bold text-base ml-2">加入购物车 · {formatRM(totalPrice)}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
