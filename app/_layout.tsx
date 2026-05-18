import '../global.css';

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '../src/lib/queryClient';
import { useAuthStore } from '../src/store/auth';
import { useCartStore } from '../src/store/cart';
import { initPush, registerForPush } from '../src/lib/push';

export default function RootLayout() {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateCart = useCartStore((s) => s.hydrate);
  const token = useAuthStore((s) => s.token);

  // 启动时 hydrate + 初始化推送
  useEffect(() => {
    hydrateAuth().catch((e) => console.error('[hydrate auth]', e));
    hydrateCart().catch((e) => console.error('[hydrate cart]', e));
    initPush();
  }, [hydrateAuth, hydrateCart]);

  // 登录态变化 → 注册推送 token 到后端
  useEffect(() => {
    if (token) {
      registerForPush().catch((e) => console.warn('[push register]', e));
    }
  }, [token]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="auth/verify" />
            <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
            <Stack.Screen name="cart" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order/[id]" />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
