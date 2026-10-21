import { useColorScheme } from 'react-native';

/**
 * Single place to rename the app. TBD — everything else reads this instead
 * of a hardcoded string.
 */
export const APP_NAME = 'Pawlace';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'seasonal';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  coin: string;
  success: string;
  danger: string;
  overlay: string;
  rarity: Record<Rarity, string>;
};

const lightColors: ThemeColors = {
  background: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceAlt: '#FFEFD9',
  card: '#FFFFFF',
  border: '#F0DCC0',
  text: '#43302A',
  textMuted: '#8C7568',
  textOnPrimary: '#FFFFFF',
  primary: '#FF8A5B',
  primaryDark: '#E8713F',
  secondary: '#5EC9B3',
  accent: '#FFC857',
  coin: '#F5A623',
  success: '#59B569',
  danger: '#E8604C',
  overlay: 'rgba(67, 48, 42, 0.45)',
  rarity: {
    common: '#9AA5B1',
    uncommon: '#5EC9B3',
    rare: '#6C8BFF',
    seasonal: '#E85FD0',
  },
};

const darkColors: ThemeColors = {
  background: '#241A16',
  surface: '#352620',
  surfaceAlt: '#3F2D25',
  card: '#3A2A23',
  border: '#4A362C',
  text: '#FBEFE6',
  textMuted: '#C2A896',
  textOnPrimary: '#FFFFFF',
  primary: '#FF9868',
  primaryDark: '#FF7A3D',
  secondary: '#6FDCC6',
  accent: '#FFD268',
  coin: '#FFC24D',
  success: '#6FCB7E',
  danger: '#FF7B68',
  overlay: 'rgba(0, 0, 0, 0.55)',
  rarity: {
    common: '#A9B3BE',
    uncommon: '#6FDCC6',
    rare: '#8AA2FF',
    seasonal: '#F083E0',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
};

export const fontWeights = {
  regular: '400' as const,
  medium: '600' as const,
  bold: '800' as const,
};

export type Theme = {
  scheme: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
};

/** The one hook every screen uses to read colors/spacing/radii/fonts. */
export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radii,
    fontSizes,
    fontWeights,
  };
}

export function rarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common':
      return 'Common';
    case 'uncommon':
      return 'Uncommon';
    case 'rare':
      return 'Rare';
    case 'seasonal':
      return 'Seasonal';
  }
}
