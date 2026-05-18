/**
 * push.ts — Expo Push Notification 注册和管理
 *
 * Expo Push Service：
 *   - 顾客 App 在 Expo Go / 自定义构建都能用
 *   - 后端用 https://exp.host/--/api/v2/push/send 发推
 *   - 不需要 Firebase 配置（Expo 帮我们做了）
 *
 * 用法：
 *   import { initPush, registerForPush } from '../lib/push';
 *   initPush();           // 启动时调一次
 *   await registerForPush(); // 登录后调一次，把 token 上报后端
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { api } from '../api/client';

// 默认通知处理（前台收到时弹横幅 + 响铃）
export function initPush() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Android 必须有 channel 才能收推送
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#52c41a',
      sound: 'default',
    }).catch(() => {});
  }
}

/**
 * 申请权限 + 拿 Expo Push Token + 上报后端
 * 登录成功后调用
 */
export async function registerForPush(): Promise<string | null> {
  // 模拟器 / 网页跳过
  if (!Device.isDevice) {
    console.log('[push] 模拟器跳过');
    return null;
  }

  try {
    // 1. 申请权限
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('[push] 用户拒绝了权限');
      return null;
    }

    // 2. 拿 Expo Push Token
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      undefined;

    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData.data;
    console.log('[push] Expo token:', token);

    // 3. 上报后端
    await api.patch('/users/me/fcm-token', { token, platform: Platform.OS });

    return token;
  } catch (e: any) {
    console.warn('[push] 注册失败:', e?.message);
    return null;
  }
}
