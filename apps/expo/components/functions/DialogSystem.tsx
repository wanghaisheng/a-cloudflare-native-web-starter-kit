import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '../../utils/theme';
import { Text, Button } from '../core';
import { AccessibilityHelpers } from '../../utils/platform';

// Character type
export interface DialogCharacter {
  id: string;
  name: string;
  avatar: any; // Image source
  role?: string; // e.g., 'protagonist', 'villain', 'npc', etc.
  relationship?: number; // -100 to 100, representing relationship with player
}

// Dialog choice type
export interface DialogChoice {
  id: string;
  text: string;
  nextDialogId?: string;
  condition?: (state: any) => boolean;
  action?: (state: any) => any;
  relationshipChange?: { characterId: string; amount: number };
  disabled?: boolean;
}

// Dialog node type
export interface DialogNode {
  id: string;
  characterId: string;
  text: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'thinking' | 'confused' | string;
  animation?: 'none' | 'shake' | 'bounce' | 'pulse' | 'fade' | string;
  choices?: DialogChoice[];
  autoAdvance?: boolean;
  autoAdvanceDelay?: number; // in milliseconds
  nextDialogId?: string;
  background?: any; // Image source
  sound?: any; // Sound source
  showOnce?: boolean;
}

// Dialog props
export interface DialogSystemProps {
  visible: boolean;
  onClose: () => void;
  initialDialogId: string;
  dialogNodes: DialogNode[];
  characters: DialogCharacter[];
  onDialogComplete?: (finalState: any) => void;
  initialState?: any;
  dialogTitle?: string;
  style?: any;
  themeStyle?: string;
}

