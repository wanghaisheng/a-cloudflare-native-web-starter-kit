import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Button, Card, Text } from '../../components/core';
import { MainGameInterface, MainGameTabName, GameTab } from '../../components/functions';
import { STYLE_THEMES, ThemeStyleType } from '../../utils/theme';

// Sample game resources
const SAMPLE_RESOURCES = [
  {
    name: 'Gold',
    value: 1250,
    icon: require('../../assets/images/placeholder.png'),
    color: '#FFD700'
  },
  {
    name: 'Gems',
    value: 56,
    icon: require('../../assets/images/placeholder.png'),
    color: '#00BFA5'
  },
  {
    name: 'Energy',
    value: 23,
    icon: require('../../assets/images/placeholder.png'),
    color: '#2979FF'
  }
];

// Sample notifications
const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    title: 'Welcome to the Game!',
    message: 'Thank you for trying our game interface demo. Explore the different tabs!',
    isNew: true,
    time: 'Just now',
    action: () => Alert.alert('Welcome', 'This is a sample notification action.')
  },
  {
    id: '2',
    title: 'Daily Rewards Available',
    message: 'Claim your daily login bonus in the rewards center.',
    time: '2 hours ago'
  },
  {
    id: '3',
    title: 'Friend Request',
    message: 'Player "GameMaster" wants to add you as a friend.',
    isNew: true,
    time: '3 hours ago'
  }
];

// Sample tabs for navigation
const SAMPLE_TABS: GameTab[] = [
  {
    name: 'home',
    label: 'Home',
    icon: 'home',
    badgeCount: 0
  },
  {
    name: 'shop',
    label: 'Shop',
    icon: 'shop',
    badgeCount: 2
  },
  {
    name: 'inventory',
    label: 'Items',
    icon: 'inventory',
    badgeCount: 0
  },
  {
    name: 'tasks',
    label: 'Tasks',
    icon: 'tasks',
    badgeCount: 5
  },
  {
    name: 'social',
    label: 'Social',
    icon: 'social',
    badgeCount: 3
  }
];

const MainInterfaceDemo = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeStyleType>('chineseStyle');
  const [currentTab, setCurrentTab] = useState<MainGameTabName>('home');

  // Handle theme selection
  const handleThemeChange = (themeStyle: ThemeStyleType) => {
    setSelectedTheme(themeStyle);
  };

  // Go back to main demo page
  const goBack = () => {
    router.back();
  };

  // Handle tab change
  const handleTabChange = (tab: MainGameTabName) => {
    setCurrentTab(tab);
  };

  // Tab content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <ScrollView style={styles.tabContent}>
            <Card title="Welcome" style={styles.welcomeCard}>
              <Text>
                This is a demo of the main game interface component. You can use this component
                as a base for your game UI, customizing it with different themes and content.
              </Text>
              <Text style={styles.instructionText}>
                Try changing the theme style and interacting with different UI elements.
              </Text>
            </Card>

            <Card title="Daily Quests" style={styles.contentCard}>
              <View style={styles.questItem}>
                <Text variant="body2">Complete 3 battles</Text>
                <Text variant="caption" color="#4CAF50">2/3</Text>
              </View>
              <View style={styles.questItem}>
                <Text variant="body2">Collect 10 resources</Text>
                <Text variant="caption" color="#4CAF50">5/10</Text>
              </View>
              <View style={styles.questItem}>
                <Text variant="body2">Upgrade equipment</Text>
                <Text variant="caption" color="#F44336">0/1</Text>
              </View>
            </Card>

            <Card title="News & Events" style={styles.contentCard}>
              <Text variant="body2" style={styles.eventTitle}>
                Summer Festival
              </Text>
              <Text variant="caption">
                Join the celebration with special rewards and limited-time quests!
              </Text>
              <Button
                title="View Details"
                size="small"
                style={styles.eventButton}
                onPress={() => Alert.alert('Event', 'Summer Festival details would show here.')}
              />
            </Card>
          </ScrollView>
        );
      case 'shop':
        return (
          <View style={styles.tabContent}>
            <Text variant="h3" align="center">Shop Tab</Text>
            <Text variant="body1" align="center" style={styles.comingSoonText}>
              Shop interface coming soon!
            </Text>
          </View>
        );
      case 'inventory':
        return (
          <View style={styles.tabContent}>
            <Text variant="h3" align="center">Inventory Tab</Text>
            <Text variant="body1" align="center" style={styles.comingSoonText}>
              Inventory interface coming soon!
            </Text>
          </View>
        );
      case 'tasks':
        return (
          <View style={styles.tabContent}>
            <Text variant="h3" align="center">Tasks Tab</Text>
            <Text variant="body1" align="center" style={styles.comingSoonText}>
              Tasks interface coming soon!
            </Text>
          </View>
        );
      case 'social':
        return (
          <View style={styles.tabContent}>
            <Text variant="h3" align="center">Social Tab</Text>
            <Text variant="body1" align="center" style={styles.comingSoonText}>
              Social interface coming soon!
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider initialThemeStyle={selectedTheme}>
      <StatusBar style="light" />

      <View style={styles.container}>
        <View style={styles.controlPanel}>
          <Button
            title="Back to Menu"
            onPress={goBack}
            variant="outlined"
            size="small"
            style={styles.backButton}
          />

          <Text variant="body1" style={styles.themeSelectorTitle}>
            Select Theme Style:
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.themeSelectorScroll}
          >
            {Object.entries(STYLE_THEMES).map(([key, theme]) => (
              <Button
                key={key}
                title={theme.name}
                onPress={() => handleThemeChange(key as ThemeStyleType)}
                variant={selectedTheme === key ? 'primary' : 'outline'}
                size="small"
                style={styles.themeButton}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.gameContainer}>
          <MainGameInterface
            playerName="GamePlayer"
            playerLevel={42}
            playerExp={{ current: 850, max: 1000 }}
            resources={SAMPLE_RESOURCES}
            notifications={SAMPLE_NOTIFICATIONS}
            gameTitle="Adventure Quest"
            tabs={SAMPLE_TABS}
            currentTab={currentTab}
            onTabChange={handleTabChange}
            themeStyle={selectedTheme}
            onSettingsPress={() => Alert.alert('Settings', 'Settings menu would open here.')}
            onProfilePress={() => Alert.alert('Profile', 'Player profile would open here.')}
          >
            {renderTabContent()}
          </MainGameInterface>
        </View>
      </View>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  controlPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  backButton: {
    marginBottom: 8,
  },
  themeSelectorTitle: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  themeSelectorScroll: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  themeButton: {
    marginRight: 8,
  },
  gameContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 110 : 90, // Adjust for control panel
  },
  tabContent: {
    flex: 1,
    paddingVertical: 16,
  },
  welcomeCard: {
    marginBottom: 16,
  },
  instructionText: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  contentCard: {
    marginBottom: 16,
  },
  questItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  eventTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  comingSoonText: {
    marginTop: 24,
    opacity: 0.7,
    fontStyle: 'italic',
  },
});

export default MainInterfaceDemo;
