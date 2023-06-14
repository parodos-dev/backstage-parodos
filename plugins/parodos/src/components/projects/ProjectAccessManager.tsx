import {
  ContentHeader,
  ErrorPage,
  SupportButton,
} from '@backstage/core-components';
import { Grid, Link, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { ParodosPage } from '../ParodosPage';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { NavLink, useParams } from 'react-router-dom';
import { ProjectAccessTable } from './ProjectAccessTable';

const useStyles = makeStyles(_theme => ({
  supportButton: {
    marginLeft: 'auto',
  },
  tableContainer: {
    marginTop: '2em',
  },
}));

export function ProjectAccessManager(): JSX.Element {
  const { projectId } = useParams();
  const classes = useStyles();
  const project = useStore(state =>
    state.projects?.find(({ id }) => id === projectId),
  );

  if (!project) {
    return (
      <ParodosPage>
        <ErrorPage status="404" statusMessage="Project not found" />
      </ParodosPage>
    );
  }

  return (
    <ParodosPage>
      <Grid container spacing={2} direction="row">
        <Grid item>
          <Link
            component={NavLink}
            underline="always"
            to={`${pluginRoutePrefix}/projects`}
          >
            Back to projects
          </Link>
          <ContentHeader title={`Manage access to ${project.name}`} />
          <Typography variant="body1">
            Manage project contributors and permissions.
          </Typography>
        </Grid>
        <Grid item className={classes.supportButton}>
          <SupportButton title="Support">Lorem Ipsum</SupportButton>
        </Grid>
      </Grid>
      <Grid
        container
        spacing={3}
        direction="row"
        className={classes.tableContainer}
      >
        <Grid item xs={12}>
          <ProjectAccessTable project={project} />
        </Grid>
      </Grid>
    </ParodosPage>
  );
}
