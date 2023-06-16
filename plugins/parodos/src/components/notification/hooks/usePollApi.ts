import { alertApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { useInterval } from '@patternfly/react-core';
import { useEffect } from 'react';

export function usePollApi() {
  const { fetch } = useApi(fetchApiRef);
  const fetchUnreadNotificationsCount = useStore(
    state => state.fetchUnreadNotificationsCount,
  );
  const pollingInterval = useStore(state => state.pollingInterval);
  const initialized = useStore(state => state.initialized());
  const notificationsError = useStore(state => state.notificationsError);
  const alertApi = useApi(alertApiRef);
  const projectError = useStore(state => state.projectsError);
  const fetchProjects = useStore(state => state.fetchProjects);

  useEffect(() => {
    const error = notificationsError ?? projectError;
    if (!error) {
      return;
    }

    // eslint-disable-next-line no-console
    console.error(error);

    alertApi.post({
      message: 'Internal Server error',
      display: 'transient',
      severity: 'error',
    });
  }, [alertApi, notificationsError, projectError]);

  useInterval(() => {
    if (!initialized) {
      return;
    }

    fetchUnreadNotificationsCount(fetch);

    fetchProjects(fetch);
  }, pollingInterval);
}
