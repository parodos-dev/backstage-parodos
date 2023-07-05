import React, { useEffect } from 'react';
import {
  ContentHeader,
  InfoCard,
  SupportButton,
} from '@backstage/core-components';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import { Grid, makeStyles, Typography } from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { IChangeEvent } from '@rjsf/core-v5';
import { assert } from 'assert-ts';
import { useStore } from '../../stores/workflowStore/workflowStore';
import { ProjectsPayload, useCreateWorkflow } from './hooks/useCreateWorkflow';
import { useNavigate, useSearchParams } from 'react-router-dom';

export type AssessmentStatusType = 'none' | 'inprogress' | 'complete';

const useStyles = makeStyles(theme => ({
  fullHeight: {
    height: '100%',
  },
  form: {
    '& .field-boolean > div > label': {
      display: 'inline-block',
      marginBottom: theme.spacing(2),
      '& + div': {
        flexDirection: 'row',
      },
    },
  },
  viewMoreButton: {
    textDecoration: 'underline',
  },
  running: {
    color: theme.palette.primary.main,
  },
  options: {
    marginBottom: theme.spacing(3),
  },
}));

export function Workflow(): JSX.Element {
  const assessment = useStore(state => state.workflows.assessment);
  const [searchParams] = useSearchParams();
  const selectedProject = useStore(state =>
    state.getProjectById(searchParams.get('project')),
  );
  const navigate = useNavigate();

  const styles = useStyles();

  const formSchema = useGetProjectAssessmentSchema();

  const [{ error: createWorkflowError }, createWorkflow] =
    useCreateWorkflow(assessment);

  const [{ loading, error: startAssessmentError }, startAssessment] =
    useAsyncFn(
      async ({ formData }: IChangeEvent<Record<string, ProjectsPayload>>) => {
        assert(!!formData, `no formData`);

        const { assessmentWorkflowExecutionId } = await createWorkflow({
          projectId: selectedProject.id,
          formData,
        });

        navigate(
          `/parodos/workflows/assessment/${selectedProject.id}/${assessmentWorkflowExecutionId}/execution`,
        );
      },
      [createWorkflow, navigate, selectedProject.id],
    );

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (startAssessmentError || createWorkflowError) {
      // eslint-disable-next-line no-console
      console.error(startAssessmentError ?? createWorkflowError);
      errorApi.post(new Error(`Creating assessment failed`));
    }
  }, [createWorkflowError, errorApi, startAssessmentError]);

  return (
    <ParodosPage stretch>
      <ContentHeader title="Assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      {formSchema && (
        <InfoCard className={styles.fullHeight}>
          <Grid container direction="row" className={styles.form}>
            <Grid item xs={12} xl={8}>
              <Form
                formSchema={formSchema}
                onSubmit={startAssessment}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
