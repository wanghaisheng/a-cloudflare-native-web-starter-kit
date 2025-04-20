import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Button, Card, Text } from '../../components/core';
import { STYLE_THEMES } from '../../utils/theme';

const FunctionComponentsDemo = () => {
  // Go back to main demo page
  const goBack = () => {
    router.back();
  };

  // Navigate to a specific function component demo
  const navigateToDemo = (path: string) => {
    router.push(path);
  };

  return (
    <ThemeProvider>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Button
            title="返回"
            onPress={goBack}
            variant="outlined"
            style={styles.backButton}
          />

          <Text variant="h2" align="center" style={styles.title}>
            功能组件展示
          </Text>
          <Text variant="body1" align="center" style={styles.subtitle}>
            Function Components Demo
          </Text>
        </View>

        <ScrollView style={styles.demoScrollView}>
          <Text variant="h3" style={styles.sectionTitle}>
            可用功能组件
          </Text>

          {/* Login Screen */}
          <Card
            title="登录界面 (Login Screen)"
            variant="elevated"
            style={styles.componentCard}
            onPress={() => navigateToDemo('/login-demo')}
          >
            <Text style={styles.componentDescription}>
              支持多种游戏风格的登录界面，包括表单验证、加载状态和主题适配。
            </Text>

            <View style={styles.themePreviewContainer}>
              <Text variant="body2" style={styles.themePreviewTitle}>
                支持主题风格
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.themePreviewScroll}
              >
                {Object.entries(STYLE_THEMES).map(([key, theme]) => (
                  <View
                    key={key}
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <Text
                      variant="caption"
                      color="#FFFFFF"
                      align="center"
                    >
                      {theme.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Button
              title="查看登录界面示例"
              onPress={() => navigateToDemo('/login-demo')}
              variant="primary"
              style={styles.viewDemoButton}
            />
          </Card>

          {/* Main Game Interface */}
          <Card
            title="游戏主界面 (Main Game Interface)"
            variant="elevated"
            style={styles.componentCard}
            onPress={() => navigateToDemo('/main-interface-demo')}
          >
            <Text style={styles.componentDescription}>
              完整的游戏主界面框架，包括玩家信息、资源显示、底部导航栏和通知系统。
            </Text>

            <View style={styles.themePreviewContainer}>
              <Text variant="body2" style={styles.themePreviewTitle}>
                支持主题风格
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.themePreviewScroll}
              >
                {Object.entries(STYLE_THEMES).map(([key, theme]) => (
                  <View
                    key={key}
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.colors.primary }
                    ]}
                  >
                    <Text
                      variant="caption"
                      color="#FFFFFF"
                      align="center"
                    >
                      {theme.name}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <Button
              title="查看游戏主界面示例"
              onPress={() => navigateToDemo('/main-interface-demo')}
              variant="primary"
              style={styles.viewDemoButton}
            />
          </Card>

          {/* Coming Soon Components */}
          <View style={styles.comingSoonContainer}>
            <Text variant="h4">即将推出的功能组件</Text>

            <Card
              title="背包系统 (Inventory System)"
              variant="outlined"
              style={styles.comingSoonCard}
            >
              <Text variant="body2">
                游戏背包组件，支持分类、搜索、物品详情等功能。
              </Text>
              <View style={styles.tagContainer}>
                <View style={styles.comingSoonTag}>
                  <Text variant="caption" color="#FFFFFF">即将推出</Text>
                </View>
              </View>
            </Card>

            <Card
              title="商城界面 (Shop Interface)"
              variant="outlined"
              style={styles.comingSoonCard}
            >
              <Text variant="body2">
                游戏商城组件，支持商品展示、购买、促销等功能。
              </Text>
              <View style={styles.tagContainer}>
                <View style={styles.comingSoonTag}>
                  <Text variant="caption" color="#FFFFFF">即将推出</Text>
                </View>
              </View>
            </Card>

            <Card
              title="设置界面 (Settings Interface)"
              variant="outlined"
              style={styles.comingSoonCard}
            >
              <Text variant="body2">
                游戏设置界面，包括音量、画质、账号等设置选项。
              </Text>
              <View style={styles.tagContainer}>
                <View style={styles.comingSoonTag}>
                  <Text variant="caption" color="#FFFFFF">即将推出</Text>
                </View>
              </View>
            </Card>
          </View>

          {/* Custom Component Request */}
          <Card
            title="需要其他功能组件？"
            variant="elevated"
            style={styles.requestCard}
          >
            <Text>
              如果您需要其他类型的功能组件，可以联系我们或参考核心组件自行构建。
            </Text>
            <Button
              title="联系我们"
              onPress={() => Alert.alert('联系信息', '请联系邮箱: example@example.com')}
              variant="outline"
              style={styles.requestButton}
            />
          </Card>
        </ScrollView>
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
  },
  demoScrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  componentCard: {
    marginBottom: 24,
  },
  componentDescription: {
    marginBottom: 16,
  },
  themePreviewContainer: {
    marginBottom: 16,
  },
  themePreviewTitle: {
    marginBottom: 8,
  },
  themePreviewScroll: {
    flexDirection: 'row',
  },
  themePreview: {
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
    minWidth: 60,
  },
  viewDemoButton: {
    alignSelf: 'flex-end',
  },
  comingSoonContainer: {
    marginVertical: 16,
  },
  comingSoonCard: {
    marginVertical: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  comingSoonTag: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  requestCard: {
    marginVertical: 24,
  },
  requestButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
});

export default FunctionComponentsDemo;
