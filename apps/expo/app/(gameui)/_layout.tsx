import React from 'react';
import { Stack } from 'expo-router';

export default function GameUILayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '游戏UI组件库',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="core-components"
        options={{
          title: '核心组件',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="function-components"
        options={{
          title: '功能组件',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="login-demo"
        options={{
          title: '登录界面示例',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="main-interface-demo"
        options={{
          title: '游戏主界面示例',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="theme-explorer"
        options={{
          title: '主题浏览器',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="accessibility-guide"
        options={{
          title: '无障碍指南',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="game-components-demo"
        options={{
          title: '游戏组件演示',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
