import React from 'react';
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { AccessibilityHelpers, PlatformStyles } from '../../utils/platform';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  // Use platform-specific styling
  const borderRadius = PlatformStyles.buttonStyles.borderRadius;
  const elevation = PlatformStyles.buttonStyles.elevation;
  const useTextTransform = PlatformStyles.buttonStyles.textTransform;

  // Apply shadow using platform-specific implementation
  const shadowStyle = PlatformStyles.shadow(variant === 'primary' || variant === 'secondary' ? 2 : 0);

  // Determine background color based on variant
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.disabled;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  // Determine text color based on variant
  const getTextColor = () => {
    if (disabled) return 'rgba(255, 255, 255, 0.6)';

    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  // Determine border properties based on variant
  const getBorderStyles = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      };
    }
    return {};
  };

  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'medium':
        return { paddingVertical: 10, paddingHorizontal: 16 };
      case 'large':
        return { paddingVertical: 14, paddingHorizontal: 20 };
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 };
    }
  };

  // Combine all styles
  const buttonStyles = [
    styles.button,
    { backgroundColor: getBackgroundColor() },
    { borderRadius },
    getBorderStyles(),
    getPadding(),
    shadowStyle,
    fullWidth && styles.fullWidth,
    variant === 'text' && styles.textButton,
    style,
  ];

  // Text styles
  const textStyles = [
    styles.text,
    {
      color: getTextColor(),
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      // Apply platform-specific text transform
      textTransform: useTextTransform === 'uppercase' && variant !== 'text' ? 'uppercase' : 'none',
    },
    textStyle,
  ];

  // Set up accessibility props
  const a11yProps = AccessibilityHelpers.buttonA11yProps(
    accessibilityLabel || title,
    disabled
  );

  if (accessibilityHint) {
    a11yProps.accessibilityHint = accessibilityHint;
  }

  // Choose the appropriate touchable component based on platform
  const ButtonComponent = Platform.OS === 'android' && !disabled && variant !== 'text'
    ? TouchableNativeFeedback
    : TouchableOpacity;

  // For Android, we need to wrap the content in a View for proper ripple effect
  const buttonContent = (
    <View style={buttonStyles}>
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}

      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );

  // For Android, we need additional setup for the ripple effect
  if (Platform.OS === 'android' && !disabled && variant !== 'text') {
    return (
      <View style={[styles.androidContainer, fullWidth && styles.fullWidth]}>
        <ButtonComponent
          onPress={disabled ? undefined : onPress}
          background={TouchableNativeFeedback.Ripple(
            variant === 'outline' ? theme.colors.primary + '20' : 'rgba(255, 255, 255, 0.2)',
            false
          )}
          {...a11yProps}
        >
          {buttonContent}
        </ButtonComponent>
      </View>
    );
  }

  // For iOS and other platforms
  return (
    <ButtonComponent
      style={buttonStyles}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.7}
      disabled={disabled}
      {...a11yProps}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : '#FFFFFF'}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}

      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </ButtonComponent>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  textButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  // Container to handle Android ripple effect properly
  androidContainer: {
    borderRadius: PlatformStyles.buttonStyles.borderRadius,
    overflow: 'hidden',
  },
});

export default Button;
