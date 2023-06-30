import { ParodosPage } from '../../ParodosPage';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { Box, Chip, makeStyles, Typography } from '@material-ui/core';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import React, { useEffect, useState } from 'react';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { useLocation, useParams } from 'react-router-dom';
import * as urls from '../../../urls';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import { FirstTaskId } from '../../../hooks/getWorkflowDefinitions';
import { assert } from 'assert-ts';
import { AssessmentBreadCrumb } from '../../AssessmentBreadCrumb/AssessmentBreadCrumb';
import { useSearchParams } from 'react-router-dom';
import { useUpdateWorks } from '../hooks/useUpdateWorks';

const useStyles = makeStyles(_theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  detailContainer: {
    flex: 1,
    display: 'grid',
    gridTemplateRows: '1fr 1fr',
    minHeight: 0,
  },
  viewerContainer: {
    display: 'grid',
    minHeight: 0,
  },
  card: {
    height: '100%',
  },
}));

export function WorkFlowDetail(): JSX.Element {
  const { projectId, executionId } = useParams();
  assert(!!projectId, 'no projectId param');
  assert(!!executionId, 'no executionId param');
  const project = useStore(state => state.getProjectById(projectId));
  const { isNew = false } = useLocation().state ?? {};
  const [selectedTask, setSelectedTask] = useState<string | null>('');
  const [log, setLog] = useState<string>(``);
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));
  const styles = useStyles();
  const { fetch } = useApi(fetchApiRef);
  const [searchParams] = useSearchParams();

  const assessmentWorkflowExecutionId = searchParams.get(
    'assessmentexecutionid',
  );

  const { tasks, workflowName } = useUpdateWorks({ executionId });

  useEffect(() => {
    const updateWorkFlowLogs = async () => {
      const selected = tasks.find(task => task.id === selectedTask);
      if (selectedTask === FirstTaskId) {
        setLog('Start workflow');
        return;
      }

      if (selected && selected?.status === 'PENDING') {
        setLog('Pending....');
        return;
      }

      if (selectedTask === '') {
        setLog('');
        return;
      }

      const data = await fetch(
        `${workflowsUrl}/${executionId}/log?taskName=${selectedTask}`,
      );
      const response = await data.text();
      setLog(
        `checking logs for ${selectedTask?.toUpperCase()} in execution: ${executionId}\n${response}`,
      );
    };
    const logInterval = setInterval(() => {
      updateWorkFlowLogs();
    }, 3000);
    updateWorkFlowLogs();

    return () => clearInterval(logInterval);
  }, [executionId, selectedTask, fetch, workflowsUrl, tasks]);

  return (
    <ParodosPage className={styles.container}>
      {isNew && (
        <Chip
          className={styles.badge}
          label="New application"
          color="secondary"
        />
      )}
      <ContentHeader title="Onboarding">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      {assessmentWorkflowExecutionId && (
        <Box mb={3}>
          <AssessmentBreadCrumb
            projectId={projectId}
            executionId={assessmentWorkflowExecutionId}
            current="Workflow Detail"
          />
        </Box>
      )}
      <InfoCard className={styles.card}>
        <Typography paragraph>
          Please provide additional information related to your project.
        </Typography>
        <Typography paragraph>
          You are onboarding <strong>{project?.name || '...'}</strong> project,
          running workflow "{workflowName}" (execution ID: {executionId})
        </Typography>
        <Box className={styles.detailContainer}>
          {tasks.length > 0 ? (
            <WorkFlowStepper tasks={tasks} setSelectedTask={setSelectedTask} />
          ) : (
            <Progress />
          )}
          <div className={styles.viewerContainer}>
            {log !== '' && <WorkFlowLogViewer log={log} />}
          </div>
        </Box>
      </InfoCard>
    </ParodosPage>
  );
}
