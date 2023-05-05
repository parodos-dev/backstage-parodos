import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  ButtonGroup,
  Chip,
  Grid,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TablePagination,
  Typography,
  withStyles,
} from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import { Progress, Select, SelectedItems } from '@backstage/core-components';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NotificationOperation, NotificationState } from '../../stores/types';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { getHumanReadableDate } from '../converters';
import { NotificationContent } from '../../models/notification';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { NotificationListItem } from './NotificationListItem';

const ParodosAccordion = withStyles({
  root: {
    border: '1px solid',
    borderLeftWidth: '0',
    borderRightWidth: '0',
    borderColor: grey.A100,
    background: 'transparent',
    boxShadow: 'none',
    '&:not(:last-child)': {
      borderBottom: 1,
    },
    '&:before': {
      display: 'none',
    },
    '&$expanded': {
      margin: 'auto',
    },
  },
  expanded: {},
})(Accordion);

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

  const onFilterNotifications = (arg: SelectedItems) => {
    setNotificationFilter(arg as NotificationState);
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

  return (
    <>
      <Grid container direction="column" spacing={2}>
        <Grid item xs={3}>
          <Select
            onChange={onFilterNotifications}
            selected={notificationFilter}
            label="Filter by"
            items={[
              { label: 'All', value: 'ALL' },
              { label: 'Unread', value: 'UNREAD' },
              { label: 'Archived', value: 'ARCHIVED' },
            ]}
          />
        </Grid>
      </Grid>
      <TableContainer component="div" className={styles.root}>
        <Table aria-label="notifications table">
          <TableBody className={styles.tbody}>
            {notifications.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
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
