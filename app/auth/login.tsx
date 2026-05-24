import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Phone } from 'lucide-react-native';
import { authApi } from '../../src/api/auth';
import { useTheme } from '../../src/lib/theme';
import type { ApiError } from '../../src/api/client';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async () => {
    if (phone.length < 9) return;
    try {
      setLoading(true);
      await authApi.requestOtp(`+60${phone}`);
      router.push({ pathname: '/auth/verify', params: { phone: `+60${phone}` } });
    } catch (err) {
      Alert.alert('发送失败', (err as ApiError).message || '请稍后再试');
    } finally { setLoading(false); }
  };

  const bg = isDark ? '#171717' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';

  return (
    <View className="flex-1" style={{ backgroundColor: bg }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <Pressable onPress={() => router.back()} className="absolute top-14 left-4 z-10 w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: isDark ? '#404040' : '#f5f5f5' }} hitSlop={8}>
          <ArrowLeft size={20} color={isDark ? '#d4d4d4' : '#525252'} />
        </Pressable>

        <View className="flex-1 px-6 pt-24">
          <Text style={{ color: text }} className="text-3xl font-bold">登录 / 注册</Text>
          <Text style={{ color: sub }} className="text-base mt-2">用手机号一键登录，新用户自动注册</Text>

          <View className="mt-10">
            <Text style={{ color: text }} className="text-sm font-semibold mb-2">马来西亚手机号</Text>
            <View className="flex-row items-center rounded-2xl px-4 py-3" style={{ borderWidth: 1.5, borderColor: isDark ? '#404040' : '#e5e5e5', backgroundColor: isDark ? '#262626' : '#fff' }}>
              <Text style={{ color: sub }} className="text-base mr-2">+60</Text>
              <TextInput value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))} placeholder="123456789" placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
                keyboardType="phone-pad" className="flex-1 text-base py-1" style={{ color: text }} maxLength={10} autoFocus />
            </View>
            <Text style={{ color: sub }} className="text-xs mt-2">例如：123456789（不带前面的 0）</Text>
          </View>

          <View className="mt-6">
            <Pressable onPress={handleSubmit} disabled={phone.length < 9 || loading}
              className="rounded-2xl py-4 items-center flex-row justify-center"
              style={{ backgroundColor: phone.length >= 9 ? '#649b29' : (isDark ? '#404040' : '#d4d4d4') }}>
              <Phone size={18} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">{loading ? '发送中...' : '发送验证码'}</Text>
            </Pressable>
          </View>

          <Text style={{ color: sub }} className="text-xs text-center mt-6 leading-5">继续即代表同意《用户协议》和《隐私政策》</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
