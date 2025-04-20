import { Dimensions } from 'react-native';
import { createContext, useContext } from 'react';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;
export const IS_LANDSCAPE = width > height;

// Common colors
export const COMMON_COLORS = {
  white: '#FFFFFF',
  black: '#000000',
  gray: '#9E9E9E',
  lightGray: '#E0E0E0',
  darkGray: '#424242',
  transparent: 'transparent',
};

// Game UI style themes
export const STYLE_THEMES = {
  // 国风 (Chinese Style)
  chineseStyle: {
    id: 'chineseStyle',
    name: '国风',
    colors: {
      primary: '#CC0000',
      secondary: '#FFD700',
      background: '#1C1C1C',
      surface: '#2A2A2A',
      accent: '#BF9E67',
      text: '#FFFFFF',
      border: '#D4AF37',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 6,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
      },
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
  },

  // 欧美 (Western Style)
  westernStyle: {
    id: 'westernStyle',
    name: '欧美',
    colors: {
      primary: '#1976D2',
      secondary: '#FF5722',
      background: '#121212',
      surface: '#1E1E1E',
      accent: '#64B5F6',
      text: '#FFFFFF',
      border: '#424242',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 6,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
      },
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 16,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
  },

  // 二次元 (Anime Style)
  animeStyle: {
    id: 'animeStyle',
    name: '二次元',
    colors: {
      primary: '#FF4081',
      secondary: '#FFC107',
      background: '#F9F9F9',
      surface: '#FFFFFF',
      accent: '#7E57C2',
      text: '#212121',
      border: '#BDBDBD',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },
    borderRadius: {
      small: 8,
      medium: 16,
      large: 24,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 12,
      l: 20,
      xl: 28,
      xxl: 40,
    },
  },

  // 科幻 (Sci-Fi)
  sciFiStyle: {
    id: 'sciFiStyle',
    name: '科幻',
    colors: {
      primary: '#00BCD4',
      secondary: '#7C4DFF',
      background: '#0A0A0A',
      surface: '#1A1A1A',
      accent: '#00E5FF',
      text: '#E0E0E0',
      border: '#303030',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#00BCD4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 2,
      },
      medium: {
        shadowColor: '#00BCD4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
      },
      large: {
        shadowColor: '#00BCD4',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 12,
      },
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
  },

  // Q版卡通 (Q-Style Cartoon)
  qStyleCartoon: {
    id: 'qStyleCartoon',
    name: 'Q版卡通',
    colors: {
      primary: '#FF9800',
      secondary: '#8BC34A',
      background: '#FFFDE7',
      surface: '#FFFFFF',
      accent: '#FF4081',
      text: '#5D4037',
      border: '#FFCC80',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
      },
    },
    borderRadius: {
      small: 10,
      medium: 20,
      large: 30,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
  },

  // 军事 (Military)
  militaryStyle: {
    id: 'militaryStyle',
    name: '军事',
    colors: {
      primary: '#4CAF50',
      secondary: '#795548',
      background: '#263238',
      surface: '#37474F',
      accent: '#FFCA28',
      text: '#ECEFF1',
      border: '#455A64',
    },
    fonts: {
      regular: 'SpaceMono-Regular',
      bold: 'SpaceMono-Regular', // Replace with actual bold font
    },
    shadows: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 6,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 10,
      },
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 8,
    },
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
  },
};

// Type definitions
export type ThemeType = typeof STYLE_THEMES.chineseStyle;
export type ThemeStyleType = keyof typeof STYLE_THEMES;

// Default theme
export const DEFAULT_THEME: ThemeStyleType = 'chineseStyle';

// Theme context
interface ThemeContextType {
  theme: ThemeType;
  setThemeStyle: (style: ThemeStyleType) => void;
  themeStyle: ThemeStyleType;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: STYLE_THEMES[DEFAULT_THEME],
  setThemeStyle: () => {},
  themeStyle: DEFAULT_THEME,
});

// Theme hook
export const useTheme = () => useContext(ThemeContext);
