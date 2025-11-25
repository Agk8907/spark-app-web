import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme/colors';
import { spacing, borderRadius } from '../theme/spacing';
import typography from '../theme/typography';

const AppearanceSettings = () => {
  const { theme, themeMode, setThemeMode, accentColor, setAccentColor } = useTheme();

  if (!theme || !theme.primary) {
    return null;
  }

  const modes = [
    { id: 'light', label: 'Light', icon: 'sunny' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'settings-outline' },
  ];

  const accentColors = [
    colors.primary.main, // Default Purple
    colors.secondary.main, // Pink
    colors.accent.orange,
    colors.accent.cyan,
    colors.accent.green,
    '#FFD700', // Gold
    '#FF4500', // OrangeRed
    '#1E90FF', // DodgerBlue
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background.card }]}>
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>Appearance</Text>
      
      {/* Theme Mode Selector */}
      <View style={styles.modeContainer}>
        {modes.map((mode, index) => (
          <TouchableOpacity
            key={mode.id}
            style={[
              styles.modeButton,
              themeMode === mode.id && { backgroundColor: theme.primary.light + '20', borderColor: theme.primary.main },
              index !== modes.length - 1 && { marginRight: spacing.sm }
            ]}
            onPress={() => setThemeMode(mode.id)}
          >
            <Ionicons 
              name={mode.icon} 
              size={24} 
              color={themeMode === mode.id ? theme.primary.main : theme.text.secondary} 
            />
            <Text style={[
              styles.modeLabel, 
              { color: themeMode === mode.id ? theme.primary.main : theme.text.secondary }
            ]}>
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>Accent Color</Text>
      
      {/* Accent Color Picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorContainer}>
        {accentColors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              accentColor === color && styles.selectedColor
            ]}
            onPress={() => setAccentColor(color)}
          >
            {accentColor === color && (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // gap replaced with child margins
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  modeLabel: {
    marginTop: spacing.xs,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  colorContainer: {
    paddingVertical: spacing.xs,
    // gap replaced with child margins
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.2)',
  },
});

export default AppearanceSettings;
