import { Progress } from '@backstage/core-components';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  makeStyles,
  SnackbarContent,
} from '@material-ui/core';
import React, {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import * as urls from '../../../urls';
import { useUpdateLogs } from '../hooks/useUpdateLogs';
import { useUpdateWorks } from '../hooks/useUpdateWorks';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import { BackstageTheme } from '@backstage/theme';
import { useCommonStyles } from '../../../styles';
import { errorApiRef, fetchApiRef, useApi } from '@backstage/core-plugin-api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { workflowExecute } from '../../../models/workflow';
import { useNavigate } from 'react-router-dom';

interface WorkflowExplorerProps {
  projectId: string;
  executionId: string;
  setWorkflowName: Dispatch<SetStateAction<string>>;
  children?: ReactNode;
}

const useStyles = makeStyles<BackstageTheme>(theme => ({
  detailContainer: {
    flex: 1,
    display: 'grid',
    minHeight: 0,
    gridTemplateRows: '1fr auto 1fr',
  },
  reportContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  viewerContainer: {
    display: 'grid',
    height: '100%',
    minHeight: 0,
  },
  alertContainer: {
    margin: theme.spacing(3),
    width: '100%',
    flexWrap: 'nowrap',
    color: theme.palette.banner.text,
    backgroundColor: theme.palette.status.error,
    [theme.breakpoints.up('lg')]: {
      width: '66%',
    },
  },
  restartConfirmation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
  },
  restartButton: {
    color: theme.palette.textContrast,
    letterSpacing: '0.5px',
  },
  errorMessage: {
    display: 'inline-block',
    marginTop: theme.spacing(2),
  },
  resolveCheckbox: {
    '&&': {
      color: 'inherit',
    },
  },
}));

export function WorkflowExplorer({
  setWorkflowName,
  projectId,
  executionId,
  children,
}: WorkflowExplorerProps): JSX.Element {
  const commonStyles = useCommonStyles();
  const styles = useStyles();
  const navigate = useNavigate();
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const workflowsUrl = useStore(state => state.getApiUrl(urls.Workflows));
  const workflowError = useStore(state => state.workflowError) as Error | null;
  const [selectedTaskId, setSelectedTask] = useState<string | null>('');
  const [isResolved, setIsResolved] = useState<boolean>(false);
  const [isAboutToRestart, setIsAboutToRestart] = useState<boolean>(false);
  const { tasks, workflowName } = useUpdateWorks({ executionId });
  const { log } = useUpdateLogs({ tasks, selectedTaskId, executionId });

  const [{ error: restartError, loading }, restartWorkflow] =
    useAsyncFn(async () => {
      setIsAboutToRestart(false);
      setIsResolved(false);
      const data = await fetch(`${workflowsUrl}/${executionId}/restart`, {
        method: 'POST',
      });
      const { workFlowExecutionId } = workflowExecute.parse(await data.json());

      navigate(
        `/parodos/onboarding/${projectId}/${workFlowExecutionId}/workflow-detail`,
      );
    }, [fetch, workflowsUrl, executionId, navigate, projectId]);

  useEffect(() => {
    if (workflowName) {
      setWorkflowName(workflowName);
    }
  }, [setWorkflowName, workflowName]);

  const isFailed = !loading && tasks.some(task => task.status === 'FAILED');

  useEffect(() => {
    if (restartError) {
      // eslint-disable-next-line no-console
      console.error(restartError);
      errorApi.post(new Error(`Workflow restarting failed.`));
    }
  }, [errorApi, restartError]);

  return (
    <Box className={styles.detailContainer}>
      {tasks.length > 0 && !loading ? (
        <WorkFlowStepper tasks={tasks} setSelectedTask={setSelectedTask} />
      ) : (
        <div>
          <Progress />
        </div>
      )}
      <div className={styles.reportContainer}>
        {isFailed && (
          <SnackbarContent
            classes={{
              root: styles.alertContainer,
              message: commonStyles.fullWidth,
            }}
            message={
              <>
                <p>{`Workflow ${workflowName} has encountered an error:`}</p>
                {workflowError && workflowError.message && (
                  <code className={styles.errorMessage}>
                    {workflowError.message}
                  </code>
                )}
                {isAboutToRestart && (
                  <div className={styles.restartConfirmation}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          classes={{ colorSecondary: styles.resolveCheckbox }}
                        />
                      }
                      label="I have resolved this issue"
                      name="resolved"
                      onChange={() => setIsResolved(!isResolved)}
                    />
                    <Button
                      key="undo"
                      color="inherit"
                      size="small"
                      disabled={!isResolved}
                      onClick={restartWorkflow}
                      className={styles.restartButton}
                    >
                      restart workflow
                    </Button>
                  </div>
                )}
              </>
            }
            action={
              !isAboutToRestart && [
                <Button
                  key="undo"
                  color="inherit"
                  size="small"
                  onClick={() => setIsAboutToRestart(true)}
                  className={styles.restartButton}
                >
                  restart
                </Button>,
              ]
            }
          />
        )}
        {children && <div className={commonStyles.fullWidth}>{children}</div>}
      </div>
      <div className={styles.viewerContainer}>
        {log !== '' && <WorkFlowLogViewer log={log} />}
      </div>
    </Box>
  );
}
