import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Card, Button } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';

// Quest types
export type QuestStatus = 'active' | 'completed' | 'failed' | 'available' | 'locked';
export type QuestPriority = 'main' | 'side' | 'daily' | 'weekly' | 'event';
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'legendary';

// Quest objective type
export interface QuestObjective {
  id: string;
  description: string;
  current: number;
  target: number;
  completed: boolean;
  type?: 'collect' | 'kill' | 'visit' | 'interact' | 'escort' | 'defend' | 'craft' | 'other';
}

// Quest reward type
export interface QuestReward {
  type: 'currency' | 'item' | 'experience' | 'reputation' | 'other';
  name: string;
  amount: number;
  icon?: any; // Image source
}

// Quest data structure
export interface Quest {
  id: string;
  title: string;
  description: string;
  status: QuestStatus;
  priority: QuestPriority;
  difficulty?: QuestDifficulty;
  location?: string;
  giver?: string;
  giverIcon?: any; // Image source
  objectives: QuestObjective[];
  rewards: QuestReward[];
  timeLimit?: number; // Time limit in seconds
  timeRemaining?: number; // Time remaining in seconds
  expireAt?: Date; // For timed quests
  recommendedLevel?: number;
  requiredLevel?: number;
  questChain?: string; // ID of the quest chain this belongs to
  previousQuest?: string; // ID of the prerequisite quest
  nextQuest?: string; // ID of the next quest in the chain
  isTracked?: boolean;
  icon?: any; // Image source
}

// Quest filter type
export interface QuestFilter {
  status?: QuestStatus[];
  priority?: QuestPriority[];
  searchText?: string;
}

// QuestLog props
export interface QuestLogProps {
  title?: string;
  quests: Quest[];
  onQuestPress?: (quest: Quest) => void;
  onTrackQuest?: (quest: Quest, track: boolean) => void;
  onAbandonQuest?: (quest: Quest) => void;
  onCompleteQuest?: (quest: Quest) => void;
  activeFilters?: QuestFilter;
  onFilterChange?: (filters: QuestFilter) => void;
  maxTrackedQuests?: number;
  style?: any;
  themeStyle?: string;
}

// Priority colors
const PRIORITY_COLORS = {
  main: '#F44336', // Red for main quests
  side: '#4CAF50', // Green for side quests
  daily: '#2196F3', // Blue for daily quests
  weekly: '#9C27B0', // Purple for weekly quests
  event: '#FF9800', // Orange for event quests
};

// Difficulty stars
const DIFFICULTY_STARS = {
  easy: 1,
  normal: 2,
  hard: 3,
  expert: 4,
  legendary: 5,
};

