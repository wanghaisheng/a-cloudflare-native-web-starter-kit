import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Button, Card, Input, Text, LoadingIndicator } from '../../components/core';
import { STYLE_THEMES, ThemeStyleType } from '../../utils/theme';

const CoreComponentsDemo = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeStyleType>('chineseStyle');
  const [inputValue, setInputValue] = useState('');
  const [secureInputValue, setSecureInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle theme selection
  const handleThemeChange = (themeStyle: ThemeStyleType) => {
    setSelectedTheme(themeStyle);
  };

  // Toggle loading state
  const toggleLoading = () => {
    setIsLoading(!isLoading);
  };

  // Go back to main demo page
  const goBack = () => {
    router.back();
  };

  return (
    <ThemeProvider initialThemeStyle={selectedTheme}>
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
            核心组件展示
          </Text>
          <Text variant="body1" align="center" style={styles.subtitle}>
            Core Components Demo
          </Text>
        </View>

        {/* Theme Selector */}
        <View style={styles.themeSelectorContainer}>
          <Text variant="h4">选择主题风格:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeSelectorScroll}
          >
            {Object.entries(STYLE_THEMES).map(([key, theme]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeButton,
                  { backgroundColor: theme.colors.primary },
                  selectedTheme === key && styles.selectedTheme,
                ]}
                onPress={() => handleThemeChange(key as ThemeStyleType)}
              >
                <Text
                  color="#FFFFFF"
                  align="center"
                  style={styles.themeText}
                >
                  {theme.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.demoScrollView}>
          {/* Button Demo */}
          <Card title="按钮 (Button)" style={styles.demoCard}>
            <View style={styles.row}>
              <Button
                title="Primary"
                onPress={() => {}}
                variant="primary"
                style={styles.buttonSpacing}
              />
              <Button
                title="Secondary"
                onPress={() => {}}
                variant="secondary"
                style={styles.buttonSpacing}
              />
            </View>

            <View style={styles.row}>
              <Button
                title="Outline"
                onPress={() => {}}
                variant="outline"
                style={styles.buttonSpacing}
              />
              <Button
                title="Text"
                onPress={() => {}}
                variant="text"
                style={styles.buttonSpacing}
              />
            </View>

            <View style={styles.row}>
              <Button
                title="Small"
                onPress={() => {}}
                size="small"
                style={styles.buttonSpacing}
              />
              <Button
                title="Medium"
                onPress={() => {}}
                size="medium"
                style={styles.buttonSpacing}
              />
              <Button
                title="Large"
                onPress={() => {}}
                size="large"
                style={styles.buttonSpacing}
              />
            </View>

            <View style={styles.row}>
              <Button
                title="Loading"
                onPress={() => {}}
                loading={true}
                style={styles.buttonSpacing}
              />
              <Button
                title="Disabled"
                onPress={() => {}}
                disabled={true}
                style={styles.buttonSpacing}
              />
            </View>
          </Card>

          {/* Text Demo */}
          <Card title="文本 (Text)" style={styles.demoCard}>
            <Text variant="h1">标题1 (h1)</Text>
            <Text variant="h2">标题2 (h2)</Text>
            <Text variant="h3">标题3 (h3)</Text>
            <Text variant="h4">标题4 (h4)</Text>
            <Text variant="body1">正文1 (body1) - 这是正文文本。</Text>
            <Text variant="body2">正文2 (body2) - 这是较小的正文文本。</Text>
            <Text variant="caption">说明文字 (caption) - 这是说明性文字。</Text>
            <Text variant="button">按钮文本 (button)</Text>
            <Text variant="overline">上划线文本 (overline)</Text>
          </Card>

          {/* Input Demo */}
          <Card title="输入框 (Input)" style={styles.demoCard}>
            <Input
              label="标准输入框"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="请输入文本"
              variant="default"
              style={styles.inputSpacing}
            />

            <Input
              label="密码输入框"
              value={secureInputValue}
              onChangeText={setSecureInputValue}
              placeholder="请输入密码"
              secureTextEntry
              variant="outlined"
              style={styles.inputSpacing}
            />

            <Input
              label="填充样式"
              value=""
              onChangeText={() => {}}
              placeholder="填充样式输入框"
              variant="filled"
              style={styles.inputSpacing}
            />

            <Input
              label="错误状态"
              value=""
              onChangeText={() => {}}
              placeholder="错误状态输入框"
              error="这是一个错误提示"
              style={styles.inputSpacing}
            />

            <Input
              label="禁用状态"
              value="不可编辑的内容"
              onChangeText={() => {}}
              disabled
              style={styles.inputSpacing}
            />
          </Card>

          {/* Card Demo */}
          <Card title="卡片 (Card)" style={styles.demoCard}>
            <View style={styles.cardDemoContainer}>
              <Card
                title="默认卡片"
                variant="default"
                style={styles.demoNestedCard}
              >
                <Text>这是一个默认样式的卡片。</Text>
              </Card>

              <Card
                title="轮廓卡片"
                variant="outlined"
                style={styles.demoNestedCard}
              >
                <Text>这是一个带轮廓的卡片。</Text>
              </Card>

              <Card
                title="浮起卡片"
                variant="elevated"
                style={styles.demoNestedCard}
              >
                <Text>这是一个浮起的卡片。</Text>
                <Button
                  title="按钮"
                  onPress={() => {}}
                  size="small"
                  style={styles.cardDemoButton}
                />
              </Card>
            </View>
          </Card>

          {/* Loading Indicator Demo */}
          <Card title="加载指示器 (Loading Indicator)" style={styles.demoCard}>
            <Button
              title={isLoading ? "停止加载" : "开始加载"}
              onPress={toggleLoading}
              style={styles.loadingDemoButton}
            />

            <View style={styles.loadingDemoContainer}>
              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">默认</Text>
                <LoadingIndicator loading={isLoading} variant="default" size="small" />
              </View>

              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">中等大小</Text>
                <LoadingIndicator loading={isLoading} variant="default" size="medium" />
              </View>

              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">大尺寸</Text>
                <LoadingIndicator loading={isLoading} variant="default" size="large" />
              </View>
            </View>

            <View style={styles.loadingWithTextContainer}>
              <LoadingIndicator
                loading={isLoading}
                message="加载中，请稍候..."
                variant="centered"
                size="medium"
              />
            </View>
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
  themeSelectorContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  themeSelectorScroll: {
    flexDirection: 'row',
    marginTop: 12,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#000',
  },
  themeText: {
    fontWeight: 'bold',
  },
  demoScrollView: {
    flex: 1,
    padding: 16,
  },
  demoCard: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  buttonSpacing: {
    marginRight: 8,
    marginBottom: 8,
  },
  inputSpacing: {
    marginBottom: 12,
  },
  cardDemoContainer: {
    flexDirection: 'column',
  },
  demoNestedCard: {
    marginBottom: 12,
  },
  cardDemoButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  loadingDemoButton: {
    marginBottom: 16,
  },
  loadingDemoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingItem: {
    alignItems: 'center',
  },
  loadingWithTextContainer: {
    height: 150,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CoreComponentsDemo;
