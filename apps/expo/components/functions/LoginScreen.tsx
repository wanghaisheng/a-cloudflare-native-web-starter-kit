import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme, ThemeStyleType } from '../../utils/theme';
import { Button, Card, Input, Text } from '../core';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => void;
  onRegister?: () => void;
  onForgotPassword?: () => void;
  loading?: boolean;
  error?: string;
  logoSource?: any;
  backgroundSource?: any;
  themeStyle?: ThemeStyleType;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onRegister,
  onForgotPassword,
  loading = false,
  error,
  logoSource,
  backgroundSource,
  themeStyle,
}) => {
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const screenWidth = Dimensions.get('window').width;
  const isTablet = screenWidth > 768;

  // Get login card styles based on current theme
  const getLoginCardStyle = () => {
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          backgroundColor: 'rgba(28, 28, 28, 0.85)',
          borderColor: theme.colors.accent,
          borderWidth: 1,
        };
      case 'animeStyle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 20,
        };
      case 'sciFiStyle':
        return {
          backgroundColor: 'rgba(10, 10, 10, 0.8)',
          borderColor: theme.colors.accent,
          borderWidth: 1,
          borderRadius: 4,
        };
      case 'qStyleCartoon':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 30,
        };
      case 'militaryStyle':
        return {
          backgroundColor: 'rgba(38, 50, 56, 0.9)',
          borderColor: theme.colors.accent,
          borderWidth: 2,
          borderRadius: 2,
        };
      default:
        return {
          backgroundColor: 'rgba(30, 30, 30, 0.85)',
        };
    }
  };

  // Get button styles based on current theme
  const getButtonStyle = () => {
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          buttonStyle: { borderRadius: 4 },
        };
      case 'animeStyle':
        return {
          buttonStyle: { borderRadius: 30 },
        };
      case 'sciFiStyle':
        return {
          buttonStyle: { borderRadius: 0 },
        };
      case 'qStyleCartoon':
        return {
          buttonStyle: { borderRadius: 20, height: 50 },
        };
      case 'militaryStyle':
        return {
          buttonStyle: { borderRadius: 0, height: 50 },
        };
      default:
        return {};
    }
  };

  // Handle login form submission
  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  return (
    <ImageBackground
      source={backgroundSource || require('../../assets/images/placeholder.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.loginContainer, isTablet && styles.tabletContainer]}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={logoSource || require('../../assets/images/react-logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Login Form */}
            <Card
              style={[styles.loginCard, getLoginCardStyle()]}
              variant="elevated"
            >
              <Text
                variant="h2"
                align="center"
                style={styles.title}
              >
                Welcome Back
              </Text>

              {error && (
                <View style={styles.errorContainer}>
                  <Text color="red">{error}</Text>
                </View>
              )}

              <Input
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="Enter your username"
                variant="outlined"
                disabled={loading}
                style={styles.input}
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                variant="outlined"
                disabled={loading}
                style={styles.input}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text
                      color={theme.colors.gray}
                      variant="caption"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                }
              />

              <Button
                title="Login"
                onPress={handleLogin}
                variant="primary"
                loading={loading}
                disabled={loading || !username || !password}
                style={[styles.loginButton, getButtonStyle().buttonStyle]}
                fullWidth
              />

              {onForgotPassword && (
                <TouchableOpacity
                  onPress={onForgotPassword}
                  style={styles.forgotPassword}
                  disabled={loading}
                >
                  <Text
                    variant="caption"
                    color={theme.colors.accent}
                    align="center"
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              )}

              {onRegister && (
                <View style={styles.registerContainer}>
                  <Text
                    variant="body2"
                    color={theme.colors.text}
                    align="center"
                  >
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={onRegister}
                    disabled={loading}
                  >
                    <Text
                      variant="body2"
                      color={theme.colors.accent}
                      style={styles.registerText}
                    >
                      Register Now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tabletContainer: {
    maxWidth: 500,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  loginCard: {
    padding: 16,
  },
  title: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderRadius: 4,
    alignItems: 'center',
  },
  forgotPassword: {
    marginTop: 16,
    padding: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  registerText: {
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
