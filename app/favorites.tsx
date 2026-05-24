import { View, Text, ScrollView, Pressable, Image, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Heart, ShoppingBag, Lock } from 'lucide-react-native';
import { favoritesApi, type FavoriteProduct } from '../src/api/favorites';
import { useAuthStore } from '../src/store/auth';
import { formatRM } from '../src/api/products';
import { useTheme } from '../src/lib/theme';

export default function FavoritesScreen() {
  const isAuthed = !!useAuthStore((s) => s.token);
  const { isDark } = useTheme();
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['favorites'], queryFn: () => favoritesApi.list(), enabled: isAuthed,
  });

  const removeMut = useMutation({
    mutationFn: (pid: string) => favoritesApi.remove(pid),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const favorites = data?.favorites ?? [];
  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';

  if (!isAuthed) {
    return (
      <View className="flex-1" style={{ backgroundColor: bg }}>
        <View className="px-5 pt-14 pb-4 flex-row items-center" style={{ backgroundColor: isDark ? '#171717' : '#fff', borderBottomWidth: 0.5, borderBottomColor: border }}>
          <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}><ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} /></Pressable>
          <Text style={{ color: text }} className="text-lg font-bold">我的收藏</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-5" style={{ backgroundColor: isDark ? '#262626' : '#e8f5e0' }}><Lock size={40} color="#649b29" /></View>
          <Text style={{ color: text }} className="text-lg font-bold">登录查看收藏</Text>
          <Pressable onPress={() => router.push('/auth/login')} className="mt-6 bg-brand-500 px-10 py-3 rounded-2xl"><Text className="text-white font-bold text-base">立即登录</Text></Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <View className="px-5 pt-14 pb-4 flex-row items-center" style={{ backgroundColor: isDark ? '#171717' : '#fff', borderBottomWidth: 0.5, borderBottomColor: border }}>
        <Pressable onPress={() => router.back()} className="w-9 h-9 rounded-full items-center justify-center mr-3" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}><ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} /></Pressable>
        <Text style={{ color: text }} className="text-lg font-bold">我的收藏{favorites.length > 0 ? ` · ${favorites.length}` : ''}</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center"><Text style={{ color: sub }}>加载中...</Text></View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: isDark ? '#262626' : '#e8f5e0' }}><ShoppingBag size={32} color="#649b29" /></View>
          <Text style={{ color: text }} className="font-bold">还没有收藏</Text>
          <Text style={{ color: sub }} className="text-sm mt-1 text-center">在菜单点 ❤️ 把最爱的存到这里</Text>
          <Pressable onPress={() => router.replace('/(tabs)/menu')} className="mt-5 bg-brand-500 px-8 py-2.5 rounded-2xl"><Text className="text-white font-bold">去看菜单</Text></Pressable>
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#649b29" />}>
          {favorites.map((p) => (
            <View key={p.id} className="mb-3 rounded-2xl flex-row p-3 items-center" style={{ backgroundColor: cardBg }}>
              <Pressable onPress={() => router.push(`/product/${p.id}`)} className="flex-row items-center flex-1">
                <View className="w-16 h-16 rounded-xl mr-3 items-center justify-center overflow-hidden" style={{ backgroundColor: isDark ? '#1a2e14' : '#e8f5e0' }}>
                  {p.image_url ? <Image source={{ uri: p.image_url }} style={{ width: 64, height: 64 }} resizeMode="cover" /> : <Text className="text-3xl">🥤</Text>}
                </View>
                <View className="flex-1">
                  <Text style={{ color: text }} className="text-base font-semibold" numberOfLines={1}>{p.name_cn}</Text>
                  {p.description_cn ? <Text style={{ color: sub }} className="text-xs mt-0.5" numberOfLines={1}>{p.description_cn}</Text> : null}
                  <View className="flex-row items-center mt-1">
                    <Text className="text-base font-bold text-brand-600">{formatRM(p.price)}</Text>
                    {!p.is_available ? <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}><Text style={{ color: sub }} className="text-xs">售罄</Text></View> : null}
                  </View>
                </View>
              </Pressable>
              <Pressable onPress={() => { Alert.alert('取消收藏？', `「${p.name_cn}」将从收藏中移除`, [{ text: '再想想', style: 'cancel' }, { text: '移除', style: 'destructive', onPress: () => removeMut.mutate(p.id) }]); }}
                className="w-9 h-9 rounded-full items-center justify-center ml-2" style={{ backgroundColor: isDark ? '#2a1010' : '#fef2f2' }}>
                <Heart size={16} color="#ef4444" fill="#ef4444" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
