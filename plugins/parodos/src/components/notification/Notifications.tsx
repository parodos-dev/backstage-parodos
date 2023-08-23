import React, {
  type MouseEvent,
  type ChangeEvent,
  useCallback,
  useEffect,
} from 'react';
import {
  ContentHeader,
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

// NOTE: The name of the archive folder https://github.com/parodos-dev/parodos/blob/b2961b136f4fe754b990a957ecaf2fd519cd7a98/notification-service/src/main/java/com/redhat/parodos/notification/service/impl/NotificationRecordServiceImpl.java#L54
const ARCHIVE_FOLDER = 'archive';

export const useStyles = makeStyles(_theme => ({
  fullHeight: {
    display: 'flex',
    minHeight: 0,
    height: '100%',
  },
}));

const actionLabelMap = {
  ARCHIVE: 'archive',
  UNARCHIVE: 'unarchive',
  DELETE: 'delete',
};

export const Notification = () => {
  const styles = useStyles();
  const notifications = useStore(state => state.notifications);
  const fetchNotifications = useStore(state => state.fetchNotifications);
  const unreadNotificationsCount = useStore(
    state => state.unreadNotificationsCount,
  );
  const deleteNotification = useStore(state => state.deleteNotifications);
  const setNotificationState = useStore(state => state.setNotificationState);
  const notificationsCount = useStore(state => state.notificationsCount);
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const { fetch } = useApi(fetchApiRef);

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    fetchNotifications({
      filter: state.notificationFilter,
      search: state.notificationSearch,
      page: state.page,
      rowsPerPage: state.rowsPerPage,
      fetch,
    });
  }, [
    fetchNotifications,
    unreadNotificationsCount,
    state.page,
    state.rowsPerPage,
    state.notificationFilter,
    state.notificationSearch,
    fetch,
  ]);

  useEffect(() => {
    if (notifications.size > 0 || state.page === 0) {
      return;
    }

    dispatch({ type: 'CHANGE_PAGE', payload: { page: state.page - 1 } });
  }, [dispatch, notifications.size, state.page]);

  const filterChangeHandler = (filter: SelectedItems) => {
    dispatch({
      type: 'CHANGE_FILTER',
      payload: { filter: filter as NotificationState },
    });
  };

  const searchChangeHandler = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      dispatch({
        type: 'CHANGE_SEARCH',
        payload: { search: e.target.value },
      });
    },
    [dispatch],
  );

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
  const unarchiveNotificationsHandler = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      dispatch({ type: 'UNARCHIVE' });
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

      try {
        if (state.action === 'DELETE') {
          await deleteNotification({ fetch, ids: state.selectedNotifications });
        } else {
          const ids = state.selectedNotifications.filter(id => {
            const notification = notifications.get(id);
            if (!notification) return false;
            if (state.action === 'ARCHIVE')
              return notification.folder !== ARCHIVE_FOLDER;
            else if (state.action === 'UNARCHIVE')
              return notification.folder === ARCHIVE_FOLDER;
            return false;
          });
          if (ids.length > 0) {
            for (const notificationId of ids) {
              await setNotificationState({
                fetch,
                id: notificationId,
                newState: state.action,
              });
            }
          }
        }

        dispatch({ type: 'FINISH_ACTION' });

        fetchNotifications({
          filter: state.notificationFilter,
          search: state.notificationSearch,
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
      setNotificationState,
      notifications,
      state.action,
      state.notificationFilter,
      state.notificationSearch,
      state.page,
      state.rowsPerPage,
      state.selectedNotifications,
    ],
  );

  const checkBoxClickHandler = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();

      const { id, checked } = e.target as HTMLInputElement;

      const notification = notifications.get(id);

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
              <NotificationListHeader
                filterChangeHandler={filterChangeHandler}
                filter={state.notificationFilter}
                searchChangeHandler={searchChangeHandler}
                search={state.notificationSearch}
                selected={state.selectedNotifications.length}
                archiveHandler={archiveNotificationsHandler}
                unarchiveHandler={unarchiveNotificationsHandler}
                deleteHandler={deleteNotificationsHandler}
              />
              <Confirm
                open={state.dialogOpen}
                content={`${actionLabelMap[state.action]} ${
                  state.selectedNotifications.length
                } notification(s)`}
                closeHandler={() => dispatch({ type: 'CLOSE_DIALOG' })}
                noHandler={() => dispatch({ type: 'CLOSE_DIALOG' })}
                yesHandler={dialogYesHandler}
              />
              <Dialog
                open={state.showAlert}
                onClose={() => dispatch({ type: 'CLOSE_ALERT' })}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogContent>
                  <Alert
                    onClose={() => dispatch({ type: 'CLOSE_ALERT' })}
                  >{`successfully ${actionLabelMap[state.action]}d`}</Alert>
                </DialogContent>
              </Dialog>
              <NotificationList
                notifications={notifications}
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
