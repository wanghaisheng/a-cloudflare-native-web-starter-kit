import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Card, Button } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';
import StoreItemCard from './StoreItemCard';
import StoreItemDetails from './StoreItemDetails';

// Store item data structure
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  icon: any; // Image source
  price: number;
  currency: string;
  category: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  discount?: number; // Percentage discount (0-100)
  limitedTime?: boolean;
  limitedTimeEnd?: Date;
  isNew?: boolean;
  isFeatured?: boolean;
  requiredLevel?: number;
  requiredItems?: string[];
  stats?: {
    [key: string]: number | string;
  };
  quantity?: number; // Available quantity (undefined means unlimited)
}

// Store category
export interface StoreCategory {
  id: string;
  name: string;
  icon?: any;
  featuredItem?: string; // ID of featured item for this category
}

// Currency type
export interface StoreCurrency {
  id: string;
  name: string;
  icon: any;
  amount: number;
  isPremium?: boolean;
}

// Purchase result
export interface PurchaseResult {
  success: boolean;
  message: string;
  newBalance?: number;
  itemId?: string;
}

// Store props
export interface StoreSystemProps {
  title?: string;
  items: StoreItem[];
  categories: StoreCategory[];
  currencies: StoreCurrency[];
  onPurchase: (item: StoreItem, quantity: number) => Promise<PurchaseResult>;
  onCurrencyPurchase?: (currencyId: string) => void;
  showFeatured?: boolean;
  showDiscounts?: boolean;
  showNew?: boolean;
  emptyStateMessage?: string;
  style?: any;
  themeStyle?: string;
}

