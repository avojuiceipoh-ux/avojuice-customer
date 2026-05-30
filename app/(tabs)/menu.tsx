import { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Milk,
  Coffee,
  Sparkles,
  Citrus,
  IceCream,
  CupSoda,
  Apple,
  Heart,
  type LucideIcon,
} from 'lucide-react-native';
import { Screen } from '../../src/components/Screen';
import { ProductSheet } from '../../src/components/ProductSheet';
import { productsApi, type Product, type Category, formatRM } from '../../src/api/products';
import { FruitInfoInline } from '../../src/components/FruitInfo';
import { ProductName } from '../../src/components/ProductName';
import { favoritesApi } from '../../src/api/favorites';
import { DEFAULT_OUTLET_ID } from '../../src/lib/env';
import { useCartStore } from '../../src/store/cart';
import { useAuthStore } from '../../src/store/auth';

// ─── Favourite 虚拟分类 ID（前端合成，不存数据库） ───
const FAVOURITE_CAT_ID = -1;

// ─── lucide 图标自动匹配（按分类名关键字） ───
//    以后 admin 可以加 category.icon 字段覆盖
function getCategoryIcon(name: string): LucideIcon {
  const n = (name || '').toLowerCase();
  if (n.includes('招牌') || n.includes('特调') || n.includes('signature')) return Sparkles;
  if (n.includes('奶昔') || n.includes('shake') || n.includes('smoothie')) return Milk;
  if (n.includes('奶') || n.includes('milk') || n.includes('酸奶') || n.includes('yogurt')) return Milk;
  if (n.includes('茶') || n.includes('tea')) return Coffee;
  if (n.includes('果汁') || n.includes('鲜榨') || n.includes('juice')) return Citrus;
  if (n.includes('冰沙') || n.includes('沙冰') || n.includes('ice') || n.includes('冰品')) return IceCream;
  if (n.includes('水果') || n.includes('fruit')) return Apple;
  return CupSoda;
}

