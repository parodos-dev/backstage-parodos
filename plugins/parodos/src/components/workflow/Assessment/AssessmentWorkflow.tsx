/* eslint-disable no-console */
import React, { useEffect } from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useParams } from 'react-router-dom';
import { ParodosPage } from '../../ParodosPage';
import { Grid, makeStyles } from '@material-ui/core';
import { assert } from 'assert-ts';
import { WorkflowOptionsList } from '../WorkflowOptionsList';
import useAsync from 'react-use/lib/useAsync';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { getWorkflowOptions } from '../hooks/getWorkflowOptions';
import * as urls from '../../../urls';

const useStyles = makeStyles(_theme => ({
  fullHeight: {
    height: '100%',
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
    const options = await getWorkflowOptions(fetch, {
      workflowsUrl,
      executionId: assessmentWorkflowExecutionId,
    });

    // TODO: Are we only interested in newOptions?
    return (options.newOptions ?? []).map(option => ({
      ...option,
      type: 'New Option',
    }));
  }, [assessmentWorkflowExecutionId, fetch, workflowsUrl]);

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Failure retrieving workflow options`));
    }
  }, [error, errorApi]);

  return (
    <ParodosPage stretch>
      <ContentHeader title="Assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <InfoCard className={styles.fullHeight}>
        <Grid container direction="row">
          <Grid item xs={12}>
            {loading && <Progress />}
            {workflowOptions && (
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