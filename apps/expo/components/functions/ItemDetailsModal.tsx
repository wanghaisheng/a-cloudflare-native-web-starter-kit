import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ItemDetailsProps, RARITY_COLORS, STAT_DISPLAY_NAMES, ItemAction } from './InventoryTypes';
import { useTheme } from '../../utils/theme';
import { Text, Button } from '../core';

export const ItemDetailsModal: React.FC<ItemDetailsProps> = ({
  item,
  visible,
  onClose,
  onAction,
  themeStyle,
}) => {
  const { theme } = useTheme();
  const screenWidth = Dimensions.get('window').width;

  // Determine which actions are available for this item
  const getAvailableActions = (): { action: ItemAction; label: string }[] => {
    const actions: { action: ItemAction; label: string }[] = [];

    // Equipment actions
    if (item.equipped) {
      actions.push({ action: 'unequip', label: 'Unequip' });
    } else if (['weapon', 'armor', 'accessory'].includes(item.type)) {
      actions.push({ action: 'equip', label: 'Equip' });
    }

    // Consumable items
    if (item.type === 'consumable') {
      actions.push({ action: 'use', label: 'Use' });
    }

    // General actions
    actions.push({ action: 'sell', label: 'Sell' });

    if (item.locked) {
      actions.push({ action: 'unlock', label: 'Unlock' });
    } else {
      actions.push({ action: 'lock', label: 'Lock' });
    }

    if (item.favorite) {
      actions.push({ action: 'unfavorite', label: 'Remove Favorite' });
    } else {
      actions.push({ action: 'favorite', label: 'Favorite' });
    }

    actions.push({ action: 'discard', label: 'Discard' });

    return actions;
  };

  // Get the color for the item's rarity
  const getRarityColor = () => {
    return RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  };

  // Get the background for the modal based on theme and rarity
  const getModalBackground = () => {
    switch (themeStyle) {
      case 'chineseStyle':
        return {
          backgroundColor: 'rgba(28, 28, 28, 0.95)',
          borderWidth: 1,
          borderColor: getRarityColor(),
        };
      case 'animeStyle':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 20,
          borderWidth: 2,
          borderColor: getRarityColor(),
        };
      case 'sciFiStyle':
        return {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          borderWidth: 1,
          borderColor: getRarityColor(),
        };
      case 'qStyleCartoon':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 30,
          borderWidth: 3,
          borderColor: getRarityColor(),
        };
      case 'militaryStyle':
        return {
          backgroundColor: 'rgba(38, 50, 56, 0.95)',
          borderWidth: 2,
          borderColor: getRarityColor(),
        };
      default:
        return {
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          borderWidth: 1,
          borderColor: getRarityColor(),
        };
    }
  };

  // Format the rarity text
  const getRarityText = () => {
    return item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, getModalBackground()]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text
                variant="h3"
                style={[styles.itemName, { color: getRarityColor() }]}
              >
                {item.name}
              </Text>
              <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
                <Text variant="caption" color="#FFFFFF">
                  {getRarityText()}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text variant="h3">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Item content */}
          <ScrollView style={styles.contentScroll}>
            <View style={styles.itemContent}>
              {/* Item image and basic info */}
              <View style={styles.itemBasicInfo}>
                <View style={[styles.imageContainer, { borderColor: getRarityColor() }]}>
                  <Image
                    source={item.icon}
                    style={styles.itemImage}
                    resizeMode="contain"
                  />
                  {item.equipped && (
                    <View style={styles.equippedBadge}>
                      <Text variant="caption" color="#FFFFFF">
                        Equipped
                      </Text>
                    </View>
                  )}
                  {item.locked && (
                    <View style={styles.lockedIndicator}>
                      <Text variant="body1">🔒</Text>
                    </View>
                  )}
                  {item.favorite && (
                    <View style={styles.favoriteIndicator}>
                      <Text variant="body1">⭐</Text>
                    </View>
                  )}
                </View>

                <View style={styles.itemMetaInfo}>
                  <Text variant="body2" style={styles.itemTypeText}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>

                  {item.level !== undefined && (
                    <Text variant="body2" style={styles.itemLevelText}>
                      Level Req: {item.level}
                    </Text>
                  )}

                  {item.value !== undefined && (
                    <Text variant="body2" style={styles.itemValueText}>
                      Value: {item.value} gold
                    </Text>
                  )}

                  <Text variant="body2" style={styles.itemQuantityText}>
                    Quantity: {item.quantity}
                    {item.maxStack ? `/${item.maxStack}` : ''}
                  </Text>
                </View>
              </View>

              {/* Item description */}
              {item.description && (
                <View style={styles.descriptionContainer}>
                  <Text variant="body1" style={styles.descriptionText}>
                    {item.description}
                  </Text>
                </View>
              )}

              {/* Item stats */}
              {item.stats && Object.keys(item.stats).length > 0 && (
                <View style={styles.statsContainer}>
                  <Text variant="h4" style={styles.sectionTitle}>
                    Stats
                  </Text>
                  {Object.entries(item.stats).map(([statKey, statValue]) => (
                    <View key={statKey} style={styles.statRow}>
                      <Text variant="body2" style={styles.statName}>
                        {STAT_DISPLAY_NAMES[statKey] || statKey}
                      </Text>
                      <Text
                        variant="body2"
                        style={[styles.statValue, { color: statValue > 0 ? '#4CAF50' : '#F44336' }]}
                      >
                        {statValue > 0 ? '+' : ''}{statValue}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Item effects */}
              {item.effects && item.effects.length > 0 && (
                <View style={styles.effectsContainer}>
                  <Text variant="h4" style={styles.sectionTitle}>
                    Effects
                  </Text>
                  {item.effects.map((effect, index) => (
                    <View key={index} style={styles.effectRow}>
                      <Text variant="caption" style={styles.effectBullet}>
                        •
                      </Text>
                      <Text variant="body2" style={styles.effectText}>
                        {effect}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {getAvailableActions().map((actionItem, index) => (
              <Button
                key={actionItem.action}
                title={actionItem.label}
                variant={
                  actionItem.action === 'discard'
                    ? 'outline'
                    : actionItem.action === 'equip' || actionItem.action === 'use'
                    ? 'primary'
                    : 'secondary'
                }
                size="small"
                style={[
                  styles.actionButton,
                  // Different styling for destructive actions
                  actionItem.action === 'discard' && { borderColor: '#F44336' },
                ]}
                textStyle={
                  actionItem.action === 'discard' ? { color: '#F44336' } : undefined
                }
                onPress={() => onAction(actionItem.action)}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closeButton: {
    padding: 8,
  },
  contentScroll: {
    maxHeight: 400,
  },
  itemContent: {
    padding: 16,
  },
  itemBasicInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  equippedBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  lockedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#FFC107',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMetaInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  itemTypeText: {
    marginBottom: 4,
  },
  itemLevelText: {
    marginBottom: 4,
  },
  itemValueText: {
    marginBottom: 4,
  },
  itemQuantityText: {
    marginBottom: 4,
  },
  descriptionContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  descriptionText: {
    fontStyle: 'italic',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statName: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
  },
  effectsContainer: {
    marginBottom: 16,
  },
  effectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  effectBullet: {
    marginRight: 8,
  },
  effectText: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
  },
  actionButton: {
    marginLeft: 8,
    marginBottom: 8,
  },
});

export default ItemDetailsModal;
