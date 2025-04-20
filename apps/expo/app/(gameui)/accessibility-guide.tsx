import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Switch, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Button, Text, Card, Input } from '../../components/core';
import { AccessibilityHelpers } from '../../utils/platform';

export default function AccessibilityGuide() {
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Text scaling factor based on accessibility settings
  const textScale = largeText ? 1.3 : 1;

  // Return to previous screen
  const goBack = () => {
    router.back();
  };

  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <Text
            variant="h1"
            align="center"
            style={[styles.title, { fontSize: 28 * textScale }]}
            {...AccessibilityHelpers.headerA11yProps('Accessibility Guide', 1)}
          >
            Accessibility Guide
          </Text>

          <Text
            variant="body1"
            style={[styles.description, { fontSize: 16 * textScale }]}
          >
            This guide demonstrates how our Game UI components support accessibility features
            to ensure all players can enjoy your game.
          </Text>

          {/* Settings panel */}
          <Card title="Accessibility Settings" style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text
                style={{ fontSize: 16 * textScale }}
                {...AccessibilityHelpers.combineA11yProps('Large Text', 'Increases text size for better readability')}
              >
                Large Text
              </Text>
              <Switch
                value={largeText}
                onValueChange={setLargeText}
                accessibilityRole="switch"
                accessibilityLabel="Toggle large text"
                accessibilityState={{ checked: largeText }}
              />
            </View>

            <View style={styles.settingRow}>
              <Text
                style={{ fontSize: 16 * textScale }}
                {...AccessibilityHelpers.combineA11yProps('High Contrast', 'Increases color contrast for better visibility')}
              >
                High Contrast
              </Text>
              <Switch
                value={highContrast}
                onValueChange={setHighContrast}
                accessibilityRole="switch"
                accessibilityLabel="Toggle high contrast"
                accessibilityState={{ checked: highContrast }}
              />
            </View>
          </Card>

          {/* Text components */}
          <Card
            title="Accessible Text"
            style={styles.sectionCard}
            {...AccessibilityHelpers.combineA11yProps('Accessible Text Section', 'Examples of accessible text components')}
          >
            <Text
              variant="h2"
              style={{ fontSize: 24 * textScale }}
              {...AccessibilityHelpers.headerA11yProps('This is a heading level 2', 2)}
            >
              Heading Level 2
            </Text>

            <Text
              variant="body1"
              style={[styles.paragraphText, { fontSize: 16 * textScale }]}
            >
              All text components are properly labeled for screen readers. Headings have appropriate
              accessibility roles and levels, making navigation easier for screen reader users.
            </Text>

            <Text
              variant="body1"
              style={[
                styles.paragraphText,
                { fontSize: 16 * textScale },
                highContrast && styles.highContrastText
              ]}
            >
              Text can adapt to accessibility settings like larger font sizes and higher contrast,
              making it more readable for all users.
            </Text>
          </Card>

          {/* Button components */}
          <Card
            title="Accessible Buttons"
            style={styles.sectionCard}
            {...AccessibilityHelpers.combineA11yProps('Accessible Buttons Section', 'Examples of accessible button components')}
          >
            <View style={styles.buttonsContainer}>
              <Button
                title="Primary Button"
                onPress={() => {}}
                style={styles.demoButton}
                accessibilityLabel="Primary action button"
                accessibilityHint="Demonstrates a primary action in the game"
              />

              <Button
                title="Secondary Button"
                variant="secondary"
                onPress={() => {}}
                style={styles.demoButton}
                accessibilityLabel="Secondary action button"
                accessibilityHint="Demonstrates a secondary action in the game"
              />

              <Button
                title="Disabled Button"
                disabled={true}
                onPress={() => {}}
                style={styles.demoButton}
                accessibilityLabel="Disabled button"
                accessibilityHint="This button cannot be activated"
                accessibilityState={{ disabled: true }}
              />

              <Button
                title={highContrast ? "High Contrast Button" : "Normal Contrast Button"}
                onPress={() => {}}
                style={[
                  styles.demoButton,
                  highContrast && styles.highContrastButton
                ]}
                accessibilityLabel={highContrast ? "High contrast button" : "Normal contrast button"}
              />
            </View>

            <Text
              variant="body1"
              style={[styles.paragraphText, { fontSize: 16 * textScale }]}
            >
              All buttons have proper accessibility labels and hints. They work well with screen readers
              and support platform-specific interactions like Android's ripple effect.
            </Text>
          </Card>

          {/* Form components */}
          <Card
            title="Accessible Forms"
            style={styles.sectionCard}
            {...AccessibilityHelpers.combineA11yProps('Accessible Forms Section', 'Examples of accessible form components')}
          >
            <Input
              label="Username"
              placeholder="Enter your username"
              style={styles.inputField}
              accessibilityLabel="Username input field"
              accessibilityHint="Enter your username to log in"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              style={styles.inputField}
              accessibilityLabel="Password input field"
              accessibilityHint="Enter your password securely"
            />

            <Input
              label="Error Example"
              placeholder="This field has an error"
              error="This field is required"
              style={styles.inputField}
              accessibilityLabel="Input field with error"
              accessibilityHint="Example of an input field with validation error"
            />

            <Text
              variant="body1"
              style={[styles.paragraphText, { fontSize: 16 * textScale }]}
            >
              Form inputs are labeled appropriately for screen readers. Error messages are
              associated with their respective fields for better accessibility.
            </Text>
          </Card>

          {/* Platform-specific features */}
          <Card
            title="Platform Adaptations"
            style={styles.sectionCard}
            {...AccessibilityHelpers.combineA11yProps('Platform Adaptations Section', 'Examples of platform-specific accessibility features')}
          >
            <Text
              variant="body1"
              style={[styles.paragraphText, { fontSize: 16 * textScale }]}
            >
              Current platform: <Text style={styles.bold}>{Platform.OS}</Text>
            </Text>

            <Text
              variant="body1"
              style={[styles.paragraphText, { fontSize: 16 * textScale }]}
            >
              Components automatically adapt to platform-specific accessibility guidelines:
            </Text>

            <View style={styles.platformFeaturesList}>
              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>•</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  iOS VoiceOver optimizations
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>•</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Android TalkBack support
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>•</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Platform-specific touch targets and feedback
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>•</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Automatic adaptation to system font size settings
                </Text>
              </View>
            </View>
          </Card>

          {/* Best practices */}
          <Card
            title="Accessibility Best Practices"
            style={styles.sectionCard}
            {...AccessibilityHelpers.combineA11yProps('Accessibility Best Practices Section', 'Guide to implementing accessibility in your game')}
          >
            <Text
              variant="h3"
              style={[{ fontSize: 20 * textScale }]}
              {...AccessibilityHelpers.headerA11yProps('Tips for Game Developers', 3)}
            >
              Tips for Game Developers
            </Text>

            <View style={styles.platformFeaturesList}>
              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>1.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Always provide alternate text for images and icons
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>2.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Ensure sufficient color contrast (at least 4.5:1 ratio)
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>3.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Support keyboard navigation where applicable
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>4.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Make touch targets at least 44x44 points
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>5.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Provide options for text size and high contrast
                </Text>
              </View>

              <View style={styles.featureItem}>
                <Text style={[styles.bulletPoint, { fontSize: 16 * textScale }]}>6.</Text>
                <Text style={[styles.featureText, { fontSize: 16 * textScale }]}>
                  Test your game with screen readers
                </Text>
              </View>
            </View>
          </Card>

          <Button
            title="Back to Components"
            onPress={goBack}
            variant="primary"
            style={styles.backButton}
            accessibilityLabel="Go back to components list"
          />
        </ScrollView>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    marginBottom: 8,
  },
  description: {
    marginBottom: 24,
    opacity: 0.7,
    textAlign: 'center',
  },
  settingsCard: {
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionCard: {
    marginBottom: 24,
  },
  paragraphText: {
    marginBottom: 12,
  },
  highContrastText: {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 4,
  },
  buttonsContainer: {
    marginBottom: 16,
  },
  demoButton: {
    marginBottom: 12,
  },
  highContrastButton: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  inputField: {
    marginBottom: 16,
  },
  platformFeaturesList: {
    marginTop: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 20,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
  },
});
