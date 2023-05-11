import React, {
  type MouseEvent,
  type ChangeEvent,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  ContentHeader,
  Progress,
  SelectedItems,
  SupportButton,
} from '@backstage/core-components';
import {
  Card,
  CardContent,
  Grid,
  makeStyles,
  TablePagination,
  Dialog,
} from '@material-ui/core';
import { NotificationList } from './NotificationsList';
import { ParodosPage } from '../ParodosPage';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { NotificationState } from '../../stores/types';
import { NotificationListHeader } from './NotificationsListHeader';
import { Confirm } from './Confirm';
import { Alert } from '@material-ui/lab';
import DialogContent from '@material-ui/core/DialogContent';
import { assert } from 'assert-ts';

type Action = 'DELETE' | 'ARCHIVE';

export const useStyles = makeStyles(_theme => ({
  fullHeight: {
    display: 'flex',
    minHeight: 0,
    height: '100%',
  },
}));

export const Notification = () => {
  const styles = useStyles();
  const notifications = useStore(state => state.notifications);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const deleteNotification = useStore(state => state.deleteNotification);
  const setNotificationState = useStore(state => state.setNotificationState);
  const loading = useStore(state => state.notificationsLoading);
  const notificationsCount = useStore(state => state.notificationsCount);
  const { fetch } = useApi(fetchApiRef);
  const [notificationFilter, setNotificationFilter] =
    useState<NotificationState>('ALL');
  const [dialogOpen, setOpenDialog] = useState(false);
  const [action, setAction] = useState<Action>('ARCHIVE');
  const [showAlert, setShowAlert] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedNotificationIds, setSelectedNotificationIds] = useState<
    string[]
  >([]);
  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    fetchNotifications({
      filter: notificationFilter,
      page,
      rowsPerPage,
      fetch,
    });
  }, [notificationFilter, page, rowsPerPage, fetchNotifications, fetch]);

  const filterChangeHandler = (filter: SelectedItems) => {
    setNotificationFilter(filter as NotificationState);
    setPage(0);
  };

  const handleChangePage = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const archiveNotificationsHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      setAction('ARCHIVE');
      setOpenDialog(true);
    },
    [],
  );

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
        for (const notificationId of selectedNotificationIds) {
          if (action === 'DELETE') {
            await deleteNotification({ fetch, id: notificationId });
          } else {
            await setNotificationState({
              fetch,
              id: notificationId,
              newState: 'ARCHIVE',
            });
          }

          setOpenDialog(false);
          setShowAlert(true);

          setSelectedNotificationIds([]);

          // await fetchNotifications({
          //   fetch,
          //   filter: notificationFilter,
          //   page,
          //   rowsPerPage,
          // });
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
      loading,
      selectedNotificationIds,
      setNotificationState,
    ],
  );

  const checkBoxClickHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const { id, checked } = e.target as HTMLInputElement;

      const notification = notifications.find(n => n.id === id);

      assert(!!notification, `no notification found for ${id}`);

      if (checked) {
        setSelectedNotificationIds(previous => [...previous, notification.id]);
      } else {
        setSelectedNotificationIds(previous => previous.filter(n => n !== id));
      }
    },
    [notifications],
  );

  return (
    <ParodosPage stretch>
      <ContentHeader title="Notifications">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Card className={styles.fullHeight}>
        <CardContent>
          <Grid container direction="row">
            <Grid item xs={12} xl={9} lg={11}>
              {loading && <Progress />}
              <NotificationListHeader
                filterChangeHandler={filterChangeHandler}
                filter={notificationFilter}
                selected={selectedNotificationIds.length}
                archiveHandler={archiveNotificationsHandler}
                deleteHandler={deleteNotificationsHandler}
              />
              <Confirm
                open={dialogOpen}
                content={`${action === 'ARCHIVE' ? 'archive' : 'delete'} ${
                  selectedNotificationIds.length
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
              <NotificationList
                notifications={notifications}
                notificationsLoading={loading}
                fetch={fetch}
                checkBoxClickHandler={checkBoxClickHandler}
                selectedNotificationIds={selectedNotificationIds}
              />

              <Grid container direction="row" justifyContent="center">
                <TablePagination
                  component="div"
                  count={notificationsCount}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[5, 10, 20]}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </ParodosPage>
  );
};
