import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { useTheme, ThemeStyleType } from '../../utils/theme';
import { Button, Card, Text } from '../core';

// Default avatar and icons
const DEFAULT_AVATAR = require('../../assets/images/placeholder.png');
const DEFAULT_CURRENCY_ICON = require('../../assets/images/placeholder.png');
const DEFAULT_ENERGY_ICON = require('../../assets/images/placeholder.png');

export type MainGameTabName =
  | 'home'
  | 'shop'
  | 'inventory'
  | 'tasks'
  | 'social';

export type ResourceDisplay = {
  name: string;
  value: number;
  icon?: any;
  color?: string;
  onPress?: () => void;
};

export type GameNotification = {
  id: string;
  title: string;
  message: string;
  isNew?: boolean;
  time?: string;
  icon?: any;
  action?: () => void;
};

export type GameTab = {
  name: MainGameTabName;
  label: string;
  icon: any; // React component or image source
  badgeCount?: number;
};

export type MainGameScreenProps = {
  playerName: string;
  playerLevel: number;
  playerAvatar?: any;
  playerExp?: {current: number, max: number};
  resources?: ResourceDisplay[];
  notifications?: GameNotification[];
  gameTitle?: string;
  backgroundImage?: any;
  tabs?: GameTab[];
  currentTab?: MainGameTabName;
  onTabChange?: (tab: MainGameTabName) => void;
  themeStyle?: ThemeStyleType;
  children?: React.ReactNode;
  onSettingsPress?: () => void;
  onProfilePress?: () => void;
};

