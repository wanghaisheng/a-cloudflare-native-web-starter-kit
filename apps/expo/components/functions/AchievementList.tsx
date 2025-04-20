import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Card, Button } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';

// Achievement data structure
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon?: any; // Image source
  reward?: string;
  isUnlocked?: boolean;
  progress?: number; // 0 to 100
  unlockedAt?: Date;
  isSecret?: boolean; // Hidden until unlocked
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category?: string;
  rarity?: number; // Percentage of players who have this achievement (0-100)
}

// Achievement list props
export interface AchievementListProps {
  title?: string;
  achievements: Achievement[];
  onAchievementPress?: (achievement: Achievement) => void;
  showProgress?: boolean;
  showRarity?: boolean;
  showFilters?: boolean;
  displayMode?: 'grid' | 'list';
  onFilterChange?: (category: string) => void;
  selectedCategory?: string;
  categories?: string[];
  showUnlockedOnly?: boolean;
  onToggleUnlockedOnly?: () => void;
  themeStyle?: string;
  style?: any;
}

const AchievementList: React.FC<AchievementListProps> = ({
  title = 'Achievements',
  achievements,
  onAchievementPress,
  showProgress = true,
  showRarity = true,
  showFilters = true,
  displayMode = 'list',
  onFilterChange,
  selectedCategory = 'All',
  categories = ['All'],
  showUnlockedOnly = false,
  onToggleUnlockedOnly,
  themeStyle,
  style,
}) => {
  const { theme } = useTheme();
  const windowWidth = Dimensions.get('window').width;
  const numColumns = displayMode === 'grid' ? (windowWidth >= 768 ? 3 : 2) : 1;

  // Animation value for progress bar
  const progressAnim = React.useRef(
    achievements.map(() => new Animated.Value(0))
  ).current;

  // Start progress animation when component mounts
  React.useEffect(() => {
    achievements.forEach((achievement, index) => {
      if (achievement.progress && achievement.progress > 0) {
        Animated.timing(progressAnim[index], {
          toValue: achievement.progress / 100,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }).start();
      }
    });
  }, [achievements, progressAnim]);

  // Get tier color and border style
  const getTierStyle = (tier?: string) => {
    if (!tier) return {};

    const tierColors = {
      bronze: '#CD7F32',
      silver: '#C0C0C0',
      gold: '#FFD700',
      platinum: '#E5E4E2',
      diamond: '#B9F2FF',
    };

    const color = tierColors[tier as keyof typeof tierColors] || '#CCCCCC';

    return {
      borderColor: color,
      shadowColor: color,
    };
  };

  // Get rarity text and color
  const getRarityInfo = (rarity?: number) => {
    if (rarity === undefined) return { text: 'Unknown', color: '#888888' };

    if (rarity < 10) return { text: 'Ultra Rare', color: '#9C27B0' };
    if (rarity < 30) return { text: 'Rare', color: '#3F51B5' };
    if (rarity < 60) return { text: 'Uncommon', color: '#4CAF50' };
    return { text: 'Common', color: '#9E9E9E' };
  };

  // Render filter tabs
  const renderFilters = () => {
    if (!showFilters || categories.length <= 1) return null;

    return (
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filterTab,
                selectedCategory === category && styles.selectedFilterTab,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor:
                    selectedCategory === category
                      ? `${theme.colors.primary}20`
                      : 'transparent',
                },
              ]}
              onPress={() => onFilterChange && onFilterChange(category)}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectedCategory === category }}
              accessibilityLabel={`${category} category filter`}
            >
              <Text
                variant="body2"
                color={selectedCategory === category ? theme.colors.primary : undefined}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {onToggleUnlockedOnly && (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              showUnlockedOnly && styles.activeToggleButton,
              {
                borderColor: theme.colors.primary,
                backgroundColor: showUnlockedOnly
                  ? `${theme.colors.primary}20`
                  : 'transparent',
              },
            ]}
            onPress={onToggleUnlockedOnly}
            accessibilityRole="switch"
            accessibilityState={{ checked: showUnlockedOnly }}
            accessibilityLabel="Show unlocked achievements only"
          >
            <Text
              variant="caption"
              color={showUnlockedOnly ? theme.colors.primary : undefined}
            >
              Unlocked
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render a single achievement in list mode
  const renderListItem = (achievement: Achievement, index: number) => {
    const isSecret = achievement.isSecret && !achievement.isUnlocked;
    const tierStyle = getTierStyle(achievement.tier);
    const { text: rarityText, color: rarityColor } = getRarityInfo(achievement.rarity);

    return (
      <TouchableOpacity
        style={[
          styles.listItemContainer,
          achievement.isUnlocked && styles.unlockedAchievement,
          tierStyle,
        ]}
        onPress={() => onAchievementPress && onAchievementPress(achievement)}
        disabled={!onAchievementPress}
        {...AccessibilityHelpers.combineA11yProps(
          `${achievement.title}${achievement.isUnlocked ? ', Unlocked' : ', Locked'}`,
          achievement.description
        )}
      >
        {/* Icon/Badge */}
        <View style={styles.achievementIcon}>
          {achievement.icon ? (
            <Image
              source={achievement.icon}
              style={[
                styles.icon,
                !achievement.isUnlocked && styles.lockedIcon,
                achievement.tier && styles.tieredIcon,
              ]}
            />
          ) : (
            <View
              style={[
                styles.defaultIcon,
                !achievement.isUnlocked && styles.lockedIcon,
                achievement.tier && styles.tieredIcon,
                { backgroundColor: achievement.isUnlocked ? theme.colors.primary : '#CCCCCC' },
              ]}
            >
              <Text style={styles.defaultIconText}>
                {isSecret ? '?' : achievement.title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Tier badge if available */}
          {achievement.tier && (
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: tierStyle.borderColor || '#CCCCCC' },
              ]}
            >
              <Text variant="caption" style={styles.tierText}>
                {achievement.tier.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Achievement details */}
        <View style={styles.achievementDetails}>
          <Text
            variant="body1"
            style={[
              styles.achievementTitle,
              !achievement.isUnlocked && styles.lockedText,
            ]}
          >
            {isSecret ? 'Secret Achievement' : achievement.title}
          </Text>

          <Text
            variant="caption"
            style={[
              styles.achievementDescription,
              !achievement.isUnlocked && styles.lockedText,
            ]}
            numberOfLines={2}
          >
            {isSecret ? 'Keep playing to unlock this secret achievement'
              : achievement.description}
          </Text>

          {showProgress && achievement.progress !== undefined && achievement.progress < 100 && (
            <View style={styles.progressContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: progressAnim[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <Text variant="caption" style={styles.progressText}>
                {`${Math.floor(achievement.progress)}%`}
              </Text>
            </View>
          )}

          {/* Rarity indicator */}
          {showRarity && achievement.rarity !== undefined && (
            <View style={styles.rarityContainer}>
              <Text variant="caption" style={[styles.rarityText, { color: rarityColor }]}>
                {rarityText} • {achievement.rarity}% of players
              </Text>
            </View>
          )}

          {/* Unlocked date or reward */}
          {achievement.isUnlocked && achievement.unlockedAt && (
            <Text variant="caption" style={styles.unlockedDate}>
              Unlocked on{' '}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Text>
          )}

          {achievement.reward && (
            <Text
              variant="caption"
              style={[
                styles.rewardText,
                !achievement.isUnlocked && styles.lockedText,
              ]}
            >
              Reward: {achievement.reward}
            </Text>
          )}
        </View>

        {/* Status indicator */}
        <View style={styles.statusContainer}>
          {achievement.isUnlocked ? (
            <View style={[styles.unlockedBadge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="caption" style={styles.unlockedText}>
                ✓
              </Text>
            </View>
          ) : (
            <View style={styles.lockedBadge}>
              <Text variant="caption" style={styles.lockedBadgeText}>
                🔒
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render a single achievement in grid mode
  const renderGridItem = (achievement: Achievement, index: number) => {
    const isSecret = achievement.isSecret && !achievement.isUnlocked;
    const tierStyle = getTierStyle(achievement.tier);

    return (
      <TouchableOpacity
        style={[
          styles.gridItemContainer,
          achievement.isUnlocked && styles.unlockedAchievement,
          tierStyle,
        ]}
        onPress={() => onAchievementPress && onAchievementPress(achievement)}
        disabled={!onAchievementPress}
        {...AccessibilityHelpers.combineA11yProps(
          `${achievement.title}${achievement.isUnlocked ? ', Unlocked' : ', Locked'}`,
          achievement.description
        )}
      >
        {/* Icon/Badge */}
        <View style={styles.gridIconContainer}>
          {achievement.icon ? (
            <Image
              source={achievement.icon}
              style={[
                styles.gridIcon,
                !achievement.isUnlocked && styles.lockedIcon,
                achievement.tier && styles.tieredIcon,
              ]}
            />
          ) : (
            <View
              style={[
                styles.gridDefaultIcon,
                !achievement.isUnlocked && styles.lockedIcon,
                achievement.tier && styles.tieredIcon,
                { backgroundColor: achievement.isUnlocked ? theme.colors.primary : '#CCCCCC' },
              ]}
            >
              <Text style={styles.defaultIconText}>
                {isSecret ? '?' : achievement.title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Status indicator */}
          {achievement.isUnlocked ? (
            <View style={[styles.gridUnlockedBadge, { backgroundColor: theme.colors.primary }]}>
              <Text variant="caption" style={styles.unlockedText}>
                ✓
              </Text>
            </View>
          ) : (
            <View style={styles.gridLockedBadge}>
              <Text variant="caption" style={styles.lockedBadgeText}>
                🔒
              </Text>
            </View>
          )}
        </View>

        {/* Achievement details */}
        <Text
          variant="body2"
          style={[
            styles.gridTitle,
            !achievement.isUnlocked && styles.lockedText,
          ]}
          numberOfLines={2}
        >
          {isSecret ? 'Secret Achievement' : achievement.title}
        </Text>

        {showProgress && achievement.progress !== undefined && achievement.progress < 100 && (
          <View style={styles.gridProgressContainer}>
            <Animated.View
              style={[
                styles.gridProgressBar,
                {
                  width: progressAnim[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
            <Text variant="caption" style={styles.gridProgressText}>
              {`${Math.floor(achievement.progress)}%`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render achievement items based on display mode
  const renderItem = ({ item, index }: { item: Achievement; index: number }) => {
    return displayMode === 'list'
      ? renderListItem(item, index)
      : renderGridItem(item, index);
  };

  return (
    <Card
      title={title}
      style={[styles.container, style]}
      {...AccessibilityHelpers.combineA11yProps(`${title}`, 'List of game achievements')}
    >
      {/* Filter controls */}
      {renderFilters()}

      {/* Achievement list */}
      <FlatList
        data={achievements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          displayMode === 'list' ? styles.listContent : styles.gridContent
        }
        numColumns={displayMode === 'grid' ? numColumns : 1}
        key={displayMode} // Force re-render when display mode changes
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body1" style={styles.emptyText}>
              No achievements found.
            </Text>
          </View>
        }
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  selectedFilterTab: {
    borderWidth: 1,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  activeToggleButton: {
    borderWidth: 1,
  },
  // List view styles
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  listItemContainer: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  // Grid view styles
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  gridItemContainer: {
    flex: 1,
    margin: 6,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  unlockedAchievement: {
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
  },
  // Icon styles
  achievementIcon: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  defaultIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultIconText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  tieredIcon: {
    borderWidth: 2,
  },
  tierBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  tierText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
  },
  // Content styles
  achievementDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  achievementTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    opacity: 0.7,
    marginBottom: 8,
  },
  lockedText: {
    opacity: 0.5,
  },
  progressContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginVertical: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: 6,
    fontSize: 10,
  },
  rarityContainer: {
    marginTop: 4,
  },
  rarityText: {
    fontSize: 10,
  },
  unlockedDate: {
    opacity: 0.5,
    fontSize: 10,
    marginTop: 4,
  },
  rewardText: {
    fontStyle: 'italic',
    fontSize: 10,
    marginTop: 4,
  },
  statusContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lockedBadge: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadgeText: {
    opacity: 0.5,
  },
  // Grid-specific styles
  gridIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  gridIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  gridDefaultIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  gridProgressContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  gridProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  gridProgressText: {
    position: 'absolute',
    right: 0,
    top: 6,
    fontSize: 10,
  },
  gridUnlockedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  gridLockedBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty state
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AchievementList;
