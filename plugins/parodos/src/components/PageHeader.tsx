import React from 'react';
import { Header } from '@backstage/core-components';
import { useTheme } from '@material-ui/core';
import { ParodosPluginTheme } from '../types';

export const PageHeader: React.FC = () => {
  const theme = useTheme<ParodosPluginTheme>();

  return (
    <Header
      title="Parodos"
      style={{ background: theme.parodos.headerBackground }}
    />
  );
};
