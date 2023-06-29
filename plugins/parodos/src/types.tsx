import { BackstageTheme } from '@backstage/theme';

export interface ParodosConfig {
  backendUrl: string;
  workflows: {
    assessment: string;
  };
  pollingInterval: number;
}

export interface ParodosPluginTheme extends BackstageTheme {
  parodos: {
    headerBackground: string;
  };
}
