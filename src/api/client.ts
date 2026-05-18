/**
 * Axios API client
 *
 * - baseURL 来自 src/lib/env.ts
 * - 请求拦截器：自动注入 Bearer token
 * - 响应拦截器：401 时清空登录态、跳登录页
 * - 统一错误格式：抛出 { message, status, data }
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { API_BASE_URL, STORAGE_KEYS } from '../lib/env';
import { storage } from '../lib/storage';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── 请求：自动加 Bearer token ──────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.get<string>(STORAGE_KEYS.token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── 响应：401 → 清登录态 + 跳登录页 ────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      await storage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
      // 跳回登录页（除非已经在登录页）
      router.replace('/auth/login');
    }

    const apiError: ApiError = {
      message:
        error.response?.data?.message ??
        error.message ??
        '网络异常，请稍后再试',
      status: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  },
);
