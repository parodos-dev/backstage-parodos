import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Card, CardContent, Grid, makeStyles } from '@material-ui/core';
import { NotificationList } from './NotificationsList';
import { ParodosPage } from '../ParodosPage';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';

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
  const notificationsLoading = useStore(state => state.notificationsLoading);
  const { fetch } = useApi(fetchApiRef);

  return (
    <ParodosPage stretch>
      <ContentHeader title="Notifications">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Card className={styles.fullHeight}>
        <CardContent>
          <Grid container direction="row">
            <Grid item xs={12} xl={9} lg={11}>
              <NotificationList
                notifications={notifications}
                fetchNotifications={fetchNotifications}
                deleteNotification={deleteNotification}
                setNotificationState={setNotificationState}
                notificationsLoading={notificationsLoading}
                fetch={fetch}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </ParodosPage>
  );
};
