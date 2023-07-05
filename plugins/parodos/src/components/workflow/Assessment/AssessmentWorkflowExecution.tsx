import {
  Box,
  Breadcrumbs,
  Button,
  Collapse,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { WorkflowOptionsList } from '../WorkflowOptionsList';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ChevronDown from '@material-ui/icons/KeyboardArrowDown';
import { WorkflowExplorer } from '../workflowDetail/WorkflowExplorer';
import cs from 'classnames';
import { assert } from 'assert-ts';
import { getWorkflowOptions } from '../hooks/getWorkflowOptions';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import * as urls from '../../../urls';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { WorkflowOptionsListItem } from '../hooks/useCreateWorkflow';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { ParodosPage } from '../../ParodosPage';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useCommonStyles } from '../../../styles';

const useStyles = makeStyles(theme => ({
  viewMoreButton: {
    textDecoration: 'underline',
  },
  showMore: {
    marginTop: theme.spacing(2),
  },
  running: {
    color: theme.palette.primary.main,
  },
  options: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(3),
  },
}));

export function AssessmentWorkflowExecution(): JSX.Element {
  const styles = useStyles();
  const { projectId, assessmentWorkflowExecutionId } = useParams();
  const [, setWorkflowName] = useState('');
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const [workflowOptions, setWorklowOptions] =
    useState<WorkflowOptionsListItem[]>();
  const [showMoreWorkflows, setShowMoreWorkflows] = useState<boolean>(true);
  const errorApi = useApi(errorApiRef);
  const { fetch } = useApi(fetchApiRef);
  const commonStyles = useCommonStyles();
  const assessmentStatus = useStore(state => state.workflowStatus);
  const workflowError = useStore(state => state.workflowError);

  const showMoreWorkflowsToggle = useCallback(
    () => setShowMoreWorkflows(!showMoreWorkflows),
    [showMoreWorkflows],
  );

  assert(!!projectId, `no projectId for assessment workflow`);
  assert(
    !!assessmentWorkflowExecutionId,
    `no assessmentWorkflowExecutionId for assessment workflow`,
  );

  const selectedProject = useStore(state => state.getProjectById(projectId));

  const [{ error: getWorkflowOptionsError }, getOptions] =
    useAsyncFn(async () => {
      return await getWorkflowOptions(fetch, {
        workflowsUrl,
        executionId: assessmentWorkflowExecutionId,
      });
    }, [assessmentWorkflowExecutionId, fetch, workflowsUrl]);

  useEffect(() => {
    const error = workflowError || getWorkflowOptionsError;

    if (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      errorApi.post(new Error(`Workflow execution failed.`));
    }
  }, [errorApi, getWorkflowOptionsError, workflowError]);

  useEffect(() => {
    async function options() {
      setWorklowOptions(await getOptions());
    }

    if (assessmentStatus === 'COMPLETED') {
      options();
    }
  }, [getOptions, assessmentStatus]);

  return (
    <ParodosPage stretch>
      <ContentHeader title="Assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      <Box mb={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link className={commonStyles.link} to="/parodos/workflows">
            Workflows
          </Link>
          <Typography>Assessment results</Typography>
        </Breadcrumbs>
      </Box>
      <InfoCard className={commonStyles.fullHeight}>
        <WorkflowExplorer
          setWorkflowName={setWorkflowName}
          executionId={assessmentWorkflowExecutionId}
        >
          <Grid xs={12} item className={styles.options}>
            {assessmentStatus === 'IN_PROGRESS' && <Progress />}
            <Button
              disabled={!assessmentWorkflowExecutionId}
              onClick={showMoreWorkflowsToggle}
              className={cs(styles.viewMoreButton, {
                [styles.running]: assessmentStatus === 'COMPLETED',
              })}
            >
              {showMoreWorkflows ? <ChevronDown /> : <ChevronRight />}
              View More Workflows
            </Button>
            <Collapse in={showMoreWorkflows} timeout="auto" unmountOnExit>
              {workflowOptions?.length && (
                <WorkflowOptionsList
                  isNew
                  project={selectedProject}
                  workflowOptions={workflowOptions}
                  assessmentWorkflowExecutionId={assessmentWorkflowExecutionId}
                />
              )}
            </Collapse>
          </Grid>
        </WorkflowExplorer>
      </InfoCard>
    </ParodosPage>
  );
}
