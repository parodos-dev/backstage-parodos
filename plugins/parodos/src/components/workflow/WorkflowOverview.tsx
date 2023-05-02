import React, { useCallback, useEffect, useState } from 'react';
import {
  ContentHeader,
  EmptyState,
  Header,
  Select,
  SupportButton,
} from '@backstage/core-components';
import { ParodosPage } from '../ParodosPage';
import Star from '@material-ui/icons/StarOutline';
import { Button, Grid, makeStyles } from '@material-ui/core';
import { useStore } from '../../stores/workflowStore/workflowStore';

const useStyles = makeStyles(_theme => ({
  titleIcon: {
    alignSelf: 'center',
    height: '4em',
  },
  supportButton: {
    marginLeft: 'auto',
  },
  newProjectButton: {
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
}));

export function WorkflowOverview(): JSX.Element {
  const projects = useStore(state => state.projects);
  const classes = useStyles();

  const items = projects.map(project => ({
    label: project.name,
    value: project.id,
  }));

  return (
    <ParodosPage>
      <Grid container spacing={3} direction="row">
        <Grid item>
          <ContentHeader title="Workflows overview" />
        </Grid>
        <Grid item className={classes.titleIcon}>
          <Star />
        </Grid>
        <Grid item className={classes.supportButton}>
          <SupportButton title="Support">Lorem Ipsum</SupportButton>
        </Grid>
      </Grid>
      <Grid container spacing={3} direction="row">
        <Grid item xs={4}>
          <Select
            label="Select a project"
            placeholder="Project name"
            items={items}
            selected={items[0].value}
            onChange={() => {}}
          />
        </Grid>
        <Grid item className={classes.newProjectButton}>
          <Button variant="contained" type="button" color="primary">
            Add new project
          </Button>
        </Grid>
      </Grid>
      {projects.length === 0 && (
        <EmptyState
          missing="data"
          title="There are no project workflows to display."
          description="Want to learn more about Parodos? Check out our documentation."
          action={
            <Button variant="contained" type="button" color="primary">
              Docs
            </Button>
          }
        />
      )}
    </ParodosPage>
  );
}
