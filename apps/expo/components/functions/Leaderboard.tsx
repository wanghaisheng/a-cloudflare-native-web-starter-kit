import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Card } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';

// Player data structure for leaderboard entries
export interface LeaderboardPlayer {
  id: string;
  rank: number;
  name: string;
  score: number;
  avatar?: any; // Image source
  isCurrentUser?: boolean;
  additionalInfo?: {
    [key: string]: string | number; // For additional stats like "Games Played", "Win Rate", etc.
  };
}

// Time period filter options
export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'allTime';

// Leaderboard component props
export interface LeaderboardProps {
  title?: string;
  players: LeaderboardPlayer[];
  loading?: boolean;
  maxPlayersToShow?: number;
  selectedPeriod?: LeaderboardPeriod;
  onPeriodChange?: (period: LeaderboardPeriod) => void;
  onPlayerPress?: (player: LeaderboardPlayer) => void;
  showRankChange?: boolean;
  highlightTopThree?: boolean;
  showDetails?: boolean;
  statToShow?: string;
  themeStyle?: string;
  style?: any;
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  title = 'Leaderboard',
  players,
  loading = false,
  maxPlayersToShow = 10,
  selectedPeriod = 'weekly',
  onPeriodChange,
  onPlayerPress,
  showRankChange = false,
  highlightTopThree = true,
  showDetails = false,
  statToShow = 'score',
  themeStyle,
  style,
}) => {
  const { theme } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const isMobileView = windowWidth < 600;

  // Filter to show only the specified number of players
  const displayedPlayers = players.slice(0, maxPlayersToShow);

  // Function to render medal instead of rank number for top 3 players
  const renderRank = (rank: number) => {
    if (!highlightTopThree || rank > 3) {
      return (
        <View style={styles.rankContainer}>
          <Text
            variant="body1"
            style={styles.rankText}
            {...AccessibilityHelpers.combineA11yProps(`Rank ${rank}`, '')}
          >
            {rank}
          </Text>
        </View>
      );
    }

    // Medal colors for top 3
    const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
    const medalNames = ['Gold', 'Silver', 'Bronze'];

    return (
      <View
        style={[styles.medalContainer, { backgroundColor: medalColors[rank - 1] }]}
        {...AccessibilityHelpers.combineA11yProps(`${medalNames[rank - 1]} medal, Rank ${rank}`, '')}
      >
        <Text style={styles.medalText}>{rank}</Text>
      </View>
    );
  };

  // Render period selection tabs
  const renderPeriodTabs = () => {
    const periods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'allTime'];
    const periodLabels = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      allTime: 'All Time',
    };

    return (
      <View style={styles.periodTabsContainer}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodTab,
              selectedPeriod === period && styles.selectedPeriodTab,
              { borderColor: theme.colors.primary },
              selectedPeriod === period && { backgroundColor: theme.colors.primary + '20' },
            ]}
            onPress={() => onPeriodChange && onPeriodChange(period)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedPeriod === period }}
            accessibilityLabel={`${periodLabels[period]} leaderboard`}
          >
            <Text
              variant="body2"
              color={selectedPeriod === period ? theme.colors.primary : undefined}
            >
              {periodLabels[period]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // Render a player item in the leaderboard
  const renderPlayerItem = ({ item }: { item: LeaderboardPlayer }) => {
    const isTopThree = item.rank <= 3 && highlightTopThree;

    return (
      <TouchableOpacity
        style={[
          styles.playerContainer,
          item.isCurrentUser && styles.currentUserContainer,
          isTopThree && styles.topThreeContainer,
        ]}
        onPress={() => onPlayerPress && onPlayerPress(item)}
        disabled={!onPlayerPress}
        {...AccessibilityHelpers.combineA11yProps(
          `${item.name}, Rank ${item.rank}, Score ${item.score}`,
          item.isCurrentUser ? 'This is you' : ''
        )}
      >
        {/* Rank */}
        <View style={styles.rankSection}>
          {renderRank(item.rank)}
          {showRankChange && (
            <View style={styles.rankChangeContainer}>
              {/* This would typically show a rank change indicator */}
              {/* For now, using a placeholder */}
            </View>
          )}
        </View>

        {/* Player info */}
        <View style={styles.playerInfoSection}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.avatar ? (
              <Image source={item.avatar} style={styles.avatar} />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
                <Text color="#FFFFFF" style={styles.avatarInitial}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Name and details */}
          <View style={styles.nameContainer}>
            <Text
              variant="body1"
              style={[
                styles.playerName,
                item.isCurrentUser && styles.currentUserText,
                isTopThree && styles.topThreeText,
              ]}
              numberOfLines={1}
            >
              {item.name}
              {item.isCurrentUser && ' (You)'}
            </Text>

            {showDetails && item.additionalInfo && (
              <Text variant="caption" style={styles.additionalInfo}>
                {Object.entries(item.additionalInfo)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(' • ')}
              </Text>
            )}
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreSection}>
          <Text
            variant="body1"
            style={[
              styles.scoreText,
              item.isCurrentUser && styles.currentUserText,
              isTopThree && styles.topThreeText,
            ]}
          >
            {statToShow === 'score' ? item.score.toLocaleString() : item.additionalInfo?.[statToShow]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Function to render the leaderboard header
  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <View style={styles.rankSection}>
          <Text variant="caption" style={styles.headerText}>
            RANK
          </Text>
        </View>
        <View style={styles.playerInfoSection}>
          <Text variant="caption" style={styles.headerText}>
            PLAYER
          </Text>
        </View>
        <View style={styles.scoreSection}>
          <Text variant="caption" style={styles.headerText}>
            {statToShow === 'score' ? 'SCORE' : statToShow.toUpperCase()}
          </Text>
        </View>
      </View>
    );
  };

  // Function to handle empty state
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body1" style={styles.emptyText}>
            Loading leaderboard...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="body1" style={styles.emptyText}>
          No players found for this leaderboard.
        </Text>
      </View>
    );
  };

  return (
    <Card
      title={title}
      style={[styles.container, style]}
      {...AccessibilityHelpers.combineA11yProps(`${title}`, 'Displays player rankings')}
    >
      {/* Period tabs */}
      {onPeriodChange && renderPeriodTabs()}

      {/* Leaderboard content */}
      <View style={styles.leaderboardContainer}>
        {players.length > 0 && renderHeader()}

        <FlatList
          data={displayedPlayers}
          renderItem={renderPlayerItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={!isMobileView || displayedPlayers.length > 5}
          showsVerticalScrollIndicator={!isMobileView}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  periodTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  periodTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedPeriodTab: {
    borderWidth: 1,
  },
  leaderboardContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerText: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  listContent: {
    flexGrow: 1,
  },
  playerContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  currentUserContainer: {
    backgroundColor: 'rgba(0, 120, 255, 0.1)',
  },
  topThreeContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  rankSection: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  rankText: {
    fontWeight: 'bold',
  },
  rankChangeContainer: {
    marginTop: 4,
  },
  medalContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medalText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  playerInfoSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nameContainer: {
    flex: 1,
  },
  playerName: {
    fontWeight: '500',
  },
  currentUserText: {
    fontWeight: 'bold',
  },
  topThreeText: {
    fontWeight: 'bold',
  },
  additionalInfo: {
    opacity: 0.7,
    marginTop: 2,
  },
  scoreSection: {
    width: 80,
    alignItems: 'flex-end',
  },
  scoreText: {
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
});

export default Leaderboard;
