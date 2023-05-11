import React, {
  type MouseEvent,
  type ChangeEvent,
  useCallback,
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
import { useImmerReducer } from 'use-immer';
import { reducer, initialState } from './reducer';

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
  const deleteNotification = useStore(state => state.deleteNotifications);
  const setNotificationState = useStore(state => state.setNotificationState);
  const loading = useStore(state => state.notificationsLoading);
  const notificationsCount = useStore(state => state.notificationsCount);
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const { fetch } = useApi(fetchApiRef);

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    fetchNotifications({
      filter: state.notificationFilter,
      page: state.page,
      rowsPerPage: state.rowsPerPage,
      fetch,
    });
  }, [
    fetchNotifications,
    state.page,
    state.rowsPerPage,
    state.notificationFilter,
    fetch,
  ]);

  useEffect(() => {
    if(notifications.length > 0 || state.page === 0) {
      return;
    }

    dispatch({type: 'CHANGE_PAGE', payload: { page: state.page -1 }})
  }, [dispatch, notifications.length, state.page])

  const filterChangeHandler = (filter: SelectedItems) => {
    dispatch({
      type: 'CHANGE_FILTER',
      payload: { filter: filter as NotificationState },
    });
  };

  const handleChangePage = (
    _event: MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    dispatch({ type: 'CHANGE_PAGE', payload: { page: newPage } });
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    dispatch({
      type: 'CHANGE_ROWS_PER_PAGE',
      payload: { rows: Number(event.target.value) },
    });
  };

  const archiveNotificationsHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      dispatch({ type: 'ARCHIVE' });
    },
    [dispatch],
  );

  const deleteNotificationsHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      dispatch({ type: 'DELETE' });
    },
    [dispatch],
  );

  const dialogYesHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      if (loading) {
        return;
      }

      try {
        if (state.action === 'DELETE') {
          await deleteNotification({ fetch, ids: state.selectedNotifications });
        } else {
          for (const notificationId of state.selectedNotifications) {
            await setNotificationState({
              fetch,
              id: notificationId,
              newState: 'ARCHIVE',
            });
          }
        }

        dispatch({ type: 'RESET' });

        fetchNotifications({
          filter: state.notificationFilter,
          page: state.page,
          rowsPerPage: state.rowsPerPage,
          fetch,
        });
      } catch (err) {
        errorApi.post(new Error(`Action failed`));
      }
    },
    [
      deleteNotification,
      dispatch,
      errorApi,
      fetch,
      fetchNotifications,
      loading,
      setNotificationState,
      state.action,
      state.notificationFilter,
      state.page,
      state.rowsPerPage,
      state.selectedNotifications,
    ],
  );

  const checkBoxClickHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const { id, checked } = e.target as HTMLInputElement;

      const notification = notifications.find(n => n.id === id);

      assert(!!notification, `no notification found for ${id}`);

      dispatch({
        type: 'CHECK',
        payload: {
          notificationId: id,
          checked,
        },
      });
    },
    [dispatch, notifications],
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
                filter={state.notificationFilter}
                selected={state.selectedNotifications.length}
                archiveHandler={archiveNotificationsHandler}
                deleteHandler={deleteNotificationsHandler}
              />
              <Confirm
                open={state.dialogOpen}
                content={`${
                  state.action === 'ARCHIVE' ? 'archive' : 'delete'
                } ${state.selectedNotifications.length} notification(s)`}
                closeHandler={() => dispatch({ type: 'CLOSE_DIALOG' })}
                noHandler={() => dispatch({ type: 'CLOSE_DIALOG' })}
                yesHandler={dialogYesHandler}
              />
              {state.showAlert && (
                <Dialog
                  open={state.showAlert}
                  onClose={() => dispatch({ type: 'CLOSE_ALERT' })}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogContent>
                    <Alert
                      onClose={() => dispatch({ type: 'CLOSE_ALERT' })}
                    >{`successfully ${
                      state.action === 'ARCHIVE' ? 'archived' : 'deleted'
                    }`}</Alert>
                  </DialogContent>
                </Dialog>
              )}
              <NotificationList
                notifications={notifications}
                notificationsLoading={loading}
                checkBoxClickHandler={checkBoxClickHandler}
                selectedNotificationIds={state.selectedNotifications}
              />

              <Grid container direction="row" justifyContent="center">
                <TablePagination
                  component="div"
                  count={notificationsCount}
                  page={state.page}
                  onPageChange={handleChangePage}
                  rowsPerPage={state.rowsPerPage}
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
