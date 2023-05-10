import React from 'react';
import { ContentHeader, SupportButton } from '@backstage/core-components';
import { Card, CardContent, Grid, makeStyles } from '@material-ui/core';
import { NotificationList } from './NotificationList';
import { ParodosPage } from '../ParodosPage';

export const useStyles = makeStyles(_theme => ({
  fullHeight: {
    display: 'flex',
    minHeight: 0,
    height: '100%',
  },
}));

export const Notification = () => {
  const styles = useStyles();

  return (
    <ParodosPage stretch>
      <ContentHeader title="Notifications">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Card className={styles.fullHeight}>
        <CardContent>
          <Grid container direction="row">
            <Grid item xs={12} xl={9} lg={11}>
              <NotificationList />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </ParodosPage>
  );
};
