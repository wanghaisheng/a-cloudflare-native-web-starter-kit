import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';
import { StoreItem, StoreCurrency } from './StoreSystem';

// Rarity colors
export const RARITY_COLORS = {
  common: '#9E9E9E',    // Gray
  uncommon: '#4CAF50',  // Green
  rare: '#2196F3',      // Blue
  epic: '#9C27B0',      // Purple
  legendary: '#FF9800', // Orange
};

interface StoreItemCardProps {
  item: StoreItem;
  currency?: StoreCurrency;
  onPress: (item: StoreItem) => void;
  featured?: boolean;
  style?: any;
}

const StoreItemCard: React.FC<StoreItemCardProps> = ({
  item,
  currency,
  onPress,
  featured = false,
  style,
}) => {
  const { theme } = useTheme();

  // Get rarity color (or default to common)
  const rarityColor = item.rarity
    ? RARITY_COLORS[item.rarity]
    : RARITY_COLORS.common;

  // Calculate the discounted price
  const discountedPrice = item.discount
    ? Math.round(item.price * (1 - item.discount / 100))
    : null;

  // Determine if item is limited time and if it has expired
  const isLimitedTime = item.limitedTime && item.limitedTimeEnd;
  const hasExpired = isLimitedTime && new Date() > new Date(item.limitedTimeEnd!);

  // Calculate remaining time for limited items
  const getRemainingTime = () => {
    if (!isLimitedTime || hasExpired) return '';

    const now = new Date();
    const end = new Date(item.limitedTimeEnd!);
    const diffMs = end.getTime() - now.getTime();

    // If less than an hour remains
    if (diffMs < 3600000) {
      const minutes = Math.floor(diffMs / 60000);
      return `${minutes}m left`;
    }

    // If less than a day remains
    if (diffMs < 86400000) {
      const hours = Math.floor(diffMs / 3600000);
      return `${hours}h left`;
    }

    // Otherwise show days
    const days = Math.floor(diffMs / 86400000);
    return `${days}d left`;
  };

  // Get accessibility label describing the item
  const getAccessibilityLabel = () => {
    let label = `${item.name}, ${item.rarity || 'common'} rarity`;

    if (discountedPrice) {
      label += `, discounted from ${item.price} to ${discountedPrice}`;
    } else {
      label += `, price ${item.price}`;
    }

    if (item.isNew) label += ', new item';
    if (featured) label += ', featured item';
    if (isLimitedTime && !hasExpired) label += `, limited time offer, ${getRemainingTime()}`;
    if (item.requiredLevel) label += `, requires level ${item.requiredLevel}`;

    return label;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderColor: rarityColor },
        featured && styles.featuredContainer,
        style,
      ]}
      onPress={() => onPress(item)}
      {...AccessibilityHelpers.combineA11yProps(
        getAccessibilityLabel(),
        item.description
      )}
    >
      {/* Item icon */}
      <View style={styles.imageContainer}>
        <Image
          source={item.icon}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Rarity indicator */}
        <View style={[styles.rarityIndicator, { backgroundColor: rarityColor }]} />
      </View>

      {/* Item details */}
      <View style={styles.detailsContainer}>
        <Text
          variant="body1"
          style={styles.itemName}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        {/* Price section */}
        <View style={styles.priceContainer}>
          {currency?.icon && (
            <Image source={currency.icon} style={styles.currencyIcon} />
          )}

          {discountedPrice ? (
            <View style={styles.discountContainer}>
              <Text style={styles.originalPrice}>
                {item.price}
              </Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {discountedPrice}
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>
              {item.price}
            </Text>
          )}
        </View>
      </View>

      {/* Badges */}
      <View style={styles.badgesContainer}>
        {item.isNew && (
          <View style={[styles.badge, styles.newBadge]}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}

        {item.discount && item.discount > 0 && (
          <View style={[styles.badge, styles.discountBadge]}>
            <Text style={styles.badgeText}>-{item.discount}%</Text>
          </View>
        )}

        {isLimitedTime && !hasExpired && (
          <View style={[styles.badge, styles.limitedBadge]}>
            <Text style={styles.badgeText}>{getRemainingTime()}</Text>
          </View>
        )}
      </View>

      {/* Required level */}
      {item.requiredLevel && (
        <View style={styles.levelContainer}>
          <Text style={styles.levelText}>
            Lvl {item.requiredLevel}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    overflow: 'hidden',
    position: 'relative',
  },
  featuredContainer: {
    borderWidth: 2,
    padding: 14,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  image: {
    width: '80%',
    height: 80,
  },
  rarityIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 20,
    height: 4,
    borderRadius: 2,
  },
  detailsContainer: {
    alignItems: 'center',
  },
  itemName: {
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currencyIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    marginRight: 4,
    fontSize: 12,
  },
  price: {
    fontWeight: 'bold',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: '#4CAF50',
  },
  discountBadge: {
    backgroundColor: '#F44336',
  },
  limitedBadge: {
    backgroundColor: '#FF9800',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  levelContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default StoreItemCard;
