import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Button } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';
import { StoreItem, StoreCurrency, PurchaseResult } from './StoreSystem';
import { RARITY_COLORS } from './StoreItemCard';

interface StoreItemDetailsProps {
  item: StoreItem;
  currency?: StoreCurrency;
  visible: boolean;
  onClose: () => void;
  onPurchase: (quantity: number) => Promise<PurchaseResult>;
}

const StoreItemDetails: React.FC<StoreItemDetailsProps> = ({
  item,
  currency,
  visible,
  onClose,
  onPurchase,
}) => {
  const { theme } = useTheme();
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [result, setResult] = useState<PurchaseResult | null>(null);

  const windowWidth = Dimensions.get('window').width;
  const isMobile = windowWidth < 768;

  // Reset state when modal closes or item changes
  React.useEffect(() => {
    if (visible) {
      setQuantity(1);
      setResult(null);
    }
  }, [visible, item]);

  // Get rarity color (or default to common)
  const rarityColor = item.rarity
    ? RARITY_COLORS[item.rarity]
    : RARITY_COLORS.common;

  // Get rarity label
  const getRarityLabel = () => {
    if (!item.rarity) return 'Common';

    // Capitalize first letter
    return item.rarity.charAt(0).toUpperCase() + item.rarity.slice(1);
  };

  // Calculate the discounted price
  const discountedPrice = item.discount
    ? Math.round(item.price * (1 - item.discount / 100))
    : null;

  // Calculate total price
  const totalPrice = (discountedPrice || item.price) * quantity;

  // Check if user can afford the item
  const canAfford = currency
    ? currency.amount >= totalPrice
    : false;

  // Check if user meets the level requirement
  const meetsLevelRequirement = !item.requiredLevel; // In a real app, compare with player level

  // Determine if purchase button should be disabled
  const purchaseDisabled = !canAfford || !meetsLevelRequirement || purchasing;

  // Increment quantity
  const incrementQuantity = () => {
    setQuantity(q => Math.min(q + 1, 99));
  };

  // Decrement quantity
  const decrementQuantity = () => {
    setQuantity(q => Math.max(q - 1, 1));
  };

  // Handle purchase
  const handlePurchase = async () => {
    setPurchasing(true);
    setResult(null);

    try {
      const purchaseResult = await onPurchase(quantity);
      setResult(purchaseResult);

      if (purchaseResult.success) {
        // Reset quantity after successful purchase
        setQuantity(1);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during purchase. Please try again.',
      });
    } finally {
      setPurchasing(false);
    }
  };

  // Render item stats if available
  const renderStats = () => {
    if (!item.stats || Object.keys(item.stats).length === 0) return null;

    return (
      <View style={styles.statsContainer}>
        <Text variant="h4" style={styles.sectionTitle}>Stats</Text>

        {Object.entries(item.stats).map(([statName, statValue]) => (
          <View key={statName} style={styles.statRow}>
            <Text variant="body2" style={styles.statName}>
              {statName}:
            </Text>
            <Text variant="body2" style={styles.statValue}>
              {typeof statValue === 'number' && statValue > 0 ? `+${statValue}` : statValue}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Render required items if any
  const renderRequirements = () => {
    if (!item.requiredLevel && (!item.requiredItems || item.requiredItems.length === 0)) {
      return null;
    }

    return (
      <View style={styles.requirementsContainer}>
        <Text variant="h4" style={styles.sectionTitle}>Requirements</Text>

        {item.requiredLevel && (
          <View style={styles.requirementRow}>
            <Text
              variant="body2"
              style={[
                styles.requirementText,
                !meetsLevelRequirement && styles.requirementNotMet,
              ]}
            >
              Player Level {item.requiredLevel}
            </Text>
          </View>
        )}

        {item.requiredItems && item.requiredItems.length > 0 && (
          item.requiredItems.map((reqItem, index) => (
            <View key={index} style={styles.requirementRow}>
              <Text variant="body2" style={styles.requirementText}>
                Requires: {reqItem}
              </Text>
            </View>
          ))
        )}
      </View>
    );
  };

  // Render purchase result
  const renderResult = () => {
    if (!result) return null;

    return (
      <View style={[
        styles.resultContainer,
        { backgroundColor: result.success ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }
      ]}>
        <Text
          style={[
            styles.resultText,
            { color: result.success ? '#4CAF50' : '#F44336' }
          ]}
        >
          {result.message}
        </Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer,
          isMobile ? styles.mobileContainer : styles.desktopContainer
        ]}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            {...AccessibilityHelpers.buttonA11yProps('Close dialog', false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <ScrollView style={styles.scrollView}>
            {/* Item header */}
            <View style={styles.headerContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={item.icon}
                  style={styles.itemImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.headerDetails}>
                <View style={styles.titleContainer}>
                  <Text variant="h2" style={styles.itemName}>
                    {item.name}
                  </Text>

                  <View style={[styles.rarityBadge, { backgroundColor: rarityColor }]}>
                    <Text style={styles.rarityText}>
                      {getRarityLabel()}
                    </Text>
                  </View>
                </View>

                <Text variant="body1" style={styles.itemDescription}>
                  {item.description}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Stats section */}
            {renderStats()}

            {/* Requirements section */}
            {renderRequirements()}

            {/* Result message */}
            {renderResult()}
          </ScrollView>

          {/* Purchase section */}
          <View style={styles.purchaseSection}>
            {/* Quantity selector */}
            <View style={styles.quantitySelector}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.disabledButton]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
                {...AccessibilityHelpers.buttonA11yProps('Decrease quantity', quantity <= 1)}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.quantityButton}
                onPress={incrementQuantity}
                {...AccessibilityHelpers.buttonA11yProps('Increase quantity', false)}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Price display */}
            <View style={styles.priceDisplay}>
              {discountedPrice ? (
                <View style={styles.discountedPriceContainer}>
                  <Text style={styles.originalTotalPrice}>
                    {item.price * quantity}
                  </Text>
                  <View style={styles.currentPriceContainer}>
                    {currency?.icon && (
                      <Image source={currency.icon} style={styles.currencyIcon} />
                    )}
                    <Text style={[
                      styles.totalPrice,
                      !canAfford && styles.cannotAffordPrice
                    ]}>
                      {totalPrice}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.currentPriceContainer}>
                  {currency?.icon && (
                    <Image source={currency.icon} style={styles.currencyIcon} />
                  )}
                  <Text style={[
                    styles.totalPrice,
                    !canAfford && styles.cannotAffordPrice
                  ]}>
                    {totalPrice}
                  </Text>
                </View>
              )}

              {!canAfford && (
                <Text style={styles.insufficientFunds}>
                  Insufficient {currency?.name || 'funds'}
                </Text>
              )}
            </View>

            {/* Purchase button */}
            <Button
              title={purchasing ? "Purchasing..." : "Purchase"}
              onPress={handlePurchase}
              disabled={purchaseDisabled}
              loading={purchasing}
              variant="primary"
              style={styles.purchaseButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mobileContainer: {
    width: '90%',
    maxHeight: '90%',
  },
  desktopContainer: {
    width: '60%',
    maxWidth: 600,
    maxHeight: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
  },
  headerDetails: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  itemName: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rarityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statName: {
    opacity: 0.7,
  },
  statValue: {
    fontWeight: 'bold',
  },
  requirementsContainer: {
    marginBottom: 16,
  },
  requirementRow: {
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
  },
  requirementNotMet: {
    color: '#F44336',
  },
  resultContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  resultText: {
    fontWeight: 'bold',
  },
  purchaseSection: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceDisplay: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 16,
  },
  discountedPriceContainer: {
    alignItems: 'flex-end',
  },
  originalTotalPrice: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
    fontSize: 12,
  },
  currentPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cannotAffordPrice: {
    color: '#F44336',
  },
  insufficientFunds: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  purchaseButton: {
    minWidth: 120,
  },
});

export default StoreItemDetails;
