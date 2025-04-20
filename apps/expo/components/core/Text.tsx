import React from 'react';
import { Text as RNText, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '../../utils/theme';
import { AccessibilityHelpers, CustomPlatform } from '../../utils/platform';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
export type TextAlign = 'left' | 'center' | 'right';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  color?: string;
  align?: TextAlign;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  onPress?: () => void;
  selectable?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'text' | 'header' | 'link' | 'alert' | 'none';
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body1',
  color,
  align = 'left',
  style,
  numberOfLines,
  ellipsizeMode = 'tail',
  onPress,
  selectable = false,
  accessibilityLabel,
  accessibilityRole,
  ...rest
}) => {
  const { theme } = useTheme();

  // Determine font family based on platform
  const getFontFamily = () => {
    // Default font family
    let fontFamily = theme.fonts.regular;

    // Platform-specific font adjustments
    if (CustomPlatform.isIOS) {
      // iOS-specific font adjustments
      if (variant.startsWith('h')) {
        return theme.fonts.bold || 'System-Bold';
      }

      if (variant === 'button') {
        return theme.fonts.semiBold || 'System-SemiBold';
      }

      return fontFamily || 'System';
    } else if (CustomPlatform.isAndroid) {
      // Android-specific font adjustments
      if (variant.startsWith('h')) {
        return theme.fonts.bold || 'sans-serif-medium';
      }

      if (variant === 'button') {
        return theme.fonts.semiBold || 'sans-serif-medium';
      }

      return fontFamily || 'sans-serif';
    }

    return fontFamily;
  };

  // Get font size based on variant
  const getFontSize = () => {
    switch (variant) {
      case 'h1':
        return 28;
      case 'h2':
        return 24;
      case 'h3':
        return 20;
      case 'h4':
        return 18;
      case 'body1':
        return 16;
      case 'body2':
        return 14;
      case 'caption':
        return 12;
      case 'button':
        return 16;
      case 'overline':
        return 10;
      default:
        return 16;
    }
  };

  // Get font weight based on variant and platform
  const getFontWeight = () => {
    if (variant.startsWith('h')) {
      return '700'; // bold
    }

    if (variant === 'button') {
      return '600'; // semi-bold
    }

    if (variant === 'body1') {
      return '400'; // normal
    }

    return '400'; // normal for other variants
  };

  // Get text transform based on variant
  const getTextTransform = () => {
    if (variant === 'button' && CustomPlatform.isAndroid) {
      return 'uppercase';
    }

    if (variant === 'overline') {
      return 'uppercase';
    }

    return 'none';
  };

  // Get letter spacing based on variant
  const getLetterSpacing = () => {
    if (variant === 'overline') {
      return 1.5;
    }

    if (variant === 'button') {
      return 0.5;
    }

    if (variant.startsWith('h')) {
      return -0.3;
    }

    return 0;
  };

  // Set up accessibility properties
  const getAccessibilityProps = () => {
    // Default accessibility role based on variant
    let role = accessibilityRole;

    if (!role) {
      if (variant.startsWith('h')) {
        role = 'header';
      } else if (onPress) {
        role = 'link';
      } else {
        role = 'text';
      }
    }

    // Get header level from variant (h1, h2, etc.)
    let level: number | undefined;
    if (role === 'header' && variant.startsWith('h')) {
      level = parseInt(variant.charAt(1), 10);
    }

    // Return accessibility props
    return {
      accessible: true,
      accessibilityLabel: accessibilityLabel || (typeof children === 'string' ? children : undefined),
      accessibilityRole: role,
      ...(level ? { accessibilityLevel: level } : {}),
    };
  };

  // Combine styles
  const textStyles = [
    {
      color: color || theme.colors.text,
      fontFamily: getFontFamily(),
      fontSize: getFontSize(),
      fontWeight: getFontWeight(),
      textAlign: align,
      textTransform: getTextTransform(),
      letterSpacing: getLetterSpacing(),
    },
    style,
  ];

  return (
    <RNText
      style={textStyles}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={onPress}
      selectable={selectable}
      {...getAccessibilityProps()}
      {...rest}
    >
      {children}
    </RNText>
  );
};

export default Text;
