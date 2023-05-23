import React from 'react';
import { Progress } from '@backstage/core-components';

import { useInitializeStore } from '../hooks/useInitializeStore';
import { PluginRouter } from './PluginRouter';
import { usePollApi } from './notification/hooks/usePollApi';

export const App = () => {
  const { initialStateLoaded } = useInitializeStore();
  usePollApi();

  return initialStateLoaded ? <PluginRouter /> : <Progress />;
};
