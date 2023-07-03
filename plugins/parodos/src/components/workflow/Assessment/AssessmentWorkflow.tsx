/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  Breadcrumbs,
  ContentHeader,
  EmptyState,
  InfoCard,
  Link,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { ParodosPage } from '../../ParodosPage';
import { Box, Grid, makeStyles, Typography } from '@material-ui/core';
import { assert } from 'assert-ts';
import { WorkflowOptionsList } from '../WorkflowOptionsList';
import useAsync from 'react-use/lib/useAsync';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { getWorkflowOptions } from '../hooks/getWorkflowOptions';
import * as urls from '../../../urls';

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100%',
  },
  link: {
    color: theme.palette.primary.main,
  },
}));

export function AssessmentWorkflow(): JSX.Element {
  const styles = useStyles();
  const { projectId, assessmentWorkflowExecutionId } = useParams();
  const errorApi = useApi(errorApiRef);
  const { fetch } = useApi(fetchApiRef);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));

  assert(!!projectId, `no projectId for assessment workflow`);
  assert(
    !!assessmentWorkflowExecutionId,
    `no assessmentWorkflowExecutionId for assessment workflow`,
  );

  const selectedProject = useStore(state => state.getProjectById(projectId));

  const {
    loading,
    error,
    value: workflowOptions,
  } = useAsync(async () => {
    return await getWorkflowOptions(fetch, {
      workflowsUrl,
      executionId: assessmentWorkflowExecutionId,
    });
  }, [assessmentWorkflowExecutionId, fetch, workflowsUrl]);

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Failure retrieving workflow options`));
    }
  }, [error, errorApi]);

  const noOptions =
    loading === false && workflowOptions && workflowOptions.length === 0;
  const hasOptions = workflowOptions && workflowOptions.length > 0;

  return (
    <ParodosPage stretch>
      <ContentHeader title="Assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link className={styles.link} to="/parodos/workflows">
            Workflows
          </Link>
          <Typography>Assessment results</Typography>
        </Breadcrumbs>
      </Box>
      <InfoCard className={styles.fullHeight}>
        <Grid container direction="row">
          <Grid item xs={12}>
            {loading && <Progress />}
            {noOptions && (
              <EmptyState
                missing="data"
                title="There are no further workflow options to complete for this assessment."
              />
            )}
            {hasOptions && (
              <WorkflowOptionsList
                isNew={false}
                project={selectedProject}
                workflowOptions={workflowOptions}
                assessmentWorkflowExecutionId={assessmentWorkflowExecutionId}
              />
            )}
          </Grid>
        </Grid>
      </InfoCard>
    </ParodosPage>
  );
}
