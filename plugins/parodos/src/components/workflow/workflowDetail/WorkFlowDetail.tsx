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
import {
  Status,
  workflowStatusSchema,
  WorkflowTask,
  WorkStatus,
} from '../../../models/workflowTaskSchema';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { fetchApiRef, useApi } from '@backstage/core-plugin-api';
import {
  FirstTaskId,
  getWorkflowTasksForTopology,
} from '../../../hooks/getWorkflowDefinitions';
import { assert } from 'assert-ts';
import { M2k } from '../../../mocks/mock_mk2_status';

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
  const project = useStore(state => state.getProjectById(projectId));
  const { isNew = false } = useLocation().state ?? {};
  const getWorkDefinitionBy = useStore(state => state.getWorkDefinitionBy);
  const [selectedTask, setSelectedTask] = useState<string | null>('');
  const [workflowName, setWorkflowName] = useState<string>('');
  const [allTasks, setAllTasks] = useState<WorkflowTask[]>([]);
  const [log, setLog] = useState<string>(``);
  const workflowsUrl = useStore(store => store.getApiUrl(urls.Workflows));
  const styles = useStyles();
  const { fetch } = useApi(fetchApiRef);
  const [status, setStatus] = useState<Status>('IN_PROGRESS');

  useEffect(() => {
    const updateWorks = (works: WorkStatus[]) => {
      let needUpdate = false;
      const tasks = [...allTasks];
      for (const work of works) {
        if (work.type === 'TASK') {
          const foundTask = tasks.find(task => task.id === work.name);

          if (foundTask && foundTask.status !== work.status) {
            foundTask.status = work.status;
            needUpdate = true;
          }
          if (foundTask && work.alertMessage !== foundTask?.alertMessage) {
            foundTask.alertMessage = work.alertMessage;
            needUpdate = true;
          }
        } else if (work.works) {
          updateWorks(work.works);
        }
      }
      if (needUpdate) {
        setAllTasks(tasks);
      }
    };

    const updateWorksFromApi = async () => {
      // const data = await fetch(`${workflowsUrl}/${executionId}/status`);
      const response = workflowStatusSchema.parse(
        M2k, // (await data.json()) as WorkflowStatus,
      );

      if (response.status === 'FAILED') {
        setStatus(response.status);
      }

      const workflow = getWorkDefinitionBy('byName', response.workFlowName);
      if (workflow && allTasks.length === 0) {
        setAllTasks(getWorkflowTasksForTopology(workflow));
      }
      setWorkflowName(response.workFlowName);
      updateWorks(response.works);

      return response.works;
    };

    const taskInterval = setInterval(() => {
      updateWorksFromApi();
    }, 5000);

    updateWorksFromApi();

    if (status === 'FAILED') {
      clearInterval(taskInterval);
    }

    return () => clearInterval(taskInterval);
  }, [
    allTasks,
    executionId,
    fetch,
    workflowsUrl,
    getWorkDefinitionBy,
    selectedTask,
    status,
  ]);

  useEffect(() => {
    const updateWorkFlowLogs = async () => {
      const selected = allTasks.find(task => task.id === selectedTask);
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
  }, [executionId, selectedTask, fetch, workflowsUrl, allTasks]);

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
      <InfoCard className={styles.card}>
        <Typography paragraph>
          Please provide additional information related to your project.
        </Typography>
        <Typography paragraph>
          You are onboarding <strong>{project?.name || '...'}</strong> project,
          running workflow "{workflowName}" (execution ID: {executionId})
        </Typography>

        <Box className={styles.detailContainer}>
          {allTasks.length > 0 ? (
            <WorkFlowStepper
              tasks={allTasks}
              setSelectedTask={setSelectedTask}
            />
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
