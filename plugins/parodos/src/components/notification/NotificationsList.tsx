import React, {
  type MouseEvent,
  type ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Dialog,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
} from '@material-ui/core';
import type { NotificationsSlice, NotificationState } from '../../stores/types';
import { NotificationContent } from '../../models/notification';
import { errorApiRef, type FetchApi, useApi } from '@backstage/core-plugin-api';
import { NotificationListItem } from './NotificationsListItem';
import { NotificationListHeader } from './NotificationsListHeader';
import { Confirm } from './Confirm';
import { Progress, SelectedItems } from '@backstage/core-components';
import { assert } from 'assert-ts';
import { Alert } from '@material-ui/lab';
import DialogContent from '@material-ui/core/DialogContent';

const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: theme.breakpoints.values.xl,
  },
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

type Action = 'DELETE' | 'ARCHIVE';

type NotificationListProps = Pick<
  NotificationsSlice,
  | 'notifications'
  | 'fetchNotifications'
  | 'deleteNotification'
  | 'notificationsLoading'
  | 'setNotificationState'
> & { fetch: FetchApi['fetch'] };

export function NotificationList({
  notifications,
  fetchNotifications,
  deleteNotification,
  notificationsLoading: loading,
  setNotificationState,
  fetch,
}: NotificationListProps): JSX.Element {
  const styles = useStyles();
  const [selectedNotifications, setSelectedNotifications] = useState<
    NotificationContent[]
  >([]);
  const [dialogOpen, setOpenDialog] = useState(false);
  const [action, setAction] = useState<Action>('ARCHIVE');
  const [showAlert, setShowAlert] = useState(false);

  const [notificationFilter, setNotificationFilter] =
    useState<NotificationState>('ALL');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const errorApi = useApi(errorApiRef);

  const handleChangePage = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  useEffect(() => {
    fetchNotifications({
      filter: notificationFilter,
      page,
      rowsPerPage,
      fetch,
    });
  }, [notificationFilter, page, rowsPerPage, fetchNotifications, fetch]);

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterChangeHandler = (filter: SelectedItems) => {
    setNotificationFilter(filter as NotificationState);
    setPage(0);
  };

  const deleteNotificationsHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      setAction('DELETE');
      setOpenDialog(true);
    },
    [],
  );

  const dialogYesHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (loading) {
        return;
      }

      try {
        for (const notification of selectedNotifications) {
          if (action === 'DELETE') {
            await deleteNotification({ fetch, id: notification.id });
          } else {
            await setNotificationState({
              fetch,
              id: notification.id,
              newState: 'ARCHIVE',
            });
          }

          setOpenDialog(false);
          setShowAlert(true);

          setSelectedNotifications([]);

          await fetchNotifications({
            fetch,
            filter: notificationFilter,
            page,
            rowsPerPage,
          });
        }
      } catch (err) {
        errorApi.post(new Error(`Action failed`));
      }
    },
    [
      action,
      deleteNotification,
      errorApi,
      fetch,
      fetchNotifications,
      loading,
      notificationFilter,
      page,
      rowsPerPage,
      selectedNotifications,
      setNotificationState,
    ],
  );

  const archiveNotificationsHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      setAction('ARCHIVE');
      setOpenDialog(true);
    },
    [],
  );

  const handleCheckBoxClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const { id, checked } = e.target as HTMLInputElement;

      const notification = notifications.find(n => n.id === id);

      assert(!!notification, `no notification found for ${id}`);

      if (checked) {
        setSelectedNotifications(previous => [...previous, notification]);
      } else {
        setSelectedNotifications(previous => previous.filter(c => c.id !== id));
      }
    },
    [notifications],
  );

  const isSelected = useCallback(
    (id: string) => selectedNotifications.map(n => n.id).includes(id),
    [selectedNotifications],
  );

  return (
    <>
      {loading && <Progress />}
      <NotificationListHeader
        filterChangeHandler={filterChangeHandler}
        filter={notificationFilter}
        selected={selectedNotifications.length}
        archiveHandler={archiveNotificationsHandler}
        deleteHandler={deleteNotificationsHandler}
      />
      <Confirm
        open={dialogOpen}
        content={`${action === 'ARCHIVE' ? 'archive' : 'delete'} ${
          selectedNotifications.length
        } notification(s)`}
        closeHandler={() => setOpenDialog(false)}
        noHandler={() => setOpenDialog(false)}
        yesHandler={dialogYesHandler}
      />
      {showAlert && (
        <Dialog
          open={showAlert}
          onClose={() => setShowAlert(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogContent>
            <Alert onClose={() => setShowAlert(false)}>{`successfully ${
              action === 'ARCHIVE' ? 'archived' : 'deleted'
            }`}</Alert>
          </DialogContent>
        </Dialog>
      )}
      <TableContainer
        component="div"
        classes={{
          root: styles.root,
        }}
      >
        <Table aria-label="notifications table">
          <TableBody className={styles.tbody}>
            {notifications.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={4}>
                  No notifications
                </TableCell>
              </TableRow>
            )}
            {notifications.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                checkboxClickHandler={handleCheckBoxClick}
                isSelected={isSelected}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container direction="row" justifyContent="center">
        <TablePagination
          component="div"
          count={notifications.length ?? 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Grid>
    </>
  );
}
