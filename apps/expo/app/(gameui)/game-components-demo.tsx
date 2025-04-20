import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, SafeAreaView, Switch } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ThemeProvider } from '../../components/themes/ThemeProvider';
import { Button, Card, Text } from '../../components/core';
import Leaderboard, { LeaderboardPlayer, LeaderboardPeriod } from '../../components/functions/Leaderboard';
import AchievementList, { Achievement } from '../../components/functions/AchievementList';
import { ThemeStyleType, STYLE_THEMES } from '../../utils/theme';

// Sample leaderboard data
const sampleLeaderboardPlayers: LeaderboardPlayer[] = [
  {
    id: '1',
    rank: 1,
    name: 'GamerPro99',
    score: 12450,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 132,
      'Win Rate': '68%',
    },
  },
  {
    id: '2',
    rank: 2,
    name: 'WizardKing',
    score: 10980,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 95,
      'Win Rate': '62%',
    },
  },
  {
    id: '3',
    rank: 3,
    name: 'DarkNight',
    score: 9750,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 87,
      'Win Rate': '59%',
    },
  },
  {
    id: '4',
    rank: 4,
    name: 'PlayerOne',
    score: 8340,
    isCurrentUser: true,
    additionalInfo: {
      'Games Played': 76,
      'Win Rate': '55%',
    },
  },
  {
    id: '5',
    rank: 5,
    name: 'StarGazer',
    score: 7290,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 68,
      'Win Rate': '51%',
    },
  },
  {
    id: '6',
    rank: 6,
    name: 'SilentHunter',
    score: 5980,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 54,
      'Win Rate': '48%',
    },
  },
  {
    id: '7',
    rank: 7,
    name: 'MoonWalker',
    score: 4560,
    isCurrentUser: false,
    additionalInfo: {
      'Games Played': 47,
      'Win Rate': '45%',
    },
  },
];

// Sample achievement data
const sampleAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Victory',
    description: 'Win your first game',
    isUnlocked: true,
    unlockedAt: new Date('2023-10-15'),
    tier: 'bronze',
    rarity: 85,
    category: 'Beginner',
  },
  {
    id: '2',
    title: 'Sharpshooter',
    description: 'Achieve 90% accuracy in a single game',
    isUnlocked: true,
    unlockedAt: new Date('2023-11-02'),
    tier: 'silver',
    rarity: 35,
    category: 'Combat',
  },
  {
    id: '3',
    title: 'Collector',
    description: 'Find all hidden treasures',
    isUnlocked: false,
    progress: 65,
    tier: 'gold',
    rarity: 12,
    category: 'Exploration',
  },
  {
    id: '4',
    title: '???',
    description: 'Secret achievement',
    isUnlocked: false,
    isSecret: true,
    tier: 'platinum',
    rarity: 5,
    category: 'Secret',
  },
  {
    id: '5',
    title: 'Master Strategist',
    description: 'Win 10 games in a row',
    isUnlocked: false,
    progress: 30,
    tier: 'gold',
    rarity: 8,
    category: 'Expert',
  },
  {
    id: '6',
    title: 'Friendly Player',
    description: 'Add 5 friends to your team',
    isUnlocked: true,
    unlockedAt: new Date('2023-09-20'),
    reward: '500 Gold Coins',
    tier: 'bronze',
    rarity: 60,
    category: 'Social',
  },
  {
    id: '7',
    title: 'Night Owl',
    description: 'Play for 3 hours after midnight',
    isUnlocked: true,
    unlockedAt: new Date('2023-12-05'),
    tier: 'silver',
    rarity: 25,
    category: 'Lifestyle',
  },
];

// Achievement categories
const achievementCategories = [
  'All',
  'Beginner',
  'Combat',
  'Exploration',
  'Expert',
  'Social',
  'Lifestyle',
  'Secret',
];

