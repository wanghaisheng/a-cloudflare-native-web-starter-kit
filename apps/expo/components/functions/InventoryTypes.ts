import { ThemeStyleType } from '../../utils/theme';

// Item rarity levels
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// Item types/categories
export type ItemType =
  | 'weapon'
  | 'armor'
  | 'accessory'
  | 'consumable'
  | 'material'
  | 'quest'
  | 'special';

// Inventory item data structure
export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  icon: any; // Image source
  type: ItemType;
  rarity: ItemRarity;
  quantity: number;
  maxStack?: number;
  value?: number; // In-game currency value
  level?: number; // Required level
  equipped?: boolean;
  locked?: boolean;
  stats?: {
    [key: string]: number;
  };
  effects?: string[];
  favorite?: boolean;
}

// Inventory tab for categorization
export interface InventoryTab {
  id: string;
  label: string;
  icon: any;
  filter?: (item: InventoryItem) => boolean;
}

// Layout types
export type InventoryLayout = 'grid' | 'list' | 'detailed';

// Sort options
export type InventorySortOption =
  | 'name-asc'
  | 'name-desc'
  | 'rarity-asc'
  | 'rarity-desc'
  | 'level-asc'
  | 'level-desc'
  | 'value-asc'
  | 'value-desc'
  | 'quantity-asc'
  | 'quantity-desc';

// Item action types
export type ItemAction =
  | 'use'
  | 'equip'
  | 'unequip'
  | 'sell'
  | 'discard'
  | 'lock'
  | 'unlock'
  | 'favorite'
  | 'unfavorite';

// Props for the InventorySystem component
export interface InventorySystemProps {
  items: InventoryItem[];
  tabs?: InventoryTab[];
  defaultTab?: string;
  maxCapacity?: number;
  layout?: InventoryLayout;
  sortOption?: InventorySortOption;
  searchEnabled?: boolean;
  emptyStateMessage?: string;
  themeStyle?: ThemeStyleType;
  onItemPress?: (item: InventoryItem) => void;
  onItemAction?: (item: InventoryItem, action: ItemAction) => void;
  onSort?: (option: InventorySortOption) => void;
  onSearch?: (query: string) => void;
  onTabChange?: (tabId: string) => void;
}

// Item details modal props
export interface ItemDetailsProps {
  item: InventoryItem;
  visible: boolean;
  onClose: () => void;
  onAction: (action: ItemAction) => void;
  themeStyle?: ThemeStyleType;
}

// Color scheme for rarity levels
export const RARITY_COLORS = {
  common: '#B0BEC5',      // Gray
  uncommon: '#4CAF50',    // Green
  rare: '#2196F3',        // Blue
  epic: '#9C27B0',        // Purple
  legendary: '#FFC107',   // Gold
};

// Default sorting function
export const sortItems = (
  items: InventoryItem[],
  sortOption: InventorySortOption
): InventoryItem[] => {
  const sortedItems = [...items];

  switch (sortOption) {
    case 'name-asc':
      return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    case 'name-desc':
      return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
    case 'rarity-asc':
      return sortedItems.sort((a, b) => {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      });
    case 'rarity-desc':
      return sortedItems.sort((a, b) => {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
        return rarityOrder[b.rarity] - rarityOrder[a.rarity];
      });
    case 'level-asc':
      return sortedItems.sort((a, b) => (a.level || 0) - (b.level || 0));
    case 'level-desc':
      return sortedItems.sort((a, b) => (b.level || 0) - (a.level || 0));
    case 'value-asc':
      return sortedItems.sort((a, b) => (a.value || 0) - (b.value || 0));
    case 'value-desc':
      return sortedItems.sort((a, b) => (b.value || 0) - (a.value || 0));
    case 'quantity-asc':
      return sortedItems.sort((a, b) => a.quantity - b.quantity);
    case 'quantity-desc':
      return sortedItems.sort((a, b) => b.quantity - a.quantity);
    default:
      return sortedItems;
  }
};

// Stats display formats
export const STAT_DISPLAY_NAMES: Record<string, string> = {
  attack: 'Attack',
  defense: 'Defense',
  hp: 'Health',
  mp: 'Mana',
  speed: 'Speed',
  strength: 'Strength',
  dexterity: 'Dexterity',
  intelligence: 'Intelligence',
  vitality: 'Vitality',
  luck: 'Luck',
  critRate: 'Critical Rate',
  critDamage: 'Critical Damage',
  // Add more stats as needed
};
