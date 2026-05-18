import { Tabs } from 'expo-router';
import { Text } from 'react-native';

/**
 * 底部 Tab Bar
 * V1 用文字图标占位，V2 接入 Lucide / SF Symbols
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#52c41a',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: '#e5e5e5',
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: '菜单',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>🥑</Text>,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: '订单',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: '钱包',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>💚</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 22 }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