const DialogSystem: React.FC<DialogSystemProps> = ({
  visible,
  onClose,
  initialDialogId,
  dialogNodes,
  characters,
  onDialogComplete,
  initialState = {},
  dialogTitle = 'Conversation',
  style,
  themeStyle,
}) => {
  const { theme } = useTheme();
  const [currentNodeId, setCurrentNodeId] = useState<string>(initialDialogId);
  const [dialogState, setDialogState] = useState<any>(initialState);
  const [textOpacity] = useState(new Animated.Value(0));
  const [choicesOpacity] = useState(new Animated.Value(0));
  const [choicesEnabled, setChoicesEnabled] = useState(false);
  const [dialogHistory, setDialogHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Window dimensions
  const { width: windowWidth } = Dimensions.get('window');

  // Get current dialog node
  const currentNode = dialogNodes.find(node => node.id === currentNodeId);

  // Get character for current node
  const currentCharacter = currentNode
    ? characters.find(char => char.id === currentNode.characterId)
    : null;

  // Reset dialog when initialDialogId changes
  useEffect(() => {
    if (visible) {
      setCurrentNodeId(initialDialogId);
      setDialogHistory([]);
      setDialogState(initialState);
      setShowHistory(false);
    }
  }, [visible, initialDialogId, initialState]);

  // Handle dialog animation and auto-advance
  useEffect(() => {
    if (!currentNode || !visible) return;

    // Add dialog to history
    setDialogHistory(prev => [...prev, currentNodeId]);

    // Animate text appearance
    Animated.sequence([
      Animated.timing(textOpacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // If there are choices, animate them after a delay
    if (currentNode.choices && currentNode.choices.length > 0) {
      // Disable choices during animation
      setChoicesEnabled(false);

      // Animate choices appearance
      Animated.sequence([
        Animated.timing(choicesOpacity, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.delay(300), // Delay to let the player read the text
        Animated.timing(choicesOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Enable choices after animation
        setChoicesEnabled(true);
      });
    }

    // Handle auto-advance
    if (currentNode.autoAdvance && currentNode.nextDialogId) {
      const timer = setTimeout(() => {
        handleAdvanceDialog(currentNode.nextDialogId!);
      }, currentNode.autoAdvanceDelay || 2000);

      return () => clearTimeout(timer);
    }
  }, [currentNodeId, visible, currentNode]);

  // Handle advancing to next dialog node
  const handleAdvanceDialog = (nextNodeId?: string) => {
    // If no next node, end dialog
    if (!nextNodeId) {
      // Call onDialogComplete if provided
      if (onDialogComplete) {
        onDialogComplete(dialogState);
      }

      // Close dialog
      onClose();
      return;
    }

    // Set next node
    setCurrentNodeId(nextNodeId);
  };

  // Handle dialog choice selection
  const handleChoiceSelect = (choice: DialogChoice) => {
    // If disabled, do nothing
    if (choice.disabled) return;

    // Execute choice action if any
    let newState = { ...dialogState };
    if (choice.action) {
      newState = choice.action(newState);
      setDialogState(newState);
    }

    // Update relationship if specified
    if (choice.relationshipChange) {
      const { characterId, amount } = choice.relationshipChange;

      // Find character
      const charIndex = characters.findIndex(c => c.id === characterId);

      if (charIndex >= 0) {
        const character = characters[charIndex];

        // Update relationship within bounds
        const currentRelationship = character.relationship || 0;
        const newRelationship = Math.max(-100, Math.min(100, currentRelationship + amount));

        // Update character
        characters[charIndex] = {
          ...character,
          relationship: newRelationship,
        };
      }
    }

    // Advance to next dialog
    handleAdvanceDialog(choice.nextDialogId);
  };

  // Toggle dialog history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Format dialog text with potential variables
  const formatDialogText = (text: string) => {
    // Replace variables in form of {variable} with values from dialogState
    return text.replace(/\{(\w+)\}/g, (match, variable) => {
      return dialogState[variable] !== undefined ? dialogState[variable] : match;
    });
  };

  // Render character avatar with emotion
  const renderCharacterAvatar = () => {
    if (!currentCharacter) return null;

    return (
      <View style={styles.avatarContainer}>
        <Image
          source={currentCharacter.avatar}
          style={styles.avatar}
          accessibilityLabel={`${currentCharacter.name}'s avatar`}
        />

        {currentNode?.emotion && currentNode.emotion !== 'neutral' && (
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>
              {currentNode.emotion.charAt(0).toUpperCase() + currentNode.emotion.slice(1)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // Render dialog content
  const renderDialogContent = () => {
    if (!currentNode || !currentCharacter) return null;

    return (
      <View style={styles.dialogContent}>
        {/* Character name */}
        <View style={styles.characterNameContainer}>
          <Text variant="body1" style={styles.characterName}>
            {currentCharacter.name}
          </Text>

          {currentCharacter.role && (
            <Text variant="caption" style={styles.characterRole}>
              {currentCharacter.role}
            </Text>
          )}
        </View>

        {/* Dialog text */}
        <Animated.View style={[styles.textContainer, { opacity: textOpacity }]}>
          <Text variant="body1" style={styles.dialogText}>
            {formatDialogText(currentNode.text)}
          </Text>
        </Animated.View>

        {/* Dialog choices */}
        {currentNode.choices && currentNode.choices.length > 0 && (
          <Animated.View style={[styles.choicesContainer, { opacity: choicesOpacity }]}>
            {currentNode.choices.map((choice) => {
              // Check if choice is disabled by condition
              const isDisabled = choice.condition
                ? !choice.condition(dialogState)
                : !!choice.disabled;

              return (
                <TouchableOpacity
                  key={choice.id}
                  style={[
                    styles.choiceButton,
                    isDisabled && styles.disabledChoice,
                    { borderColor: theme.colors.primary }
                  ]}
                  onPress={() => choicesEnabled && handleChoiceSelect(choice)}
                  disabled={isDisabled || !choicesEnabled}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isDisabled }}
                  accessibilityLabel={choice.text}
                >
                  <Text
                    variant="body2"
                    style={[
                      styles.choiceText,
                      isDisabled && styles.disabledChoiceText
                    ]}
                  >
                    {formatDialogText(choice.text)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        )}

        {/* Continue button for auto-advance dialogs */}
        {(!currentNode.choices || currentNode.choices.length === 0) && currentNode.nextDialogId && (
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => handleAdvanceDialog(currentNode.nextDialogId)}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text color="#FFFFFF" style={styles.continueButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render dialog history
  const renderDialogHistory = () => {
    return (
      <ScrollView style={styles.historyContainer}>
        {dialogHistory.map((nodeId, index) => {
          const node = dialogNodes.find(n => n.id === nodeId);
          if (!node) return null;

          const character = characters.find(c => c.id === node.characterId);
          if (!character) return null;

          return (
            <View key={`${nodeId}-${index}`} style={styles.historyItem}>
              <Text variant="body2" style={styles.historyCharacter}>
                {character.name}:
              </Text>
              <Text variant="body2" style={styles.historyText}>
                {node.text}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  // If not visible, return null
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[
          styles.dialogContainer,
          windowWidth < 768 ? styles.mobileDialog : styles.desktopDialog,
          style,
        ]}>
          {/* Dialog header */}
          <View style={styles.dialogHeader}>
            <Text variant="h3" style={styles.dialogTitle}>
              {dialogTitle}
            </Text>

            <View style={styles.dialogControls}>
              {/* History button */}
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  showHistory && styles.activeControlButton,
                ]}
                onPress={toggleHistory}
                accessibilityRole="button"
                accessibilityLabel="Toggle dialog history"
                accessibilityHint="Shows previous conversation history"
              >
                <Text style={styles.controlButtonText}>📜</Text>
              </TouchableOpacity>

              {/* Close button */}
              <TouchableOpacity
                style={styles.controlButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close dialog"
              >
                <Text style={styles.controlButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dialog body */}
          <View style={styles.dialogBody}>
            {showHistory ? (
              renderDialogHistory()
            ) : (
              <>
                {/* Character avatar */}
                {renderCharacterAvatar()}

                {/* Dialog content */}
                {renderDialogContent()}
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  mobileDialog: {
    width: '90%',
    maxHeight: '80%',
  },
  desktopDialog: {
    width: '60%',
    maxWidth: 800,
    maxHeight: '80%',
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  dialogTitle: {
    fontWeight: 'bold',
  },
  dialogControls: {
    flexDirection: 'row',
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  activeControlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  controlButtonText: {
    fontSize: 16,
  },
  dialogBody: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  emotionBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emotionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  dialogContent: {
    flex: 1,
  },
  characterNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  characterName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  characterRole: {
    opacity: 0.7,
  },
  textContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  dialogText: {
    fontSize: 16,
    lineHeight: 24,
  },
  choicesContainer: {
    marginBottom: 16,
  },
  choiceButton: {
    marginBottom: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  disabledChoice: {
    opacity: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.1) !important',
  },
  choiceText: {
    fontSize: 14,
  },
  disabledChoiceText: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
  continueButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  continueButtonText: {
    fontWeight: 'bold',
  },
  historyContainer: {
    maxHeight: 400,
  },
  historyItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  historyCharacter: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyText: {
    opacity: 0.8,
  },
});

export default DialogSystem;
