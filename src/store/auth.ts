import { create } from 'zustand';
import { STORAGE_KEYS } from '../lib/env';
import { storage } from '../lib/storage';
import type { User } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;

  /** 启动时从 AsyncStorage 还原登录态 */
  hydrate: () => Promise<void>;

  /** 登录成功后写入 */
  setAuth: (token: string, user: User) => Promise<void>;

  /** 登出 */
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  async hydrate() {
    const [token, user] = await Promise.all([
      storage.get<string>(STORAGE_KEYS.token),
      storage.get<User>(STORAGE_KEYS.user),
    ]);
    set({ token, user, hydrated: true });
  },

  async setAuth(token, user) {
    await Promise.all([
      storage.set(STORAGE_KEYS.token, token),
      storage.set(STORAGE_KEYS.user, user),
    ]);
    set({ token, user });
  },

  async signOut() {
    await storage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.user]);
    set({ token: null, user: null });
  },
}));

/** 便捷 hook — 判断是否已登录 */
export const useIsAuthed = () => useAuthStore((s) => !!s.token);
