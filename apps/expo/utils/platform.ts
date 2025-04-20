import { Platform, PlatformIOSStatic } from 'react-native';

// Enhanced Platform detection with more specific iOS version checks
interface EnhancedPlatform extends PlatformIOSStatic {
  isIOS: boolean;
  isAndroid: boolean;
  isWeb: boolean;
  isIPhoneX: boolean;
  hasNotch: boolean;
  isMaterial3: boolean;
}

// Check if device is iPhone X or similar models with a notch
const isIPhoneX = (): boolean => {
  const { width, height } = Platform.OS === 'ios'
    ? { width: 0, height: 0 }  // Placeholder values
    : { width: 0, height: 0 }; // This would normally use Dimensions.get('window')

  return (
    Platform.OS === 'ios' &&
    !Platform.isPad &&
    !Platform.isTV &&
    (height >= 812 || width >= 812)
  );
};

// Check if device has a notch
const hasNotch = (): boolean => {
  return isIPhoneX();
};

// Check if Android is using Material 3 (Android 12+)
const isMaterial3 = (): boolean => {
  if (Platform.OS !== 'android') return false;

  const version = Platform.Version as number;
  return version >= 31; // Android 12 (S) is API 31
};

// Export enhanced platform object
export const CustomPlatform: EnhancedPlatform = {
  ...Platform,
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb: Platform.OS === 'web',
  isIPhoneX: isIPhoneX(),
  hasNotch: hasNotch(),
  isMaterial3: isMaterial3(),
};

// Platform-specific spacing values (useful for safe areas)
export const PlatformSpacing = {
  // Account for iOS safe areas
  statusBarHeight: CustomPlatform.isIOS
    ? (CustomPlatform.hasNotch ? 44 : 20)
    : 24,
  bottomSafeArea: CustomPlatform.isIOS && CustomPlatform.hasNotch ? 34 : 0,
  topSafeArea: CustomPlatform.isIOS && CustomPlatform.hasNotch ? 44 : 0,
  // Platform-specific spacing scale
  scale: CustomPlatform.isAndroid ? 1.1 : 1, // Android often needs slightly larger touch targets
};

// Platform-specific styling helpers
export const PlatformStyles = {
  // Shadow styles differ significantly between platforms
  shadow: (elevation: number = 4) => ({
    ...CustomPlatform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: 0.2,
        shadowRadius: elevation / 2,
      },
      android: {
        elevation,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: elevation / 2 },
        shadowOpacity: 0.2,
        shadowRadius: elevation / 2,
      },
    }),
  }),

  // Button styling for optimal platform feel
  buttonStyles: {
    // iOS buttons typically have less elevation
    elevation: CustomPlatform.isIOS ? 0 : 2,
    // iOS buttons often have more rounded corners
    borderRadius: CustomPlatform.isIOS ? 8 : 4,
    // Android buttons typically have a material ripple effect
    ripple: CustomPlatform.isAndroid,
    // Android buttons often have uppercase labels
    textTransform: CustomPlatform.isAndroid ? 'uppercase' : 'none',
  },

  // Input styling differences
  inputStyles: {
    // iOS inputs typically have borders, Android uses underlines
    borderType: CustomPlatform.isIOS ? 'border' : 'underline',
    // Android fields often have a floating label animation
    floatingLabel: CustomPlatform.isAndroid,
    // iOS typically uses a different focus indicator
    focusIndicator: CustomPlatform.isIOS ? 'border' : 'highlight',
  },

  // Animation durations (Android animations are often slower)
  animationDurations: {
    short: CustomPlatform.isAndroid ? 200 : 150,
    medium: CustomPlatform.isAndroid ? 300 : 250,
    long: CustomPlatform.isAndroid ? 500 : 400,
  },
};

// Accessibility helpers
export const AccessibilityHelpers = {
  // Combine accessibilityLabel and accessibilityHint
  combineA11yProps: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    ...(hint ? { accessibilityHint: hint } : {}),
  }),

  // Convert an icon to be accessible
  iconA11yProps: (label: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'image',
  }),

  // Button accessibilityRole and state
  buttonA11yProps: (label: string, isDisabled: boolean = false) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'button',
    accessibilityState: {
      disabled: isDisabled,
    },
  }),

  // Header accessibilityRole
  headerA11yProps: (text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1) => ({
    accessible: true,
    accessibilityLabel: text,
    accessibilityRole: `heading${level}` as 'heading',
    accessibilityLevel: level,
  }),
};

export default {
  CustomPlatform,
  PlatformSpacing,
  PlatformStyles,
  AccessibilityHelpers,
};
