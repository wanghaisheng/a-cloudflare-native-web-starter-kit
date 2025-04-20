import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoginScreen } from '../../components/functions';
import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Text, Button } from '../../components/core';
import { STYLE_THEMES, ThemeStyleType } from '../../utils/theme';

// Import background images
const BACKGROUND_IMAGES = {
  chineseStyle: require('../../assets/images/placeholder.png'),
  westernStyle: require('../../assets/images/placeholder.png'),
  animeStyle: require('../../assets/images/placeholder.png'),
  sciFiStyle: require('../../assets/images/placeholder.png'),
  qStyleCartoon: require('../../assets/images/placeholder.png'),
  militaryStyle: require('../../assets/images/placeholder.png'),
};

// Import logo images
const LOGO_IMAGES = {
  chineseStyle: require('../../assets/images/react-logo.png'),
  westernStyle: require('../../assets/images/react-logo.png'),
  animeStyle: require('../../assets/images/react-logo.png'),
  sciFiStyle: require('../../assets/images/react-logo.png'),
  qStyleCartoon: require('../../assets/images/react-logo.png'),
  militaryStyle: require('../../assets/images/react-logo.png'),
};

const LoginDemo = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeStyleType>('chineseStyle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  // Handle theme selection
  const handleThemeChange = (themeStyle: ThemeStyleType) => {
    setSelectedTheme(themeStyle);
    setError(undefined);
  };

  // Mock login function
  const handleLogin = (username: string, password: string) => {
    setLoading(true);
    setError(undefined);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (username === 'admin' && password === 'password') {
        Alert.alert('登录成功', `欢迎回来, ${username}!`);
      } else {
        setError('用户名或密码错误');
      }
    }, 1500);
  };

  // Mock register function
  const handleRegister = () => {
    Alert.alert('注册', '点击了注册按钮');
  };

  // Mock forgot password function
  const handleForgotPassword = () => {
    Alert.alert('忘记密码', '点击了忘记密码按钮');
  };

  // Go back to main demo page
  const goBack = () => {
    router.back();
  };

  return (
    <ThemeProvider initialThemeStyle={selectedTheme}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.controlPanel}>
          <Button
            title="返回"
            onPress={goBack}
            variant="outlined"
            size="small"
            style={styles.backButton}
          />

          <Text variant="h4" style={styles.themeSelectorTitle}>
            选择登录界面风格:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeSelectorScroll}
            contentContainerStyle={styles.themeSelectorContent}
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

          <View style={styles.demoInstructions}>
            <Text variant="body2">
              用户名：admin
            </Text>
            <Text variant="body2">
              密码：password
            </Text>
          </View>
        </View>

        <View style={styles.loginContainer}>
          <LoginScreen
            onLogin={handleLogin}
            onRegister={handleRegister}
            onForgotPassword={handleForgotPassword}
            loading={loading}
            error={error}
            themeStyle={selectedTheme}
            backgroundSource={BACKGROUND_IMAGES[selectedTheme]}
            logoSource={LOGO_IMAGES[selectedTheme]}
          />
        </View>
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controlPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  themeSelectorTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  themeSelectorScroll: {
    flexDirection: 'row',
  },
  themeSelectorContent: {
    paddingBottom: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  selectedTheme: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  themeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  demoInstructions: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  loginContainer: {
    flex: 1,
  },
});

export default LoginDemo;
