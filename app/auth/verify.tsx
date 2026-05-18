import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { authApi } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/auth';
import type { ApiError } from '../../src/api/client';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(60);
  const setAuth = useAuthStore((s) => s.setAuth);
  const inputRef = useRef<TextInput>(null);

  // 倒计时
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  // 6 位输入自动提交
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify(otp);
    }
  }, [otp]);

  const handleVerify = async (code: string) => {
    try {
      setLoading(true);
      const res = await authApi.verifyOtp(phone!, code);
      if (res.success && res.token && res.user) {
        await setAuth(res.token, res.user);
        // 登录成功 → 回到上一个页面（购物车/结算/个人）
        router.replace('/(tabs)/menu');
      } else {
        Alert.alert('验证失败', '验证码错误，请重试');
        setOtp('');
      }
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('验证失败', apiErr.message || '请重试');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await authApi.requestOtp(phone!);
      setResendIn(60);
      Alert.alert('已重新发送', '请查收短信');
    } catch (err) {
      const apiErr = err as ApiError;
      Alert.alert('发送失败', apiErr.message || '请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        {/* 返回按钮 */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-ink-100 items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-xl text-ink-900">‹</Text>
        </Pressable>

        <View className="flex-1 px-6 pt-24">
          <Text className="text-3xl font-bold text-ink-900">输入验证码</Text>
          <Text className="text-base text-ink-500 mt-2">
            已发送至 <Text className="font-semibold text-ink-700">{phone}</Text>
          </Text>

          {/* 6 位输入框（虚拟的，实际是单 input） */}
          <Pressable onPress={() => inputRef.current?.focus()} className="mt-10">
            <View className="flex-row justify-between">
              {Array.from({ length: 6 }).map((_, i) => (
                <View
                  key={i}
                  className={`w-12 h-14 rounded-xl items-center justify-center border-2 ${
                    otp.length === i ? 'border-brand-500' : 'border-ink-200'
                  }`}
                >
                  <Text className="text-2xl font-bold text-ink-900">{otp[i] ?? ''}</Text>
                </View>
              ))}
            </View>
            <TextInput
              ref={inputRef}
              value={otp}
              onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad"
              autoFocus
              maxLength={6}
              caretHidden
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
            />
          </Pressable>

          {/* 重发 */}
          <View className="mt-8 items-center">
            {resendIn > 0 ? (
              <Text className="text-sm text-ink-400">{resendIn} 秒后可重新发送</Text>
            ) : (
              <Pressable onPress={handleResend} disabled={loading}>
                <Text className="text-sm text-brand-600 font-semibold">重新发送验证码</Text>
              </Pressable>
            )}
          </View>

          {loading && (
            <View className="mt-6">
              <Button loading fullWidth>
                验证中...
              </Button>
            </View>
          )}

          {/* DEV 提示 */}
          <View className="mt-12 p-4 rounded-2xl bg-ink-100">
            <Text className="text-xs text-ink-600 font-semibold mb-1">📝 开发提示</Text>
            <Text className="text-xs text-ink-500 leading-5">
              SMS 服务还没接通，OTP 在 Railway logs 里。{'\n'}
              避开真发短信，看 backend 部署日志找 `[DEV OTP]` 字样。
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
