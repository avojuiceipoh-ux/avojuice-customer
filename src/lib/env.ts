/**
 * 环境配置 — Customer App
 *
 * 后端 API：Railway 上的 avojuice-backend
 * 默认 outlet：UTAR 主摊位（V1 单门店）
 */

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://avojuice-backend-production.up.railway.app';

// V1 单门店；V2 引入选门店逻辑后再读取动态值
// UTAR 总店 UUID（来自 GET /outlets）
export const DEFAULT_OUTLET_ID =
  process.env.EXPO_PUBLIC_OUTLET_ID ?? '4c85f747-b1ff-40fa-b639-7e03f99307d3';

// JWT 存储 key
export const STORAGE_KEYS = {
  token: '@avojuice/token',
  user: '@avojuice/user',
  cart: '@avojuice/cart',
} as const;
