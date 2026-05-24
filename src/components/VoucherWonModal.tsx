import { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View } from 'react-native';
import { Button } from './Button';

interface VoucherWonModalProps {
  visible: boolean;
  vouchersIssued: number;
  /** 本单后剩余的集杯进度 (0-9)，可选 */
  progressAfter?: number;
  onClose: () => void;
}

/**
 * 集满 10 杯发券时的庆祝弹窗
 * - 品牌色（牛油果绿 #649b29 + 金色 voucher chip）
 * - 弹入动画（spring scale）
 * - 大 emoji 营造仪式感
 */
export function VoucherWonModal({
  visible,
  vouchersIssued,
  progressAfter = 0,
  onClose,
}: VoucherWonModalProps) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.6);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 遮罩 */}
      <View className="flex-1 bg-black/60 items-center justify-center px-6">
        <Animated.View
          style={{
            transform: [{ scale }],
            opacity,
            width: '100%',
            maxWidth: 360,
          }}
        >
          {/* 主卡片 */}
          <View className="bg-white rounded-3xl overflow-hidden">
            {/* 顶部：品牌色彩带区域 */}
            <View className="bg-brand-500 pt-7 pb-6 items-center relative overflow-hidden">
              {/* 装饰小 emoji（背景） */}
              <Text className="absolute top-3 left-5 text-2xl opacity-30">🥑</Text>
              <Text className="absolute top-6 right-7 text-xl opacity-30">🍋</Text>
              <Text className="absolute bottom-4 left-8 text-lg opacity-30">🍓</Text>
              <Text className="absolute bottom-3 right-5 text-2xl opacity-30">🥭</Text>

              {/* 主 emoji */}
              <View className="bg-white w-20 h-20 rounded-full items-center justify-center mb-2 shadow">
                <Text className="text-5xl">🎁</Text>
              </View>
              <Text className="text-white text-2xl font-bold mt-1">
                恭喜你！
              </Text>
              <Text className="text-white/90 text-base mt-1">
                集满 10 杯，免费一杯到手
              </Text>
            </View>

            {/* 中间：奖励详情 */}
            <View className="px-6 pt-5 pb-6">
              {/* 券卡 */}
              <View className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 flex-row items-center">
                <View className="bg-amber-500 w-14 h-14 rounded-2xl items-center justify-center mr-3">
                  <Text className="text-white text-xs font-bold">免费</Text>
                  <Text className="text-white text-xs font-bold">饮品</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-amber-900 text-base font-bold">
                    {vouchersIssued} 张免费饮品券
                  </Text>
                  <Text className="text-amber-700 text-xs mt-1">
                    每张抵 RM 8 · 超出补差价
                  </Text>
                  <Text className="text-amber-600 text-xs mt-0.5">
                    30 天内有效
                  </Text>
                </View>
              </View>

              {/* 当前进度（如果还没归零） */}
              {progressAfter > 0 ? (
                <View className="mt-4">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-xs text-ink-500">下一张进度</Text>
                    <Text className="text-xs font-semibold text-brand-600">
                      {progressAfter} / 10 杯
                    </Text>
                  </View>
                  <View className="h-2 bg-ink-100 rounded-full overflow-hidden">
                    <View
                      className="h-2 bg-brand-500 rounded-full"
                      style={{ width: `${(progressAfter / 10) * 100}%` }}
                    />
                  </View>
                </View>
              ) : null}

              {/* 提示文案 */}
              <Text className="text-xs text-ink-500 text-center mt-5 leading-5">
                券已存入「钱包 · 积分」{'\n'}
                下次下单时勾选「使用免费券」即可
              </Text>

              {/* 按钮 */}
              <View className="mt-5">
                <Button fullWidth onPress={onClose}>
                  开心收下 🎉
                </Button>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* 关掉的兜底（点遮罩也能关） */}
        <Pressable
          onPress={onClose}
          accessibilityLabel="关闭弹窗"
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: -1,
          }}
        />
      </View>
    </Modal>
  );
}