export default function GameComponentsDemo() {
  // State for theme selection
  const [currentTheme, setCurrentTheme] = useState<ThemeStyleType>('westernStyle');

  // State for leaderboard
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('weekly');
  const [showLeaderboardDetails, setShowLeaderboardDetails] = useState(false);

  // State for achievements
  const [achievementDisplayMode, setAchievementDisplayMode] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);

  // Filter achievements based on category and unlocked status
  const filteredAchievements = sampleAchievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'All' || achievement.category === selectedCategory;
    const unlockedMatch = !showUnlockedOnly || achievement.isUnlocked;
    return categoryMatch && unlockedMatch;
  });

  // Go back to main menu
  const goBack = () => {
    router.back();
  };

  // Handle leaderboard player press
  const handlePlayerPress = (player: LeaderboardPlayer) => {
    alert(`Player: ${player.name}, Rank: ${player.rank}, Score: ${player.score}`);
  };

  // Handle achievement press
  const handleAchievementPress = (achievement: Achievement) => {
    const status = achievement.isUnlocked ? 'Unlocked' : 'Locked';
    const progress = achievement.progress ? `Progress: ${achievement.progress}%` : '';

    alert(`${achievement.title}\n${status}\n${achievement.description}\n${progress}`);
  };

  return (
    <ThemeProvider initialThemeStyle={currentTheme}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text
            variant="h1"
            align="center"
            style={styles.title}
          >
            Game Components
          </Text>

          {/* Theme Selection */}
          <Card title="Theme Selection" style={styles.card}>
            <Text variant="body1" style={styles.cardDescription}>
              Choose a theme to see how the game components adapt:
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themeSelector}
            >
              {Object.entries(STYLE_THEMES).map(([key, theme]) => (
                <Button
                  key={key}
                  title={theme.name}
                  variant={currentTheme === key ? 'primary' : 'outline'}
                  size="small"
                  style={styles.themeButton}
                  onPress={() => setCurrentTheme(key as ThemeStyleType)}
                />
              ))}
            </ScrollView>
          </Card>

          {/* Leaderboard Component */}
          <Text variant="h2" style={styles.sectionTitle}>Leaderboard Component</Text>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text>Show Player Details:</Text>
              <Switch
                value={showLeaderboardDetails}
                onValueChange={setShowLeaderboardDetails}
              />
            </View>
          </View>

          <Leaderboard
            title="Top Players"
            players={sampleLeaderboardPlayers}
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            onPlayerPress={handlePlayerPress}
            showDetails={showLeaderboardDetails}
            highlightTopThree={true}
            themeStyle={currentTheme}
            style={styles.componentDemo}
          />

          <Text variant="caption" style={styles.infoText}>
            * The leaderboard component displays player rankings with support for filtering by time period.
            It highlights the top three players and can show the current user.
            Tap on players to view more details.
          </Text>

          {/* Achievement Component */}
          <Text variant="h2" style={styles.sectionTitle}>Achievement Component</Text>

          <View style={styles.optionsContainer}>
            <View style={styles.optionRow}>
              <Text>Display Mode:</Text>
              <View style={styles.buttonToggle}>
                <Button
                  title="List"
                  variant={achievementDisplayMode === 'list' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setAchievementDisplayMode('list')}
                  style={styles.toggleButton}
                />
                <Button
                  title="Grid"
                  variant={achievementDisplayMode === 'grid' ? 'primary' : 'outline'}
                  size="small"
                  onPress={() => setAchievementDisplayMode('grid')}
                  style={styles.toggleButton}
                />
              </View>
            </View>
          </View>

          <AchievementList
            title="Player Achievements"
            achievements={filteredAchievements}
            displayMode={achievementDisplayMode}
            showProgress={true}
            showRarity={true}
            showFilters={true}
            categories={achievementCategories}
            selectedCategory={selectedCategory}
            onFilterChange={setSelectedCategory}
            showUnlockedOnly={showUnlockedOnly}
            onToggleUnlockedOnly={() => setShowUnlockedOnly(!showUnlockedOnly)}
            onAchievementPress={handleAchievementPress}
            themeStyle={currentTheme}
            style={styles.componentDemo}
          />

          <Text variant="caption" style={styles.infoText}>
            * The achievement component displays player achievements with support for different
            display modes, filtering, and progress tracking. Secret achievements are hidden until
            unlocked. Achievements can have different tiers (bronze, silver, gold, etc.)
            and rarity levels.
          </Text>

          <Button
            title="Back to Components"
            onPress={goBack}
            variant="primary"
            style={styles.backButton}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginTop: 20,
    marginBottom: 24,
  },
  card: {
    marginBottom: 24,
  },
  cardDescription: {
    marginBottom: 16,
  },
  themeSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  themeButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 16,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonToggle: {
    flexDirection: 'row',
  },
  toggleButton: {
    marginLeft: 8,
  },
  componentDemo: {
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 24,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 16,
  },
});
