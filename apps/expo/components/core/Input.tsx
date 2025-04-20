import React, { ReactNode, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Text,
} from 'react-native';
import { useTheme } from '../../utils/theme';

export type InputVariant = 'default' | 'filled' | 'outlined';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  variant?: InputVariant;
  label?: string;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  variant = 'default',
  label,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  onFocus,
  onBlur,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus state
  const handleFocus = () => {
    setIsFocused(true);
    onFocus && onFocus();
  };

  // Handle blur state
  const handleBlur = () => {
    setIsFocused(false);
    onBlur && onBlur();
  };

  // Get container style based on variant, state, and theme
  const getContainerStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.small,
    };

    // Error state overrides other styles
    if (error) {
      return {
        ...baseStyle,
        borderColor: 'red',
        borderWidth: 1,
        backgroundColor: 'rgba(255, 0, 0, 0.05)',
      };
    }

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: isFocused
            ? 'rgba(0, 0, 0, 0.1)'
            : 'rgba(0, 0, 0, 0.05)',
          borderBottomWidth: 2,
          borderBottomColor: isFocused
            ? theme.colors.primary
            : 'transparent',
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: isFocused
            ? theme.colors.primary
            : theme.colors.border,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...baseStyle,
          borderBottomWidth: 1,
          borderBottomColor: isFocused
            ? theme.colors.primary
            : theme.colors.border,
          backgroundColor: 'transparent',
        };
    }
  };

  // Get input style
  const getInputStyle = () => {
    return {
      color: disabled ? theme.colors.gray : theme.colors.text,
    };
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: error ? 'red' : theme.colors.text },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          getContainerStyle(),
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            getInputStyle(),
            multiline && styles.multiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.gray}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'SpaceMono-Regular',
    fontSize: 14,
  },
  multiline: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  leftIcon: {
    paddingLeft: 12,
  },
  rightIcon: {
    paddingRight: 12,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
    color: 'red',
  },
});

export default Input;
