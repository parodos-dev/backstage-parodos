import { alertApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { useInterval } from '@patternfly/react-core';
import { useEffect } from 'react';

export function usePollApi() {
  const { fetch } = useApi(fetchApiRef);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const pollingInterval = useStore(state => state.pollingInterval);
  const initialized = useStore(state => state.initialized());
  const notificationsError = useStore(state => state.notificationsError);
  const alertApi = useApi(alertApiRef);
  const projectError = useStore(state => state.projectsError);
  const fetchProjects = useStore(state => state.fetchProjects);
  const fetchRequestAccessStatuses = useStore(
    state => state.fetchRequestAccessStatuses,
  );

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

    fetchNotifications({
      filter: 'ALL',
      page: 0,
      rowsPerPage: 50,
      fetch,
    });

    fetchProjects(fetch);
    fetchRequestAccessStatuses(fetch);
  }, pollingInterval);
}
