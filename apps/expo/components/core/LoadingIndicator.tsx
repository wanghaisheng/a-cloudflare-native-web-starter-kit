import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Text,
} from 'react-native';
import { useTheme } from '../../utils/theme';

export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingVariant = 'default' | 'overlay' | 'full' | 'centered';

interface LoadingIndicatorProps {
  loading?: boolean;
  size?: LoadingSize;
  variant?: LoadingVariant;
  color?: string;
  message?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  loading = true,
  size = 'medium',
  variant = 'default',
  color,
  message,
  style,
  children,
}) => {
  const { theme } = useTheme();

  if (!loading) {
    return <>{children}</>;
  }

  // Get size for ActivityIndicator
  const getIndicatorSize = (): 'small' | 'large' => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'small';
    }
  };

  // Get actual size in pixels
  const getSizePixels = (): number => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 36;
      case 'large':
        return 48;
      default:
        return 36;
    }
  };

  // Get container style based on variant
  const getContainerStyle = () => {
    switch (variant) {
      case 'overlay':
        return [
          styles.container,
          styles.overlay,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ];
      case 'full':
        return [
          styles.container,
          styles.full,
          { backgroundColor: theme.colors.background },
        ];
      case 'centered':
        return [styles.container, styles.centered];
      default:
        return [styles.container];
    }
  };

  // Indicator color
  const indicatorColor = color || theme.colors.primary;

  return (
    <View style={[getContainerStyle(), style]}>
      <View style={styles.content}>
        <ActivityIndicator
          size={getIndicatorSize()}
          color={indicatorColor}
          style={{ width: getSizePixels(), height: getSizePixels() }}
        />

        {message && (
          <Text style={[styles.message, { color: theme.colors.text }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  full: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoadingIndicator;
