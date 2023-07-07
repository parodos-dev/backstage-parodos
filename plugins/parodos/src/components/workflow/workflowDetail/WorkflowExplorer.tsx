import { Progress } from '@backstage/core-components';
import { Box, makeStyles } from '@material-ui/core';
import React, {
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { useUpdateLogs } from '../hooks/useUpdateLogs';
import { useUpdateWorks } from '../hooks/useUpdateWorks';
import { WorkFlowStepper } from './topology/WorkFlowStepper';
import { WorkFlowLogViewer } from './WorkFlowLogViewer';
import cs from 'classnames';

interface WorkflowExplorerProps {
  executionId: string;
  setWorkflowName: Dispatch<SetStateAction<string>>;
  children?: ReactNode;
}

const useStyles = makeStyles(_theme => ({
  detailContainer: {
    flex: 1,
    display: 'grid',
    minHeight: 0,
  },
  twoRow: {
    gridTemplateRows: '2fr 1fr',
  },
  threeRow: {
    gridTemplateRows: '1fr auto 1fr',
  },
  viewerContainer: {
    display: 'grid',
    height: '100%',
    minHeight: 0,
  },
}));

export function WorkflowExplorer({
  setWorkflowName,
  executionId,
  children,
}: WorkflowExplorerProps): JSX.Element {
  const styles = useStyles();
  const [selectedTaskId, setSelectedTask] = useState<string | null>('');
  const { tasks, workflowName } = useUpdateWorks({ executionId });
  const { log } = useUpdateLogs({ tasks, selectedTaskId, executionId });

  useEffect(() => {
    if (workflowName) {
      setWorkflowName(workflowName);
    }
  }, [setWorkflowName, workflowName]);

  return (
    <Box
      className={cs(styles.detailContainer, {
        [styles.threeRow]: !!children,
        [styles.twoRow]: !children,
      })}
    >
      {tasks.length > 0 ? (
        <WorkFlowStepper tasks={tasks} setSelectedTask={setSelectedTask} />
      ) : (
        <Progress />
      )}
      {children && <div>{children}</div>}
      <div className={styles.viewerContainer}>
        {log !== '' && <WorkFlowLogViewer log={log} />}
      </div>
    </Box>
  );
}
