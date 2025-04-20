import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../utils/theme';

export type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  cornerRadius?: 'default' | 'rounded' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
  onPress,
  disabled = false,
  title,
  titleStyle,
  footer,
  footerStyle,
  contentStyle,
  cornerRadius = 'default',
}) => {
  const { theme } = useTheme();

  // Determine card style based on variant and theme
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface,
      borderRadius: getCornerRadius(),
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.medium,
        };
      default:
        return baseStyle;
    }
  };

  // Determine corner radius based on the prop
  const getCornerRadius = () => {
    switch (cornerRadius) {
      case 'rounded':
        return theme.borderRadius.large;
      case 'none':
        return 0;
      default:
        return theme.borderRadius.medium;
    }
  };

  // Determine opacity for disabled state
  const getOpacityStyle = () => {
    return disabled ? { opacity: 0.6 } : undefined;
  };

  // Combine styles
  const cardStyles = [
    styles.card,
    getCardStyle(),
    getOpacityStyle(),
    style,
  ];

  const CardComponent = onPress ? TouchableOpacity : View;
  const cardProps = onPress
    ? { onPress, disabled, activeOpacity: 0.8 }
    : {};

  return (
    <CardComponent style={cardStyles} {...cardProps}>
      {title && (
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.text },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
      {footer && <View style={[styles.footer, footerStyle]}>{footer}</View>}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});

export default Card;
