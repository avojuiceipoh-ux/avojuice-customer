/**
 * Customer App Sentry — 静默包装
 * 装了 sentry-expo + 设了 EXPO_PUBLIC_SENTRY_DSN 才启用
 */

export async function initSentry() {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  try {
    // @ts-ignore - 动态 import，没装包时会失败
    const Sentry = await import('sentry-expo');
    Sentry.init({
      dsn,
      enableInExpoDevelopment: false,
      debug: false,
      beforeSend: (event: any) => {
        try {
          if (event.request?.data?.otp) event.request.data.otp = '***';
          if (event.request?.data?.pin) event.request.data.pin = '***';
        } catch {}
        return event;
      },
    });
    console.log('[Sentry] ✅ 已启用');
  } catch (e: any) {
    console.warn('[Sentry] 加载失败：', e?.message);
  }
}