export const MainGameInterface: React.FC<MainGameScreenProps> = ({
  playerName,
  playerLevel,
  playerAvatar = DEFAULT_AVATAR,
  playerExp = { current: 0, max: 100 },
  resources = [],
  notifications = [],
  gameTitle = 'Game Title',
  backgroundImage,
  tabs = [],
  currentTab = 'home',
  onTabChange,
  themeStyle,
  children,
  onSettingsPress,
  onProfilePress,
}) => {
  const { theme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Checking if there are any new notifications
  const hasNewNotifications = notifications.some(notification => notification.isNew);

  // Track device size for responsive design
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth > 768;

  // Get top bar styles based on theme
  const getTopBarStyle = () => {
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          backgroundColor: 'rgba(28, 28, 28, 0.85)',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.accent,
        };
      case 'animeStyle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.secondary,
        };
      case 'sciFiStyle':
        return {
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.accent,
        };
      case 'qStyleCartoon':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          marginHorizontal: 10,
        };
      case 'militaryStyle':
        return {
          backgroundColor: 'rgba(38, 50, 56, 0.95)',
          borderBottomWidth: 2,
          borderBottomColor: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: 'rgba(30, 30, 30, 0.85)',
        };
    }
  };

  // Get bottom bar styles based on theme
  const getBottomBarStyle = () => {
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          backgroundColor: 'rgba(28, 28, 28, 0.85)',
          borderTopWidth: 1,
          borderTopColor: theme.colors.accent,
        };
      case 'animeStyle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 2,
          borderTopColor: theme.colors.secondary,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginHorizontal: 10,
          paddingBottom: 10,
        };
      case 'sciFiStyle':
        return {
          backgroundColor: 'rgba(10, 10, 10, 0.9)',
          borderTopWidth: 1,
          borderTopColor: theme.colors.accent,
        };
      case 'qStyleCartoon':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginHorizontal: 10,
          paddingBottom: 10,
        };
      case 'militaryStyle':
        return {
          backgroundColor: 'rgba(38, 50, 56, 0.95)',
          borderTopWidth: 2,
          borderTopColor: theme.colors.primary,
        };
      default:
        return {
          backgroundColor: 'rgba(30, 30, 30, 0.85)',
        };
    }
  };

  // Get tab button styles based on theme and state
  const getTabButtonStyle = (tabName: MainGameTabName) => {
    const isActive = currentTab === tabName;

    // Base styles that apply regardless of theme
    const baseStyle = {
      backgroundColor: isActive ? theme.colors.primary : 'transparent',
      borderRadius: theme.borderRadius.small,
      padding: 8,
      opacity: isActive ? 1 : 0.7,
    };

    // Theme-specific modifications
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          ...baseStyle,
          borderRadius: 4,
          borderWidth: isActive ? 1 : 0,
          borderColor: theme.colors.accent,
        };
      case 'animeStyle':
        return {
          ...baseStyle,
          borderRadius: 20,
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
        };
      case 'sciFiStyle':
        return {
          ...baseStyle,
          borderRadius: 0,
          borderBottomWidth: isActive ? 2 : 0,
          borderBottomColor: theme.colors.accent,
          backgroundColor: isActive ? 'rgba(0, 188, 212, 0.2)' : 'transparent',
        };
      case 'qStyleCartoon':
        return {
          ...baseStyle,
          borderRadius: 16,
          backgroundColor: isActive ? theme.colors.primary : 'transparent',
          paddingVertical: 10,
        };
      case 'militaryStyle':
        return {
          ...baseStyle,
          borderRadius: 0,
          borderTopWidth: isActive ? 2 : 0,
          borderTopColor: theme.colors.accent,
          backgroundColor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  // Handle notification click
  const handleNotificationPress = (notification: GameNotification) => {
    if (notification.action) {
      notification.action();
    }
  };

  return (
    <ImageBackground
      source={backgroundImage || require('../../assets/images/placeholder.png')}
      style={styles.background}
    >
      {/* Top Bar */}
      <View style={[styles.topBar, getTopBarStyle()]}>
        <View style={styles.playerInfo}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={onProfilePress}
          >
            <Image
              source={playerAvatar}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.levelBadge}>
              <Text
                variant="caption"
                color="#FFFFFF"
                align="center"
                style={styles.levelText}
              >
                {playerLevel}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.nameExpContainer}>
            <Text variant="body1" style={styles.playerName}>
              {playerName}
            </Text>

            <View style={styles.expBarContainer}>
              <View
                style={[
                  styles.expBar,
                  {
                    width: `${(playerExp.current / playerExp.max) * 100}%`,
                    backgroundColor: theme.colors.primary
                  }
                ]}
              />
              <Text
                variant="caption"
                color={theme.colors.text}
                style={styles.expText}
              >
                {playerExp.current}/{playerExp.max} XP
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.resourcesContainer}>
          {resources.map((resource, index) => (
            <TouchableOpacity
              key={`resource-${index}`}
              style={styles.resourceItem}
              onPress={resource.onPress}
            >
              <Image
                source={resource.icon || DEFAULT_CURRENCY_ICON}
                style={styles.resourceIcon}
                resizeMode="contain"
              />
              <Text
                variant="body2"
                color={resource.color || theme.colors.text}
              >
                {resource.value.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.notificationButton,
              hasNewNotifications && styles.notificationButtonActive
            ]}
            onPress={() => setShowNotifications(true)}
          >
            <Text
              variant="body1"
              color={hasNewNotifications ? '#FFFFFF' : theme.colors.text}
            >
              📬
            </Text>
            {hasNewNotifications && (
              <View style={styles.notificationBadge}>
                <Text
                  variant="caption"
                  color="#FFFFFF"
                  align="center"
                  style={styles.notificationBadgeText}
                >
                  {notifications.filter(n => n.isNew).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onSettingsPress}
          >
            <Text variant="body1">⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomBar, getBottomBarStyle()]}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={`tab-${index}`}
            style={[
              styles.tabButton,
              getTabButtonStyle(tab.name)
            ]}
            onPress={() => onTabChange && onTabChange(tab.name)}
          >
            <View style={styles.tabButtonContent}>
              {/* This would typically be an icon component */}
              <Text variant="body1">{tab.name.charAt(0).toUpperCase()}</Text>

              <Text
                variant="caption"
                style={[
                  styles.tabLabel,
                  currentTab === tab.name && styles.activeTabLabel
                ]}
              >
                {tab.label}
              </Text>

              {tab.badgeCount && tab.badgeCount > 0 && (
                <View style={styles.tabBadge}>
                  <Text
                    variant="caption"
                    color="#FFFFFF"
                    align="center"
                    style={styles.tabBadgeText}
                  >
                    {tab.badgeCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.notificationsContainer,
            { backgroundColor: theme.colors.background }
          ]}>
            <View style={styles.notificationsHeader}>
              <Text variant="h3">Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <Text variant="body1">✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.notificationsList}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <TouchableOpacity
                    key={`notification-${notification.id || index}`}
                    style={[
                      styles.notificationItem,
                      notification.isNew && styles.newNotificationItem
                    ]}
                    onPress={() => handleNotificationPress(notification)}
                  >
                    <View style={styles.notificationIcon}>
                      <Text variant="body1">
                        {notification.isNew ? '🆕' : '📄'}
                      </Text>
                    </View>
                    <View style={styles.notificationContent}>
                      <Text
                        variant="body1"
                        style={notification.isNew && styles.newNotificationTitle}
                      >
                        {notification.title}
                      </Text>
                      <Text variant="caption">
                        {notification.message}
                      </Text>
                      {notification.time && (
                        <Text
                          variant="caption"
                          color={theme.colors.gray}
                          style={styles.notificationTime}
                        >
                          {notification.time}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyNotifications}>
                  <Text variant="body1" align="center">
                    No notifications yet
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingTop: 48, // Account for status bar
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000',
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  nameExpContainer: {
    flex: 1,
  },
  playerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expBarContainer: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  expBar: {
    height: '100%',
    borderRadius: 4,
  },
  expText: {
    position: 'absolute',
    right: 4,
    fontSize: 6,
    top: -2,
  },
  resourcesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  resourceIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  notificationButton: {
    marginLeft: 16,
    padding: 6,
    borderRadius: 20,
    position: 'relative',
  },
  notificationButtonActive: {
    backgroundColor: '#F44336',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsButton: {
    marginLeft: 16,
    padding: 6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 20, // Extra padding for bottom safe area
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 10,
  },
  activeTabLabel: {
    fontWeight: 'bold',
  },
  tabBadge: {
    position: 'absolute',
    top: -5,
    right: -15,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notificationsContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  notificationsList: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  newNotificationItem: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  newNotificationTitle: {
    fontWeight: 'bold',
  },
  notificationTime: {
    marginTop: 4,
    fontSize: 10,
  },
  emptyNotifications: {
    padding: 20,
    alignItems: 'center',
  },
});

export default MainGameInterface;
