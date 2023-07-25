import { ParodosPage } from '../../ParodosPage';
import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { Box, Chip, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useStore } from '../../../stores/workflowStore/workflowStore';
import { assert } from 'assert-ts';
import { AssessmentBreadCrumb } from '../../AssessmentBreadCrumb/AssessmentBreadCrumb';
import { useSearchParams } from 'react-router-dom';
import { WorkflowExplorer } from './WorkflowExplorer';
import { useCommonStyles } from '../../../styles';

const useStyles = makeStyles(_theme => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
  },
}));

export function WorkFlowDetail(): JSX.Element {
  const commonStyles = useCommonStyles();
  const { projectId, executionId } = useParams();
  assert(!!projectId, 'no projectId param');
  assert(!!executionId, 'no executionId param');
  const project = useStore(state => state.getProjectById(projectId));
  const { isNew = false } = useLocation().state ?? {};
  const styles = useStyles();
  const [searchParams] = useSearchParams();

  const assessmentWorkflowExecutionId = searchParams.get(
    'assessmentexecutionid',
  );
  const [workflowName, setWorkflowName] = useState('');

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
      <InfoCard className={commonStyles.svgCard}>
        <Typography paragraph>
          Please provide additional information related to your project.
        </Typography>
        <Typography paragraph>
          You are onboarding <strong>{project?.name || '...'}</strong> project,
          running workflow "{workflowName}" (execution ID: {executionId})
        </Typography>
        <WorkflowExplorer
          setWorkflowName={setWorkflowName}
          executionId={executionId}
          projectId={projectId}
        />
      </InfoCard>
    </ParodosPage>
  );
}
