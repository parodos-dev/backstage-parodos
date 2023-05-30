import React, { useEffect, useState } from 'react';
import {
  ContentHeader,
  EmptyState,
  LinkButton,
  Progress,
  Select,
  SupportButton,
} from '@backstage/core-components';
import * as urls from '../../urls';
import { ParodosPage } from '../ParodosPage';
import Star from '@material-ui/icons/StarOutline';
import { Button, Grid, makeStyles } from '@material-ui/core';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { pluginRoutePrefix } from '../ParodosPage/navigationMap';
import { WorkflowsTable } from './WorkflowsTable';
import { useWorkflows } from './hooks/useWorkflows';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';

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
    marginLeft: 'auto',
    alignSelf: 'flex-end',
  },
  tableContainer: {
    marginTop: '2em',
  },
}));

export function WorkflowsOverview(): JSX.Element {
  const classes = useStyles();
  const projects = useStore(state => state.projects);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const errorApi = useApi(errorApiRef);

  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >(projects[0]?.id);

  const items = projects.map(project => ({
    label: project.name,
    value: project.id,
  }));

  const [{ loading, error, value: workflows }, getWorkflows] =
    useWorkflows(workflowsUrl);

  useEffect(() => {
    if (selectedProjectId) {
      getWorkflows(selectedProjectId);
    }
  }, [selectedProjectId, getWorkflows]);

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);

      errorApi.post(new Error('Start workflow failed'));
    }
  }, [errorApi, error]);

  return (
    <ParodosPage>
      <Grid container spacing={2} direction="row">
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
            label={'Select a project'.toUpperCase()}
            placeholder={selectedProjectId ? undefined : 'Project name'}
            items={items}
            selected={selectedProjectId}
            onChange={item =>
              typeof item === 'string' && setSelectedProjectId(item)
            }
          />
        </Grid>
        <Grid item className={classes.newProjectButton}>
          <LinkButton
            variant="contained"
            type="button"
            color="primary"
            data-testid="button-add-new-project"
            to={`${pluginRoutePrefix}/onboarding`}
          >
            Add new workflow
          </LinkButton>
        </Grid>
      </Grid>
      {!loading && (!workflows || workflows.length === 0) && (
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
      {(workflows || loading) && (
        <Grid
          container
          spacing={3}
          direction="row"
          className={classes.tableContainer}
        >
          <Grid item xs={12}>
            {loading && <Progress />}
            {workflows && workflows.length > 0 && selectedProjectId && (
              <WorkflowsTable
                projectId={selectedProjectId}
                workflows={workflows}
              />
            )}
          </Grid>
        </Grid>
      )}
    </ParodosPage>
  );
}
