import { configApiRef, useApi } from '@backstage/core-plugin-api';
import type { ParodosConfig } from '../../types';

export const useGetAppConfig = (): ParodosConfig => {
  const configApi = useApi(configApiRef);

  return {
    backendUrl: configApi.getString('backend.baseUrl'),
    workflows: {
      assessment: configApi.getString('parodos.workflows.assessment'),
      assessmentTask: configApi.getString('parodos.workflows.assessmentTask'),
    },
  };
};