export default function MenuScreen() {
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [sheetProduct, setSheetProduct] = useState<Product | null>(null);
  const cartCount = useCartStore((s) => s.count());
  const isAuthed = !!useAuthStore((s) => s.token);
  const qc = useQueryClient();

  // 右侧 ScrollView 引用 + 每个分类 section 的 Y 坐标
  const rightScrollRef = useRef<ScrollView>(null);
  const sectionYRef = useRef<Record<number, number>>({});
  const isProgrammaticScroll = useRef(false); // 点击 tab 触发滚动时，避免被自身 onScroll 联动覆盖

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['menu', DEFAULT_OUTLET_ID],
    queryFn: () => productsApi.getMenu(DEFAULT_OUTLET_ID),
  });
  const realCategories = data?.categories ?? [];

  // 收藏：登录后才查
  const { data: favData } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list(),
    enabled: isAuthed,
  });
  const favoritedIds = useMemo(
    () => new Set((favData?.favorites ?? []).map((f) => f.id)),
    [favData],
  );

  // 把收藏拼成第一个虚拟分类（id = FAVOURITE_CAT_ID）
  const categories: Category[] = useMemo(() => {
    const allProducts = realCategories.flatMap((c) => c.products);
    const favProducts = allProducts.filter((p) => favoritedIds.has(p.id));
    const favCategory: Category = {
      id: FAVOURITE_CAT_ID,
      name_cn: 'Favourite',
      name_en: 'Favourite',
      sort_order: -1,
      products: favProducts,
    };
    return [favCategory, ...realCategories];
  }, [realCategories, favoritedIds]);

  const toggleFav = useMutation({
    mutationFn: async ({ id, currentlyFav }: { id: string; currentlyFav: boolean }) => {
      if (currentlyFav) await favoritesApi.remove(id);
      else await favoritesApi.add(id);
    },
    onMutate: async ({ id, currentlyFav }) => {
      await qc.cancelQueries({ queryKey: ['favorites'] });
      const previous = qc.getQueryData(['favorites']);
      qc.setQueryData(['favorites'], (old: any) => {
        // 即使首次 GET 还没回，也初始化一个空缓存，保证 UI 立刻能反馈
        const base = old ?? { success: true, favorites: [], count: 0 };
        const list = base.favorites ?? [];
        const next = currentlyFav
          ? list.filter((f: any) => f.id !== id)
          : [...list, { id }];
        return { ...base, favorites: next, count: next.length };
      });
      return { previous };
    },
    onError: (_e, _v, ctx) => { if (ctx?.previous) qc.setQueryData(['favorites'], ctx.previous); },
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handleToggleFav = (pid: string) => {
    if (!isAuthed) { router.push('/auth/login'); return; }
    toggleFav.mutate({ id: pid, currentlyFav: favoritedIds.has(pid) });
  };

  // 点左侧 tab → 滚到对应分类
  const scrollToCategory = (catId: number) => {
    const y = sectionYRef.current[catId] ?? 0;
    setActiveCategoryId(catId);
    isProgrammaticScroll.current = true;
    rightScrollRef.current?.scrollTo({ y, animated: true });
    // 程序滚动完成后解除标记
    setTimeout(() => { isProgrammaticScroll.current = false; }, 500);
  };

  // 监听右侧滚动 → 自动找当前分类 + 高亮左侧 tab
  const onRightScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const scrollY = e.nativeEvent.contentOffset.y + 40; // 偏 40px 让"将要进入视口"的分类提前高亮
    let nextActive: number | null = null;
    for (const cat of categories) {
      const y = sectionYRef.current[cat.id];
      if (y == null) continue;
      if (y <= scrollY) nextActive = cat.id;
      else break;
    }
    if (nextActive != null && nextActive !== activeCategoryId) {
      setActiveCategoryId(nextActive);
    }
  };

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
          {/* 左边：分类 tab — 固定尺寸 + lucide icon + 滚动联动高亮 */}
          <View className="w-24 bg-ink-100">
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map((cat) => {
                const active = cat.id === (activeCategoryId ?? categories[0]?.id);
                const Icon = cat.id === FAVOURITE_CAT_ID ? Heart : getCategoryIcon(cat.name_cn);
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => scrollToCategory(cat.id)}
                    style={{
                      height: 76,        // 固定高度
                      width: '100%',
                      paddingHorizontal: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? '#fff' : 'transparent',
                      borderLeftWidth: active ? 4 : 0,
                      borderLeftColor: '#52c41a',
                    }}
                  >
                    <Icon
                      size={20}
                      color={
                        cat.id === FAVOURITE_CAT_ID
                          ? active ? '#ef4444' : '#a3a3a3'
                          : active ? '#52c41a' : '#737373'
                      }
                      fill={
                        cat.id === FAVOURITE_CAT_ID && active ? '#ef4444' : 'none'
                      }
                    />
                    <Text
                      style={{ marginTop: 4, fontSize: 12, textAlign: 'center' }}
                      className={active ? 'text-brand-600 font-bold' : 'text-ink-700 font-medium'}
                      numberOfLines={1}
                    >
                      {cat.name_cn}
                    </Text>
                  </Pressable>
                );
              })}
              {/* 底部留白 */}
              <View style={{ height: 80 }} />
            </ScrollView>
          </View>

          {/* 右边：纵向滚动所有分类（每个分类一个 section） */}
          <ScrollView
            ref={rightScrollRef}
            className="flex-1 bg-white"
            scrollEventThrottle={16}
            onScroll={onRightScroll}
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#52c41a" />
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {categories.map((cat) => {
              const isFavCat = cat.id === FAVOURITE_CAT_ID;
              return (
                <View
                  key={cat.id}
                  onLayout={(e: LayoutChangeEvent) => {
                    sectionYRef.current[cat.id] = e.nativeEvent.layout.y;
                  }}
                >
                  {/* 分类标题 — 固定高度，icon 区也固定宽度，保证所有分类视觉一致 */}
                  <View
                    className="px-4 bg-white flex-row items-center"
                    style={{ height: 56 }}
                  >
                    {/* icon 槽位：固定宽 22px，没图标就空着，标题文字位置永远一致 */}
                    <View style={{ width: 22, alignItems: 'flex-start', justifyContent: 'center' }}>
                      {isFavCat ? (
                        <Heart size={16} color="#ef4444" fill="#ef4444" />
                      ) : null}
                    </View>
                    <Text className="text-lg font-bold text-ink-900">{cat.name_cn}</Text>
                  </View>

                  {/* Favourite 分类的空状态（未登录 / 无收藏） */}
                  {isFavCat && cat.products.length === 0 ? (
                    <View className="px-4 pb-5">
                      {!isAuthed ? (
                        <Pressable
                          onPress={() => router.push('/auth/login')}
                          className="bg-ink-50 active:bg-ink-100 rounded-2xl px-4 py-5 items-center"
                        >
                          <Text className="text-ink-700 font-medium">登录后查看收藏</Text>
                          <Text className="text-xs text-ink-500 mt-1">点这里去登录 →</Text>
                        </Pressable>
                      ) : (
                        <View className="bg-ink-50 rounded-2xl px-4 py-5 items-center">
                          <Heart size={28} color="#a3a3a3" strokeWidth={1.8} />
                          <Text className="text-ink-700 font-medium mt-2">还没有收藏</Text>
                          <Text className="text-xs text-ink-500 mt-1">
                            在喜欢的产品上点心形按钮收藏
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : !isFavCat && cat.products.length === 0 ? (
                    <Text className="text-xs text-ink-400 px-4 pb-3">这个分类暂无产品</Text>
                  ) : null}

                  {/* 产品列表 */}
                  {cat.products.map((p, idx) => (
                    <View key={`${cat.id}-${p.id}`}>
                      <ProductRow
                        product={p}
                        onPlusPress={() => setSheetProduct(p)}
                        favorited={favoritedIds.has(p.id)}
                        onToggleFav={() => handleToggleFav(p.id)}
                      />
                      {idx < cat.products.length - 1 && (
                        <View className="h-px bg-ink-100 ml-24" />
                      )}
                    </View>
                  ))}
                </View>
              );
            })}
          </ScrollView>
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
  favorited,
  onToggleFav,
}: {
  product: Product;
  onPlusPress: () => void;
  favorited: boolean;
  onToggleFav: () => void;
}) {
  // View 包外，三个 Pressable 物理不重叠 — 避免触摸冲突
  return (
    <View className="flex-row px-3 py-3 relative">
      {/* 左半：图 + 文字 → 跳详情（占满除右边 56px 之外的宽度） */}
      <Pressable
        onPress={() => router.push(`/product/${product.id}`)}
        className="flex-row flex-1 active:bg-ink-50 rounded-lg"
        style={{ marginRight: 56 }}
      >
        <View className="w-20 h-20 rounded-xl bg-brand-50 items-center justify-center mr-3">
          {product.image_url ? (
            <Image source={{ uri: product.image_url }} className="w-20 h-20 rounded-xl" />
          ) : (
            <Text className="text-3xl">🥤</Text>
          )}
        </View>
        <View className="flex-1 justify-between py-1">
          <View>
            <ProductName
              name={product.name_cn}
              size="md"
              layout="stack"
              mainStyle={{ color: '#1a1a1a' }}
              subStyle={{ color: '#737373' }}
              numberOfLines={1}
            />
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

      {/* 收藏按钮 — 右上角，干净的 lucide Heart，无背景圈 */}
      <Pressable
        onPress={onToggleFav}
        hitSlop={14}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
      >
        <Heart
          size={22}
          color={favorited ? '#ef4444' : '#737373'}
          fill={favorited ? '#ef4444' : 'none'}
          strokeWidth={2.4}
        />
      </Pressable>

      {/* + 号按钮 — 右下角 */}
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
