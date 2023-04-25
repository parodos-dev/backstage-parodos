import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { useMemo } from 'react';
import type { ParodosConfig } from '../../types';

export const useGetAppConfig = (): ParodosConfig => {
  const configApi = useApi(configApiRef);

  const config = useMemo(
    () => ({
      backendUrl: configApi.getString('backend.baseUrl'),
      workflows: {
        assessment: configApi.getString('parodos.workflows.assessment'),
        assessmentTask: configApi.getString('parodos.workflows.assessmentTask'),
      },
    }),
    [configApi],
  );

  return config;
};
