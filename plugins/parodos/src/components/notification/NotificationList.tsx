import React, {
  type MouseEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
} from '@material-ui/core';
import { SelectedItems } from '@backstage/core-components';

import { NotificationOperation, NotificationState } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { NotificationContent } from '../../models/notification';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { NotificationListItem } from './NotificationListItem';
import { NotificationListHeader } from './NotificationListHeader';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  tbody: {
    '& tr:last-child': {
      borderBottom: `1px solid ${theme.palette.grey.A100}`,
    },
  },
}));

const isNotificationArchived = (notification: NotificationContent) =>
  notification.folder === 'archive';
const isNotificationRead = (notification: NotificationContent) =>
  notification.read;

export const NotificationList: React.FC = () => {
  const styles = useStyles();
  const notifications = useStore(state => state.notifications);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const deleteNotification = useStore(state => state.deleteNotification);
  const setNotificationState = useStore(state => state.setNotificationState);
  const notificationsCount = useStore(state => state.notificationsCount);
  const loading = useStore(state => state.notificationsLoading);
  const { fetch } = useApi(fetchApiRef);
  const [selected, setSelected] = useState<string[]>([]);

  const [notificationFilter, setNotificationFilter] =
    useState<NotificationState>('ALL');

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const errorApi = useApi(errorApiRef);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchNotifications({ state: notificationFilter, page, rowsPerPage, fetch });
  }, [fetch, notificationFilter, page, rowsPerPage, fetchNotifications]);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterChangeHandler = (filter: SelectedItems) => {
    setNotificationFilter(filter as NotificationState);
    setPage(0);
  };

  const getOnDelete =
    (
      notification: NotificationContent,
    ): React.MouseEventHandler<HTMLButtonElement> =>
    async e => {
      e.stopPropagation();
      try {
        await deleteNotification({ fetch, id: notification.id });
        await fetchNotifications({
          fetch,
          state: notificationFilter,
          page,
          rowsPerPage,
        });
      } catch (_) {
        errorApi.post(
          new Error(
            `Failed to delete notification: ${JSON.stringify(notification)}`,
          ),
        );
      }
    };

  const getSetNotificationState =
    (
      notification: NotificationContent,
      newState: NotificationOperation,
    ): React.MouseEventHandler<HTMLButtonElement> =>
    async e => {
      e.stopPropagation();
      try {
        await setNotificationState({ fetch, id: notification.id, newState });
        await fetchNotifications({
          fetch,
          state: notificationFilter,
          page,
          rowsPerPage,
        });
      } catch (_) {
        errorApi.post(
          new Error(
            `Failed to set notification to "${newState}": ${JSON.stringify(
              notification,
            )}`,
          ),
        );
      }
    };

  const handleCheckBoxChange = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const { id, checked } = e.target as HTMLInputElement;

      if (checked) {
        setSelected(previous => [...previous, id]);
      } else {
        setSelected(previous => previous.filter(c => c !== id));
      }
    },
    [],
  );

  const isSelected = useCallback(
    (id: string) => selected.includes(id),
    [selected],
  );

  return (
    <>
      <NotificationListHeader
        filterChangeHandler={filterChangeHandler}
        filter={notificationFilter}
        selected={selected.length}
      />
      <TableContainer component="div" className={styles.root}>
        <Table aria-label="notifications table">
          <TableBody className={styles.tbody}>
            {notifications.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                checkboxClickHandler={handleCheckBoxChange}
                isSelected={isSelected}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container direction="row" justifyContent="center">
        <TablePagination
          component="div"
          count={notificationsCount || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </>
  );
};