const QuestLog: React.FC<QuestLogProps> = ({
  title = 'Quest Log',
  quests,
  onQuestPress,
  onTrackQuest,
  onAbandonQuest,
  onCompleteQuest,
  activeFilters = {},
  onFilterChange,
  maxTrackedQuests = 3,
  style,
  themeStyle,
}) => {
  const { theme } = useTheme();
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'available'>('active');

  // Animation value for objective progress bars
  const progressAnimations = React.useRef<{[key: string]: Animated.Value}>({});

  // Initialize animations for new quests
  React.useEffect(() => {
    quests.forEach(quest => {
      quest.objectives.forEach(objective => {
        const animKey = `${quest.id}-${objective.id}`;
        if (!progressAnimations.current[animKey]) {
          progressAnimations.current[animKey] = new Animated.Value(0);

          // Animate to current progress
          Animated.timing(progressAnimations.current[animKey], {
            toValue: objective.current / objective.target,
            duration: 1000,
            useNativeDriver: false,
          }).start();
        }
      });
    });
  }, [quests]);

  // Filter quests based on active tab and other filters
  const getFilteredQuests = () => {
    return quests.filter(quest => {
      // Filter by tab (status)
      if (activeTab === 'active' && quest.status !== 'active') return false;
      if (activeTab === 'completed' && quest.status !== 'completed') return false;
      if (activeTab === 'available' && quest.status !== 'available') return false;

      // Filter by additional filters if present
      if (activeFilters.status && activeFilters.status.length > 0) {
        if (!activeFilters.status.includes(quest.status)) return false;
      }

      if (activeFilters.priority && activeFilters.priority.length > 0) {
        if (!activeFilters.priority.includes(quest.priority)) return false;
      }

      if (activeFilters.searchText && activeFilters.searchText.trim() !== '') {
        const searchTerm = activeFilters.searchText.toLowerCase();
        const titleMatch = quest.title.toLowerCase().includes(searchTerm);
        const descMatch = quest.description.toLowerCase().includes(searchTerm);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });
  };

  // Get count of quests by status
  const getQuestCounts = () => {
    const counts = {
      active: 0,
      completed: 0,
      available: 0,
      failed: 0,
      locked: 0,
    };

    quests.forEach(quest => {
      counts[quest.status] = (counts[quest.status] || 0) + 1;
    });

    return counts;
  };

  // Get tracked quests
  const getTrackedQuests = () => {
    return quests.filter(quest => quest.isTracked);
  };

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  // Get the color for a quest based on priority
  const getQuestColor = (priority: QuestPriority) => {
    return PRIORITY_COLORS[priority] || '#9E9E9E';
  };

  // Get difficulty stars
  const getDifficultyStars = (difficulty?: QuestDifficulty) => {
    if (!difficulty) return null;

    const starCount = DIFFICULTY_STARS[difficulty] || 0;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Text key={i} style={[styles.star, i < starCount ? styles.filledStar : styles.emptyStar]}>
          ★
        </Text>
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Toggle expanded state of a quest
  const toggleExpandQuest = (questId: string) => {
    setExpandedQuest(expandedQuest === questId ? null : questId);
  };

  // Handle tracking a quest
  const handleTrackQuest = (quest: Quest, track: boolean) => {
    if (onTrackQuest) {
      // Check if we're at the max tracked quests
      if (track && getTrackedQuests().length >= maxTrackedQuests) {
        // Replace the last tracked quest with this one
        const trackedQuests = getTrackedQuests();
        onTrackQuest(trackedQuests[trackedQuests.length - 1], false);
      }

      onTrackQuest(quest, track);
    }
  };

  // Render tab buttons
  const renderTabs = () => {
    const counts = getQuestCounts();

    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'active' && styles.activeTabButton,
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('active')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'active' }}
          accessibilityLabel="Active quests tab"
        >
          <Text
            variant="body2"
            color={activeTab === 'active' ? theme.colors.primary : undefined}
          >
            Active ({counts.active})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'available' && styles.activeTabButton,
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('available')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'available' }}
          accessibilityLabel="Available quests tab"
        >
          <Text
            variant="body2"
            color={activeTab === 'available' ? theme.colors.primary : undefined}
          >
            Available ({counts.available})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'completed' && styles.activeTabButton,
            { borderColor: theme.colors.primary }
          ]}
          onPress={() => setActiveTab('completed')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'completed' }}
          accessibilityLabel="Completed quests tab"
        >
          <Text
            variant="body2"
            color={activeTab === 'completed' ? theme.colors.primary : undefined}
          >
            Completed ({counts.completed})
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render a quest item
  const renderQuestItem = ({ item }: { item: Quest }) => {
    const isExpanded = expandedQuest === item.id;
    const questColor = getQuestColor(item.priority);

    return (
      <View style={[
        styles.questItem,
        { borderLeftColor: questColor, borderLeftWidth: 4 }
      ]}>
        {/* Quest header - always visible */}
        <TouchableOpacity
          style={styles.questHeader}
          onPress={() => toggleExpandQuest(item.id)}
          {...AccessibilityHelpers.combineA11yProps(
            `${item.title}, ${item.priority} quest, ${item.status}`,
            `Press to ${isExpanded ? 'collapse' : 'expand'} quest details`
          )}
        >
          {/* Quest icon */}
          <View style={styles.questIconContainer}>
            {item.icon ? (
              <Image source={item.icon} style={styles.questIcon} />
            ) : (
              <View style={[styles.defaultQuestIcon, { backgroundColor: questColor }]}>
                <Text style={styles.defaultQuestIconText}>
                  {item.title.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}

            {/* Status indicator */}
            <View style={[
              styles.statusIndicator,
              item.status === 'completed' && styles.completedIndicator,
              item.status === 'active' && styles.activeIndicator,
              item.status === 'failed' && styles.failedIndicator,
              item.status === 'available' && styles.availableIndicator,
              item.status === 'locked' && styles.lockedIndicator,
            ]} />
          </View>

          {/* Quest info */}
          <View style={styles.questInfo}>
            <Text
              variant="body1"
              style={[
                styles.questTitle,
                item.status === 'completed' && styles.completedQuestTitle,
              ]}
            >
              {item.title}
            </Text>

            <View style={styles.questMeta}>
              <Text variant="caption" style={styles.questType}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Quest
              </Text>

              {item.timeRemaining !== undefined && (
                <Text variant="caption" style={styles.questTimer}>
                  ⏱️ {formatTimeRemaining(item.timeRemaining)}
                </Text>
              )}

              {getDifficultyStars(item.difficulty)}
            </View>
          </View>

          {/* Tracked indicator */}
          {item.isTracked && (
            <View style={styles.trackedBadge}>
              <Text style={styles.trackedBadgeText}>Tracked</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Expandable content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Quest description */}
            <Text variant="body2" style={styles.questDescription}>
              {item.description}
            </Text>

            {/* Quest location and giver */}
            {(item.location || item.giver) && (
              <View style={styles.questDetails}>
                {item.location && (
                  <Text variant="caption" style={styles.questDetailItem}>
                    📍 {item.location}
                  </Text>
                )}

                {item.giver && (
                  <View style={styles.giverContainer}>
                    {item.giverIcon && (
                      <Image source={item.giverIcon} style={styles.giverIcon} />
                    )}
                    <Text variant="caption" style={styles.questDetailItem}>
                      Quest Giver: {item.giver}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Quest objectives */}
            <View style={styles.objectivesContainer}>
              <Text variant="body2" style={styles.sectionTitle}>Objectives:</Text>

              {item.objectives.map((objective) => (
                <View key={objective.id} style={styles.objectiveItem}>
                  <View style={styles.objectiveInfo}>
                    <Text
                      variant="body2"
                      style={[
                        styles.objectiveText,
                        objective.completed && styles.completedObjective,
                      ]}
                    >
                      {objective.description}
                    </Text>

                    <Text variant="body2" style={styles.objectiveProgress}>
                      {objective.current}/{objective.target}
                    </Text>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[
                        styles.progressBar,
                        {
                          width: progressAnimations.current[`${item.id}-${objective.id}`]?.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          }) || '0%',
                          backgroundColor: questColor,
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>

            {/* Quest rewards */}
            <View style={styles.rewardsContainer}>
              <Text variant="body2" style={styles.sectionTitle}>Rewards:</Text>

              <View style={styles.rewardsList}>
                {item.rewards.map((reward, index) => (
                  <View key={index} style={styles.rewardItem}>
                    {reward.icon && (
                      <Image source={reward.icon} style={styles.rewardIcon} />
                    )}
                    <Text variant="body2" style={styles.rewardText}>
                      {reward.amount} {reward.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quest actions */}
            <View style={styles.questActions}>
              {item.status === 'active' && onCompleteQuest && (
                <Button
                  title="Complete"
                  variant="primary"
                  size="small"
                  onPress={() => onCompleteQuest(item)}
                  style={styles.actionButton}
                />
              )}

              {item.status === 'active' && onAbandonQuest && (
                <Button
                  title="Abandon"
                  variant="outline"
                  size="small"
                  onPress={() => onAbandonQuest(item)}
                  style={styles.actionButton}
                />
              )}

              {item.status === 'available' && onQuestPress && (
                <Button
                  title="Accept"
                  variant="primary"
                  size="small"
                  onPress={() => onQuestPress(item)}
                  style={styles.actionButton}
                />
              )}

              {onTrackQuest && item.status === 'active' && (
                <Button
                  title={item.isTracked ? "Untrack" : "Track"}
                  variant="outline"
                  size="small"
                  onPress={() => handleTrackQuest(item, !item.isTracked)}
                  style={styles.actionButton}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  // Render tracked quests section
  const renderTrackedQuests = () => {
    const trackedQuests = getTrackedQuests();

    if (trackedQuests.length === 0) return null;

    return (
      <View style={styles.trackedQuestsContainer}>
        <Text variant="h4" style={styles.trackedQuestsTitle}>
          Tracked Quests
        </Text>

        {trackedQuests.map(quest => (
          <View key={quest.id} style={styles.trackedQuestItem}>
            <View style={styles.trackedQuestHeader}>
              <Text variant="body1" style={styles.trackedQuestTitle}>
                {quest.title}
              </Text>

              <TouchableOpacity
                onPress={() => handleTrackQuest(quest, false)}
                style={styles.untrackButton}
                {...AccessibilityHelpers.buttonA11yProps('Untrack quest', false)}
              >
                <Text style={styles.untrackButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {quest.objectives.map(objective => (
              <View key={objective.id} style={styles.trackedObjective}>
                <Text
                  variant="caption"
                  style={[
                    styles.trackedObjectiveText,
                    objective.completed && styles.completedObjective,
                  ]}
                  numberOfLines={1}
                >
                  {objective.description}
                </Text>

                <Text variant="caption" style={styles.trackedObjectiveProgress}>
                  {objective.current}/{objective.target}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <Card
      title={title}
      style={[styles.container, style]}
      {...AccessibilityHelpers.combineA11yProps(`${title}`, 'List of quest and objectives')}
    >
      {/* Tracked quests */}
      {renderTrackedQuests()}

      {/* Tabs for different quest statuses */}
      {renderTabs()}

      {/* Quest list */}
      <FlatList
        data={getFilteredQuests()}
        renderItem={renderQuestItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.questList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="body1" style={styles.emptyStateText}>
              No {activeTab} quests found.
            </Text>
          </View>
        }
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  trackedQuestsContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  trackedQuestsTitle: {
    marginBottom: 8,
  },
  trackedQuestItem: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  trackedQuestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trackedQuestTitle: {
    fontWeight: 'bold',
  },
  untrackButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  untrackButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackedObjective: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  trackedObjectiveText: {
    flex: 1,
  },
  trackedObjectiveProgress: {
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  activeTabButton: {
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  questList: {
    padding: 12,
  },
  questItem: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  questHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  questIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  questIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  defaultQuestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultQuestIconText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  completedIndicator: {
    backgroundColor: '#4CAF50', // Green
  },
  activeIndicator: {
    backgroundColor: '#2196F3', // Blue
  },
  failedIndicator: {
    backgroundColor: '#F44336', // Red
  },
  availableIndicator: {
    backgroundColor: '#FF9800', // Orange
  },
  lockedIndicator: {
    backgroundColor: '#9E9E9E', // Gray
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  completedQuestTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  questMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  questType: {
    marginRight: 8,
    opacity: 0.7,
  },
  questTimer: {
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  filledStar: {
    color: '#FFD700', // Gold
  },
  emptyStar: {
    color: '#E0E0E0', // Light gray
  },
  trackedBadge: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  trackedBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  expandedContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  questDescription: {
    marginBottom: 12,
  },
  questDetails: {
    marginBottom: 12,
  },
  questDetailItem: {
    marginBottom: 4,
  },
  giverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giverIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  objectivesContainer: {
    marginBottom: 12,
  },
  objectiveItem: {
    marginBottom: 8,
  },
  objectiveInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  objectiveText: {
    flex: 1,
  },
  completedObjective: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  objectiveProgress: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  rewardsContainer: {
    marginBottom: 12,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  rewardIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  rewardText: {
    fontWeight: 'bold',
  },
  questActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    opacity: 0.5,
  },
});

export default QuestLog;