const StoreSystem: React.FC<StoreSystemProps> = ({
  title = 'Store',
  items,
  categories,
  currencies,
  onPurchase,
  onCurrencyPurchase,
  showFeatured = true,
  showDiscounts = true,
  showNew = true,
  emptyStateMessage = 'No items available in the store',
  style,
  themeStyle,
}) => {
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);

  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  // Filter items by selected category
  const filteredItems = selectedCategory
    ? items.filter(item => item.category === selectedCategory)
    : items;

  // Get discounted items
  const discountedItems = items.filter(item => item.discount && item.discount > 0);

  // Get new items
  const newItems = items.filter(item => item.isNew);

  // Get featured items (one per category)
  const featuredItems = categories
    .map(category => {
      if (category.featuredItem) {
        return items.find(item => item.id === category.featuredItem);
      }
      return null;
    })
    .filter(item => item !== null) as StoreItem[];

  // Get currency by ID
  const getCurrency = (currencyId: string) => {
    return currencies.find(curr => curr.id === currencyId);
  };

  // Handle item press
  const handleItemPress = (item: StoreItem) => {
    setSelectedItem(item);
    setIsDetailsVisible(true);
  };

  // Close item details
  const handleCloseDetails = () => {
    setIsDetailsVisible(false);
  };

  // Handle purchase from details modal
  const handlePurchase = async (item: StoreItem, quantity: number) => {
    const result = await onPurchase(item, quantity);

    if (result.success) {
      // Update currency display
      const currency = getCurrency(item.currency);
      if (currency && result.newBalance !== undefined) {
        currency.amount = result.newBalance;
      }
    }

    return result;
  };

  // Render category tabs
  const renderCategoryTabs = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.selectedCategoryTab,
              {
                borderColor: theme.colors.primary,
                ...(selectedCategory === category.id && { backgroundColor: `${theme.colors.primary}20` }),
              },
            ]}
            onPress={() => setSelectedCategory(category.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: selectedCategory === category.id }}
            accessibilityLabel={`${category.name} category`}
          >
            {category.icon && (
              <Image source={category.icon} style={styles.categoryIcon} />
            )}
            <Text
              variant="body2"
              color={selectedCategory === category.id ? theme.colors.primary : undefined}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  // Render currency display
  const renderCurrencyDisplay = () => {
    return (
      <View style={styles.currencyContainer}>
        {currencies.map(currency => (
          <View key={currency.id} style={styles.currencyItem}>
            <View style={styles.currencyInfo}>
              {currency.icon && (
                <Image source={currency.icon} style={styles.currencyIcon} />
              )}
              <Text variant="body2" style={styles.currencyAmount}>
                {currency.amount.toLocaleString()}
              </Text>
            </View>

            {currency.isPremium && onCurrencyPurchase && (
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => onCurrencyPurchase(currency.id)}
                accessibilityLabel={`Add ${currency.name}`}
                accessibilityRole="button"
              >
                <Text variant="body2" color="#FFFFFF" style={styles.addButtonText}>
                  +
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Render featured section
  const renderFeaturedSection = () => {
    if (!showFeatured || featuredItems.length === 0) return null;

    return (
      <View style={styles.featuredSection}>
        <Text variant="h3" style={styles.sectionTitle}>
          Featured
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredItemsContainer}
        >
          {featuredItems.map(item => (
            <StoreItemCard
              key={item.id}
              item={item}
              onPress={handleItemPress}
              currency={getCurrency(item.currency)}
              featured
              style={styles.featuredItem}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render discounts section
  const renderDiscountsSection = () => {
    if (!showDiscounts || discountedItems.length === 0) return null;

    return (
      <View style={styles.discountsSection}>
        <Text variant="h3" style={styles.sectionTitle}>
          Special Offers
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.discountItemsContainer}
        >
          {discountedItems.map(item => (
            <StoreItemCard
              key={item.id}
              item={item}
              onPress={handleItemPress}
              currency={getCurrency(item.currency)}
              style={styles.discountItem}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render new items section
  const renderNewItemsSection = () => {
    if (!showNew || newItems.length === 0) return null;

    return (
      <View style={styles.newItemsSection}>
        <Text variant="h3" style={styles.sectionTitle}>
          New Arrivals
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newItemsContainer}
        >
          {newItems.map(item => (
            <StoreItemCard
              key={item.id}
              item={item}
              onPress={handleItemPress}
              currency={getCurrency(item.currency)}
              style={styles.newItem}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  // Render category items grid
  const renderCategoryItems = () => {
    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text variant="body1">{emptyStateMessage}</Text>
        </View>
      );
    }

    // Determine grid columns based on screen width
    const numColumns = isMobile ? 2 : 3;

    return (
      <FlatList
        data={filteredItems}
        renderItem={({ item }) => (
          <StoreItemCard
            item={item}
            onPress={handleItemPress}
            currency={getCurrency(item.currency)}
            style={styles.gridItem}
          />
        )}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContainer}
      />
    );
  };

  return (
    <Card
      title={title}
      style={[styles.container, style]}
      {...AccessibilityHelpers.combineA11yProps(`${title}`, 'In-game store for purchasing items')}
    >
      {/* Currency display */}
      {renderCurrencyDisplay()}

      {/* Category tabs */}
      {renderCategoryTabs()}

      <ScrollView style={styles.storeContent}>
        {/* Featured items */}
        {renderFeaturedSection()}

        {/* Discounted items */}
        {renderDiscountsSection()}

        {/* New items */}
        {renderNewItemsSection()}

        {/* Category header */}
        <Text variant="h3" style={styles.categoryTitle}>
          {categories.find(c => c.id === selectedCategory)?.name || 'All Items'}
        </Text>

        {/* Category items */}
        {renderCategoryItems()}
      </ScrollView>

      {/* Item details modal */}
      {selectedItem && (
        <StoreItemDetails
          item={selectedItem}
          currency={getCurrency(selectedItem.currency)}
          visible={isDetailsVisible}
          onClose={handleCloseDetails}
          onPurchase={(quantity) => handlePurchase(selectedItem, quantity)}
        />
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  currencyContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  currencyAmount: {
    fontWeight: 'bold',
  },
  addButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoriesContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  selectedCategoryTab: {
    borderWidth: 1,
  },
  categoryIcon: {
    width: 16,
    height: 16,
    marginRight: 4,
  },
  storeContent: {
    flex: 1,
    padding: 12,
  },
  featuredSection: {
    marginBottom: 16,
  },
  discountsSection: {
    marginBottom: 16,
  },
  newItemsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  categoryTitle: {
    marginBottom: 12,
  },
  featuredItemsContainer: {
    paddingBottom: 8,
  },
  discountItemsContainer: {
    paddingBottom: 8,
  },
  newItemsContainer: {
    paddingBottom: 8,
  },
  featuredItem: {
    width: 240,
    height: 180,
    marginRight: 12,
  },
  discountItem: {
    width: 200,
    height: 160,
    marginRight: 12,
  },
  newItem: {
    width: 200,
    height: 160,
    marginRight: 12,
  },
  gridContainer: {
    paddingBottom: 16,
  },
  gridRow: {
    justifyContent: 'flex-start',
  },
  gridItem: {
    flex: 1,
    margin: 6,
    maxWidth: Dimensions.get('window').width < 768 ? '48%' : '31%',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StoreSystem;
