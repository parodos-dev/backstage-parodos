import {
  ContentHeader,
  EmptyState,
  LinkButton,
  SupportButton,
} from '@backstage/core-components';
import { Button, Grid, makeStyles } from '@material-ui/core';
import React from 'react';
import { ParodosPage } from '../ParodosPage';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import Star from '@material-ui/icons/StarOutline';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ProjectsTable } from './ProjectsTable';

const useStyles = makeStyles(_theme => ({
  titleIcon: {
    alignSelf: 'center',
    height: '3.5em',
    color: '#616161',
  },
  supportButton: {
    marginLeft: 'auto',
  },
  newProjectButton: {
    alignSelf: 'flex-start',
  },
  tableContainer: {
    marginTop: '2em',
  },
}));

export function ProjectsOverview(): JSX.Element {
  const classes = useStyles();
  const projects = useStore(state => state.projects);

  return (
    <ParodosPage>
      <Grid container spacing={2} direction="row">
        <Grid item>
          <ContentHeader title="Projects overview" />
        </Grid>
        <Grid item className={classes.titleIcon}>
          <Star />
        </Grid>
        <Grid item className={classes.supportButton}>
          <SupportButton title="Support">Lorem Ipsum</SupportButton>
        </Grid>
      </Grid>
      <Grid container spacing={3} direction="row">
        <Grid item className={classes.newProjectButton}>
          <LinkButton
            variant="contained"
            type="button"
            color="primary"
            data-testid="button-add-new-project"
            to={`${pluginRoutePrefix}/projects/new`}
          >
            Add new project
          </LinkButton>
        </Grid>
      </Grid>
      {projects.length === 0 && (
        <EmptyState
          missing="data"
          title="There are no projects to display."
          description="Want to learn more about Parodos? Check out our documentation."
          action={
            <Button variant="contained" type="button" color="primary">
              Docs
            </Button>
          }
        />
      )}
      {projects.length > 0 && (
        <Grid
          container
          spacing={3}
          direction="row"
          className={classes.tableContainer}
        >
          <Grid item xs={12}>
            <ProjectsTable projects={projects} />
          </Grid>
        </Grid>
      )}
    </ParodosPage>
  );
}
