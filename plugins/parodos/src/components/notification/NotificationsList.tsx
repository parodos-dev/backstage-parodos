import React, { useCallback, MouseEventHandler } from 'react';
import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from '@material-ui/core';
import type { NotificationsSlice } from '../../stores/types';
import { type FetchApi } from '@backstage/core-plugin-api';
import { NotificationListItem } from './NotificationsListItem';

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

type NotificationListProps = Pick<
  NotificationsSlice,
  'notifications' | 'notificationsLoading'
> & {
  fetch: FetchApi['fetch'];
  selectedNotificationIds: string[];
  checkBoxClickHandler: MouseEventHandler<HTMLButtonElement>;
};

export function NotificationList({
  notifications,
  checkBoxClickHandler,
  selectedNotificationIds,
}: // fetchNotifications,
NotificationListProps): JSX.Element {
  const styles = useStyles();

  const isSelected = useCallback(
    (id: string) => selectedNotificationIds.includes(id),
    [selectedNotificationIds],
  );

  return (
    <>
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
                checkboxClickHandler={checkBoxClickHandler}
                isSelected={isSelected}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
