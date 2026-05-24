import { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { authApi } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/auth';
import { useTheme } from '../../src/lib/theme';
import type { ApiError } from '../../src/api/client';

export default function VerifyScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(60);
  const setAuth = useAuthStore((s) => s.setAuth);
  const inputRef = useRef<TextInput>(null);
  const { isDark } = useTheme();

  useEffect(() => { if (resendIn <= 0) return; const t = setTimeout(() => setResendIn((n) => n - 1), 1000); return () => clearTimeout(t); }, [resendIn]);
  useEffect(() => { if (otp.length === 6) handleVerify(otp); }, [otp]);

  const handleVerify = async (code: string) => {
    try { setLoading(true); const res = await authApi.verifyOtp(phone!, code);
      if (res.success && res.token && res.user) { await setAuth(res.token, res.user); router.replace('/(tabs)/home'); }
      else { Alert.alert('验证失败', '验证码错误，请重试'); setOtp(''); }
    } catch (err) { Alert.alert('验证失败', (err as ApiError).message || '请重试'); setOtp(''); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { setLoading(true); await authApi.requestOtp(phone!); setResendIn(60); Alert.alert('已重新发送', '请查收短信'); }
    catch (err) { Alert.alert('发送失败', (err as ApiError).message || '请稍后再试'); }
    finally { setLoading(false); }
  };

  const bg = isDark ? '#171717' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <Pressable onPress={() => router.back()} className="absolute top-14 left-4 z-10 w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }} hitSlop={8}>
          <ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} />
        </Pressable>

        <View className="flex-1 px-6 pt-24">
          <Text style={{ color: text }} className="text-3xl font-bold">输入验证码</Text>
          <Text style={{ color: sub }} className="text-base mt-2">已发送至 <Text style={{ color: text }} className="font-semibold">{phone}</Text></Text>

          <Pressable onPress={() => inputRef.current?.focus()} className="mt-10">
            <View className="flex-row justify-between">
              {Array.from({ length: 6 }).map((_, i) => {
                const active = otp.length === i;
                return (
                  <View key={i} className="w-12 h-14 rounded-xl items-center justify-center"
                    style={{ borderWidth: 1.5, borderColor: active ? '#649b29' : border, backgroundColor: isDark ? '#262626' : '#fff' }}>
                    <Text style={{ color: text }} className="text-2xl font-bold">{otp[i] ?? ''}</Text>
                  </View>
                );
              })}
            </View>
            <TextInput ref={inputRef} value={otp} onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
              keyboardType="number-pad" autoFocus maxLength={6} caretHidden
              style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} />
          </Pressable>

          <View className="mt-8 items-center">
            {resendIn > 0 ? <Text style={{ color: sub }} className="text-sm">{resendIn} 秒后可重新发送</Text> : (
              <Pressable onPress={handleResend} disabled={loading}><Text className="text-brand-600 text-sm font-semibold">重新发送验证码</Text></Pressable>
            )}
          </View>

          {loading && (
            <View className="mt-6 rounded-2xl py-4 items-center" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }}>
              <Text style={{ color: sub }}>验证中...</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
