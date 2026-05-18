import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../src/components/Screen';
import { Button } from '../../src/components/Button';
import { authApi } from '../../src/api/auth';
import type { ApiError } from '../../src/api/client';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length < 9) return;
    const fullPhone = `+60${phone}`;

    try {
      setLoading(true);
      await authApi.requestOtp(fullPhone);
      router.push({ pathname: '/auth/verify', params: { phone: fullPhone } });
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
        {/* 关闭按钮 */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full bg-ink-100 items-center justify-center"
          hitSlop={8}
        >
          <Text className="text-xl text-ink-900">×</Text>
        </Pressable>

        <View className="flex-1 px-6 pt-24">
          <Text className="text-3xl font-bold text-ink-900">登录 / 注册</Text>
          <Text className="text-base text-ink-500 mt-2">用手机号一键登录，新用户自动注册</Text>

          <View className="mt-10">
            <Text className="text-sm font-semibold text-ink-700 mb-2">马来西亚手机号</Text>
            <View className="flex-row items-center rounded-2xl border-2 border-ink-200 px-4 py-1 focus:border-brand-500">
              <Text className="text-base text-ink-700 mr-2">+60</Text>
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
                placeholder="123456789"
                placeholderTextColor="#a3a3a3"
                keyboardType="phone-pad"
                className="flex-1 text-base text-ink-900 py-2"
                maxLength={10}
                autoFocus
              />
            </View>
            <Text className="text-xs text-ink-400 mt-2">例如：123456789（不带前面的 0）</Text>
          </View>

          <View className="mt-6">
            <Button
              fullWidth
              disabled={phone.length < 9}
              loading={loading}
              onPress={handleSubmit}
            >
              发送验证码
            </Button>
          </View>

          <Text className="text-xs text-ink-400 text-center mt-6 leading-5">
            继续即代表同意《用户协议》和《隐私政策》
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
