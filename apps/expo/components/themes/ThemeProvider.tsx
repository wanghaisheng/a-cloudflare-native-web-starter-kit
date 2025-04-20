import React, { useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext, STYLE_THEMES, ThemeStyleType, DEFAULT_THEME } from '../../utils/theme';

interface ThemeProviderProps {
  children: ReactNode;
  initialThemeStyle?: ThemeStyleType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialThemeStyle = DEFAULT_THEME
}) => {
  const colorScheme = useColorScheme();
  const [themeStyle, setThemeStyle] = useState<ThemeStyleType>(initialThemeStyle);

  // Get the actual theme object based on the theme style
  const theme = STYLE_THEMES[themeStyle];

  // Update theme when theme style changes
  const handleThemeChange = (newThemeStyle: ThemeStyleType) => {
    setThemeStyle(newThemeStyle);
  };

  // Optional: You can use this to respond to system theme changes
  useEffect(() => {
    // This is just a placeholder for future implementation
    // You could switch between light/dark variants of your game styles
    console.log('System color scheme changed to:', colorScheme);
  }, [colorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setThemeStyle: handleThemeChange,
        themeStyle,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
