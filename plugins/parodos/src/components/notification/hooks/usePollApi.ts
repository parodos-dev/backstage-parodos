import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { useInterval } from '@patternfly/react-core';
import { useEffect } from 'react';

export function usePollApi() {
  const { fetch } = useApi(fetchApiRef);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const pollingInterval = useStore(
    state => state.pollingInterval,
  );
  const initialized = useStore(state => state.initialized());
  const notificationsError = useStore(state => state.notificationsError);
  const errorApi = useApi(errorApiRef);
  const projectError = useStore(state => state.projectsError);
  const fetchProjects = useStore(state => state.fetchProjects);

  useEffect(() => {
    const error = notificationsError ?? projectError;
    if (!error) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(error);

    errorApi.post(new Error(`Internal server error.`));
  }, [errorApi, notificationsError, projectError]);

  useInterval(() => {
    if (!initialized) {
      return;
    }

    fetchNotifications({
      filter: 'ALL',
      page: 1,
      rowsPerPage: 50,
      fetch,
    });

    fetchProjects(fetch);
  }, pollingInterval);
}
