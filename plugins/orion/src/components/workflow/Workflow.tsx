import React, { useState } from 'react';
import {
  ContentHeader,
  InfoCard,
  Progress,
  SupportButton,
} from '@backstage/core-components';
import { useEffect } from 'react';
import { errorApiRef, useApi } from '@backstage/core-plugin-api';
import { Form } from '../Form/Form';
import { ParodosPage } from '../ParodosPage';
import { Typography, Button, makeStyles, Grid } from '@material-ui/core';
import { useGetProjectAssessmentSchema } from './useGetProjectAssessmentSchema';
import type { AssessmentStatusType } from '../types';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import { useBackendUrl } from '../api';
import { IChangeEvent } from '@rjsf/core-v5';
import { type Project } from '../../models/workflowDefinitionSchema';
import { WorkflowDefinitions } from './WorkflowDefinitions';
import { useGetWorkflowDefinitions } from '../../hooks/useGetWorkflowDefinitions';

const useStyles = makeStyles({
  fullHeight: {
    height: '100%',
  },
});

export function Workflow(): JSX.Element {
  const [project, setProject] = useState<Project>();
  const backendUrl = useBackendUrl();
  const { value: workflowDefinitions = [] } = useGetWorkflowDefinitions();
  const [assessmentStatus, setAssessmentStatus] =
    useState<AssessmentStatusType>('none');
  const styles = useStyles();

  const { loading, error, value: formSchema } = useGetProjectAssessmentSchema();

  const [, startAssessment] = useAsyncFn(async ({ formData }: IChangeEvent) => {
    setAssessmentStatus('inprogress');

    const response = await fetch(`${backendUrl}/api/proxy/parodos/projects`, {
      method: 'POST',
      body: JSON.stringify({
        name: formData.projectName,
      }),
    });

    setProject((await response.json()) as Project);

    setAssessmentStatus('complete');
  }, []);

  const errorApi = useApi(errorApiRef);

  useEffect(() => {
    if (error) {
      errorApi.post(new Error(`Getting definition failed, ${error}`));
    }
  }, [error, errorApi]);

  const inProgress = assessmentStatus === 'inprogress';
  const complete = assessmentStatus === 'complete';

  const disableForm = inProgress || complete;

  return (
    <ParodosPage stretch>
      <ContentHeader title="Project assessment">
        <SupportButton title="Need help?">Lorem Ipsum</SupportButton>
      </ContentHeader>
      <Typography paragraph>
        Select a project for an assessment of what additional workflows, if any,
        it qualifies for.
      </Typography>
      {loading && <Progress />}
      {formSchema?.schema && (
        <InfoCard className={styles.fullHeight}>
          <Grid container direction="row">
            <Grid item xs={12} xl={8}>
              <Form
                formSchema={formSchema}
                onSubmit={startAssessment}
                disabled={disableForm}
              >
                <Button
                  type="submit"
                  disabled={disableForm}
                  variant="contained"
                  color="primary"
                >
                  {inProgress ? 'IN PROGRESS' : 'START ASSESSMENT'}
                </Button>
              </Form>
            </Grid>
            <Grid item xs={12}>
              {assessmentStatus === 'complete' && project && (
                <WorkflowDefinitions
                  project={project}
                  workflowDefinitions={workflowDefinitions.filter(
                    workflowDefinition =>
                      // TODO: is following correct?
                      !['ASSESSMENT', 'CHECKER'].includes(
                        workflowDefinition.type,
                      ),
                  )}
                />
              )}
            </Grid>
          </Grid>
        </InfoCard>
      )}
    </ParodosPage>
  );
}
