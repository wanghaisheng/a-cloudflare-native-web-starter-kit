import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { ThemeProvider } from '../components/themes/ThemeProvider';
import { Button, Text, Card, Input, LoadingIndicator } from '../components/core';
import { ThemeStyleType, STYLE_THEMES } from '../utils/theme';
import { router } from 'expo-router';

export default function ThemeShowcase() {
  const [currentTheme, setCurrentTheme] = useState<ThemeStyleType>('chineseStyle');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Navigation
  const navigateTo = (path: string) => {
    router.push(path);
  };

  // Toggle loading state
  const toggleLoading = () => {
    setLoading(prev => !prev);
  };

  return (
    <ThemeProvider initialThemeStyle={currentTheme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <Text variant="h2" align="center">Game UI Theme Explorer</Text>
          <Text variant="body1" align="center" style={styles.subtitle}>
            Experience different visual styles for your game UI
          </Text>
        </View>

        {/* Theme Selector */}
        <View style={styles.themeSelector}>
          <Text variant="h4">Select Theme Style:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.themeSelectorContent}
          >
            {Object.entries(STYLE_THEMES).map(([key, theme]) => (
              <Button
                key={key}
                title={theme.name}
                onPress={() => setCurrentTheme(key as ThemeStyleType)}
                variant={currentTheme === key ? 'primary' : 'outline'}
                size="small"
                style={styles.themeButton}
              />
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Current Theme Info */}
          <Card title="Current Theme" style={styles.section}>
            <Text variant="body1">
              <Text style={styles.bold}>Name:</Text> {STYLE_THEMES[currentTheme].name}
            </Text>
            <Text variant="body1">
              <Text style={styles.bold}>ID:</Text> {currentTheme}
            </Text>

            <View style={styles.colorPalette}>
              <Text variant="body2" style={styles.colorPaletteTitle}>Color Palette:</Text>
              <View style={styles.colorGrid}>
                {Object.entries(STYLE_THEMES[currentTheme].colors).map(([colorName, colorValue]) => (
                  <View key={colorName} style={styles.colorItem}>
                    <View style={[styles.colorSwatch, { backgroundColor: colorValue }]} />
                    <Text variant="caption">{colorName}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>

          {/* Button Showcase */}
          <Card title="Buttons" style={styles.section}>
            <View style={styles.componentRow}>
              <Button
                title="Primary"
                variant="primary"
                onPress={() => {}}
                style={styles.componentItem}
              />
              <Button
                title="Secondary"
                variant="secondary"
                onPress={() => {}}
                style={styles.componentItem}
              />
            </View>

            <View style={styles.componentRow}>
              <Button
                title="Outline"
                variant="outline"
                onPress={() => {}}
                style={styles.componentItem}
              />
              <Button
                title="Text"
                variant="text"
                onPress={() => {}}
                style={styles.componentItem}
              />
            </View>

            <View style={styles.componentRow}>
              <Button
                title="Small"
                size="small"
                onPress={() => {}}
                style={styles.componentItem}
              />
              <Button
                title="Medium"
                size="medium"
                onPress={() => {}}
                style={styles.componentItem}
              />
              <Button
                title="Large"
                size="large"
                onPress={() => {}}
                style={styles.componentItem}
              />
            </View>

            <View style={styles.componentRow}>
              <Button
                title="Loading"
                loading={true}
                onPress={() => {}}
                style={styles.componentItem}
              />
              <Button
                title="Disabled"
                disabled={true}
                onPress={() => {}}
                style={styles.componentItem}
              />
            </View>
          </Card>

          {/* Text Showcase */}
          <Card title="Typography" style={styles.section}>
            <Text variant="h1">Heading 1</Text>
            <Text variant="h2">Heading 2</Text>
            <Text variant="h3">Heading 3</Text>
            <Text variant="h4">Heading 4</Text>
            <Text variant="body1">Body Text 1 - Standard paragraph text.</Text>
            <Text variant="body2">Body Text 2 - Smaller paragraph text.</Text>
            <Text variant="caption">Caption Text - Used for supplementary information.</Text>
            <Text variant="button">BUTTON TEXT</Text>
            <Text variant="overline">OVERLINE TEXT</Text>
          </Card>

          {/* Card Showcase */}
          <Card title="Cards" style={styles.section}>
            <Card
              title="Default Card"
              variant="default"
              style={styles.nestedCard}
            >
              <Text>This is a default card.</Text>
            </Card>

            <Card
              title="Outlined Card"
              variant="outlined"
              style={styles.nestedCard}
            >
              <Text>This is an outlined card.</Text>
            </Card>

            <Card
              title="Elevated Card"
              variant="elevated"
              style={styles.nestedCard}
            >
              <Text>This is an elevated card.</Text>
            </Card>

            <Card
              title="Interactive Card"
              variant="elevated"
              style={styles.nestedCard}
              onPress={() => alert('Card pressed')}
            >
              <Text>Tap this card to trigger an action.</Text>
            </Card>
          </Card>

          {/* Input Showcase */}
          <Card title="Input Fields" style={styles.section}>
            <Input
              label="Default Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text"
              style={styles.input}
            />

            <Input
              label="Outlined Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text"
              variant="outlined"
              style={styles.input}
            />

            <Input
              label="Filled Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text"
              variant="filled"
              style={styles.input}
            />

            <Input
              label="Password Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter password"
              secureTextEntry
              style={styles.input}
            />

            <Input
              label="Error Input"
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter some text"
              error="This field has an error"
              style={styles.input}
            />

            <Input
              label="Disabled Input"
              value="This input is disabled"
              onChangeText={() => {}}
              disabled
              style={styles.input}
            />
          </Card>

          {/* Loading Indicator Showcase */}
          <Card title="Loading Indicators" style={styles.section}>
            <Button
              title={loading ? "Stop Loading" : "Start Loading"}
              onPress={toggleLoading}
              style={styles.loadingButton}
            />

            <View style={styles.loadingContainer}>
              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">Small</Text>
                <LoadingIndicator loading={loading} size="small" />
              </View>

              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">Medium</Text>
                <LoadingIndicator loading={loading} size="medium" />
              </View>

              <View style={styles.loadingItem}>
                <Text variant="caption" align="center">Large</Text>
                <LoadingIndicator loading={loading} size="large" />
              </View>
            </View>

            <View style={styles.loadingWithText}>
              <LoadingIndicator
                loading={loading}
                message="Loading game assets..."
                size="medium"
              />
            </View>
          </Card>

          {/* Functional Components Showcase */}
          <Card title="Functional Components" style={styles.section}>
            <Text variant="body1" style={styles.componentDesc}>
              Explore complete game UI components built with our core components.
            </Text>

            <View style={styles.componentLinks}>
              <Button
                title="Login Screen"
                onPress={() => navigateTo('/(gameui)/login-demo')}
                style={styles.componentLink}
              />

              <Button
                title="Main Game Interface"
                onPress={() => navigateTo('/(gameui)/main-interface-demo')}
                style={styles.componentLink}
              />

              <Button
                title="All Components"
                onPress={() => navigateTo('/(gameui)')}
                style={styles.componentLink}
              />
            </View>
          </Card>

          {/* Accessibility Guide */}
          <Card title="Accessibility Features" style={styles.section}>
            <Text variant="body1" style={styles.componentDesc}>
              Learn how to create accessible game interfaces that can be enjoyed by all players.
            </Text>

            <View style={styles.componentLinks}>
              <Button
                title="Accessibility Guide"
                onPress={() => navigateTo('/(gameui)/accessibility-guide')}
                style={styles.componentLink}
                variant="primary"
              />
            </View>
          </Card>

        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  themeSelector: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  themeSelectorContent: {
    paddingTop: 8,
  },
  themeButton: {
    marginRight: 8,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 16,
  },
  bold: {
    fontWeight: 'bold',
  },
  colorPalette: {
    marginTop: 12,
  },
  colorPaletteTitle: {
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  componentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  componentItem: {
    marginRight: 8,
    marginBottom: 8,
  },
  nestedCard: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  loadingButton: {
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 16,
    borderRadius: 8,
  },
  loadingItem: {
    alignItems: 'center',
  },
  loadingWithText: {
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentDesc: {
    marginBottom: 16,
  },
  componentLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  componentLink: {
    marginRight: 8,
    marginBottom: 8,
  },
});
