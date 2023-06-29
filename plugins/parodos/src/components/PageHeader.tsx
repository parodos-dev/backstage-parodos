import React from 'react';
import { Header } from '@backstage/core-components';
import { useTheme } from '@material-ui/core';
import { ParodosPluginTheme } from '../types';

export const PageHeader: React.FC = () => {
  const theme = useTheme<Partial<ParodosPluginTheme>>();

  return (
    <Header
      title="Parodos"
      style={
        theme.parodos?.headerBackground
          ? { background: theme.parodos.headerBackground }
          : undefined
      }
    />
  );
};
