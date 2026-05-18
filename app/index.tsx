import { Redirect } from 'expo-router';

/** 启动路由 — 直接重定向到菜单（V1 不强制登录浏览菜单） */
export default function Index() {
  return <Redirect href="/(tabs)/menu" />;
}
