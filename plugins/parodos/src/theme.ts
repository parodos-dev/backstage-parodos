import { BackstageTheme } from '@backstage/theme';
import { ParodosPluginTheme } from './types';

const createParodosThemeOverrides = (
  _theme: BackstageTheme,
): ParodosPluginTheme['parodos'] => ({
  headerBackground: '#0E2465',
});

export const createParodosTheme = <T extends BackstageTheme>(
  theme: T & Partial<ParodosPluginTheme>,
) => ({
  ...theme,
  parodos: {
    ...createParodosThemeOverrides(theme),
    ...theme.parodos,
  },
});
