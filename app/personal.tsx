import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Camera, ChevronRight, User, Phone, Mail,
  Calendar, VenusAndMars, Check, CupSoda, Crown,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '../src/lib/theme';
import { walletApi } from '../src/api/wallet';

export default function PersonalScreen() {
  const { isDark } = useTheme();

  const bg = isDark ? '#171717' : '#f5f8f0';
  const cardBg = isDark ? '#262626' : '#fff';
  const text = isDark ? '#fafafa' : '#1a1a1a';
  const sub = isDark ? '#a3a3a3' : '#737373';
  const border = isDark ? '#404040' : '#e5e5e5';
  const brandGreen = '#649b29';

  const [walletCups, setWalletCups] = useState<number | null>(null);

  useEffect(() => {
    walletApi.get().then(res => setWalletCups(res.cups_total)).catch(() => {});
  }, []);

  const cups = walletCups ?? 0;

  // 会员等级计算
  const TIERS = [
    { name: '爱·初芽', emoji: '🌱', min: 0,  max: 14,  color: '#a8d88a', bg: '#3d6b1e' },
    { name: '我·成长', emoji: '🥑', min: 15, max: 89,  color: '#649b29', bg: '#2d4a0e' },
    { name: '果·绽放', emoji: '🌟', min: 90, max: 299, color: '#f59e0b', bg: '#78350f' },
    { name: '饮·圆满', emoji: '👑', min: 300, max: Infinity, color: '#f0c040', bg: '#3d2600' },
  ];
  const currentTier = [...TIERS].reverse().find(t => cups >= t.min) || TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1] || null;
  const cupsToNext = nextTier ? nextTier.min - cups : 0;

  // 可编辑字段
  const [name, setName] = useState('Andrew Heng');
  const [phone, setPhone] = useState('012-345 6789');
  const [email, setEmail] = useState('andrew@avojuice.com');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthday, setBirthday] = useState<string | null>(null);
  const [birthdayEditing, setBirthdayEditing] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [genderEditing, setGenderEditing] = useState(false);

  // 编辑状态
  const [editing, setEditing] = useState<string | null>(null);

  const handleBirthdayTap = () => {
    if (birthday) {
      Alert.alert('生日已设定', '生日一旦设定后不可修改');
      return;
    }
    setBirthdayEditing(true);
  };

  const confirmBirthday = () => {
    // 验证格式 YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthdayInput)) {
      Alert.alert('格式错误', '请输入 YYYY-MM-DD 格式，例如 2002-03-15');
      return;
    }
    const [y, m, d] = birthdayInput.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
      Alert.alert('无效日期', '请输入真实存在的日期');
      return;
    }
    if (y < 1900 || y > new Date().getFullYear()) {
      Alert.alert('年份超出范围', '请输入合理的出生年份');
      return;
    }
    setBirthday(birthdayInput);
    setBirthdayEditing(false);
  };

  const genderLabel = gender === 'male' ? '男' : gender === 'female' ? '女' : null;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: bg }}>
      {/* Header */}
      <View className="px-5 pt-3 pb-3 flex-row items-center justify-between">
        <Pressable
          className="w-9 h-9 rounded-full items-center justify-center"
          style={{ backgroundColor: cardBg }}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={text} />
        </Pressable>
        <Text style={{ color: text }} className="text-xl font-bold">个人信息</Text>
        <View className="w-9" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* 头像 */}
        <View className="items-center mt-4 mb-6">
          <Pressable className="relative">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: isDark ? '#2a3320' : '#e8f5e0' }}
            >
              <User size={40} color="#649b29" />
            </View>
            <View
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: brandGreen, borderWidth: 3, borderColor: bg }}
            >
              <Camera size={14} color="#fff" />
            </View>
          </Pressable>
          <Text style={{ color: sub }} className="text-xs mt-2">点击更换照片</Text>
        </View>

        {/* 会员卡片 */}
        <View className="px-5 mb-5">
          <Pressable
            className="rounded-2xl p-4 flex-row items-center"
            style={{ backgroundColor: currentTier.bg }}
            onPress={() => router.push('/membership' as any)}
          >
            <Text className="text-3xl">{currentTier.emoji}</Text>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center">
                <Crown size={14} color={currentTier.color} />
                <Text style={{ color: currentTier.color }} className="text-sm font-bold ml-1.5">
                  {currentTier.name}
                </Text>
              </View>
              <View className="flex-row items-center mt-1">
                <CupSoda size={14} color="rgba(255,255,255,0.6)" />
                <Text className="text-white/60 text-xs ml-1">
                  {cups} 杯 · {cupsToNext > 0 ? `再集 ${cupsToNext} 杯升「${nextTier?.name}」` : '已达最高等级'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </Pressable>
        </View>

        {/* 表单卡片 */}
        <View className="px-5">
          <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg }}>
            {/* 名字 */}
            <Pressable
              className="flex-row items-center px-4 py-4 border-b"
              style={{ borderBottomColor: border }}
              onPress={() => setEditing(editing === 'name' ? null : 'name')}
            >
              <User size={20} color={sub} />
              <View className="flex-1 ml-3">
                <Text style={{ color: sub }} className="text-xs">名字</Text>
                {editing === 'name' ? (
                  <TextInput
                    className="text-base font-semibold mt-0.5"
                    style={{ color: text, padding: 0 }}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                    onBlur={() => setEditing(null)}
                    onSubmitEditing={() => setEditing(null)}
                  />
                ) : (
                  <Text style={{ color: text }} className="text-base font-semibold">{name}</Text>
                )}
              </View>
              <Check size={16} color={editing === 'name' ? brandGreen : 'transparent'} />
            </Pressable>

            {/* 手机号 — 注册后不可修改 */}
            <View
              className="flex-row items-center px-4 py-4 border-b"
              style={{ borderBottomColor: border }}
            >
              <Phone size={20} color={sub} />
              <View className="flex-1 ml-3">
                <Text style={{ color: sub }} className="text-xs">手机号</Text>
                <Text style={{ color: text }} className="text-base font-semibold">{phone}</Text>
              </View>
              <View
                className="rounded-full px-2 py-0.5"
                style={{ backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)' }}
              >
                <Text style={{ color: '#d4a853' }} className="text-[10px] font-semibold">不可修改</Text>
              </View>
            </View>

            {/* Email */}
            <Pressable
              className="flex-row items-center px-4 py-4 border-b"
              style={{ borderBottomColor: border }}
              onPress={() => setEditing(editing === 'email' ? null : 'email')}
            >
              <Mail size={20} color={sub} />
              <View className="flex-1 ml-3">
                <Text style={{ color: sub }} className="text-xs">Email</Text>
                {editing === 'email' ? (
                  <TextInput
                    className="text-base font-semibold mt-0.5"
                    style={{ color: text, padding: 0 }}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoFocus
                    onBlur={() => setEditing(null)}
                    onSubmitEditing={() => setEditing(null)}
                  />
                ) : (
                  <Text style={{ color: text }} className="text-base font-semibold">{email}</Text>
                )}
              </View>
              <Check size={16} color={editing === 'email' ? brandGreen : 'transparent'} />
            </Pressable>

            {/* 性别 — 设定后不可修改 */}
            <Pressable
              className="flex-row items-center px-4 py-4 border-b"
              style={{ borderBottomColor: border }}
              onPress={() => {
                if (gender) return; // 已设定，不可改
                setGenderEditing(!genderEditing);
              }}
            >
              <VenusAndMars size={20} color={sub} />
              <View className="flex-1 ml-3">
                <Text style={{ color: sub }} className="text-xs">性别</Text>
                {genderEditing ? (
                  <View className="flex-row mt-1" style={{ gap: 12 }}>
                    <Pressable
                      className="rounded-full px-4 py-1.5"
                      style={{ backgroundColor: brandGreen }}
                      onPress={() => { setGender('male'); setGenderEditing(false); }}
                    >
                      <Text className="text-white text-sm font-bold">♂ 男</Text>
                    </Pressable>
                    <Pressable
                      className="rounded-full px-4 py-1.5"
                      style={{ backgroundColor: brandGreen }}
                      onPress={() => { setGender('female'); setGenderEditing(false); }}
                    >
                      <Text className="text-white text-sm font-bold">♀ 女</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Text style={{ color: gender ? text : sub }} className="text-base font-semibold">
                    {genderLabel || '未设定'}
                  </Text>
                )}
              </View>
              {genderLabel ? (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)' }}
                >
                  <Text style={{ color: '#d4a853' }} className="text-[10px] font-semibold">不可修改</Text>
                </View>
              ) : (
                <ChevronRight size={16} color={sub} />
              )}
            </Pressable>

            {/* 生日 */}
            <Pressable
              className="flex-row items-center px-4 py-4"
              onPress={handleBirthdayTap}
            >
              <Calendar size={20} color={sub} />
              <View className="flex-1 ml-3">
                <Text style={{ color: sub }} className="text-xs">生日</Text>
                {birthdayEditing ? (
                  <View className="flex-row items-center mt-1">
                    <TextInput
                      className="flex-1 text-base font-semibold"
                      style={{ color: text, padding: 0 }}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={sub}
                      value={birthdayInput}
                      onChangeText={setBirthdayInput}
                      keyboardType="numbers-and-punctuation"
                      autoFocus
                      maxLength={10}
                    />
                    <Pressable
                      className="w-8 h-8 rounded-full items-center justify-center ml-2"
                      style={{ backgroundColor: brandGreen }}
                      onPress={confirmBirthday}
                    >
                      <Check size={16} color="#fff" />
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-row items-center">
                    <Text style={{ color: birthday ? text : sub }} className="text-base font-semibold">
                      {birthday || '未设定'}
                    </Text>
                    {birthday && (
                      <View
                        className="rounded-full px-2 py-0.5 ml-2"
                        style={{ backgroundColor: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)' }}
                      >
                        <Text style={{ color: '#d4a853' }} className="text-[10px] font-semibold">不可修改</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
              {!birthday && !birthdayEditing && <ChevronRight size={16} color={sub} />}
            </Pressable>
          </View>
        </View>

        {/* 提示 */}
        <View className="px-5 mt-6 mb-8">
          <Text style={{ color: sub }} className="text-xs text-center">
            点击任意字段即可编辑 · 修改即时保存
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
