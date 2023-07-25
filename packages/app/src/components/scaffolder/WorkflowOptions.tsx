import { ItemCardHeader } from '@backstage/core-components';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  FormControl,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { FieldProps } from '@rjsf/core';
import cs from 'classnames';
import {
  configApiRef,
  errorApiRef,
  fetchApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import useAsyncFn from 'react-use/lib/useAsyncFn';
import {
  getWorkflowOptions,
  urls,
  WorkflowDefinition,
  WorkflowOptionsListItem,
} from '@parodos/plugin-parodos';
import { useWorkflowDefinitions } from './useWorkflowDefinitions';
import { useExecuteWorkflow } from './useExecuteWorkflow';

const useStyles = makeStyles(theme => ({
  applicationHeader: {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    '& h4': {
      fontWeight: 400,
    },
  },
  applicationCard: {
    background: theme.palette.background.default,
    color: theme.palette.text.secondary,
    height: '100%',
  },
  recommended: {
    border: `2px solid ${theme.palette.primary.main}`,
  },
}));

export function WorkflowOptions({
  onChange,
  rawErrors,
  required,
  formData,
  formContext,
}: FieldProps<string>) {
  const styles = useStyles();

  const {
    project: { id },
    assessmentData,
    options,
  } = formContext.formData;
  const { assessmentId } = options ?? {};
  const [workflowOptions, setWorkflowOptions] =
    useState<WorkflowOptionsListItem[]>();
  const { fetch } = useApi(fetchApiRef);
  const errorApi = useApi(errorApiRef);
  const configApi = useApi(configApiRef);
  const assessment = configApi.getString('parodos.workflows.assessment');
  const definitions = useWorkflowDefinitions();
  const executeWorkflow = useExecuteWorkflow({
    workflowDefinition: definitions?.find(
      definition => definition.name === assessment,
    ) as WorkflowDefinition,
  });
  const [{ loading, error: startAssessmentError }, startAssessment] =
    useAsyncFn(async () => {
      const { workFlowExecutionId } = await executeWorkflow({
        projectId: id,
        formData: assessmentData,
      });
      onChange({
        ...options,
        assessmentId: workFlowExecutionId,
      });
    }, [id, assessmentData, executeWorkflow, options, onChange]);

  const [{ error: getWorkflowOptionsError }, getOptions] =
    useAsyncFn(async () => {
      setWorkflowOptions(
        await getWorkflowOptions(fetch, {
          workflowsUrl: `${configApi.getString('backend.baseUrl')}${
            urls.Workflows
          }`,
          executionId: assessmentId,
        }),
      );
    }, [assessmentId, fetch, configApi]);

  useEffect(() => {
    if (definitions && !loading && !assessmentId) startAssessment();
  }, [definitions, loading, assessmentId, startAssessment]);

  useEffect(() => {
    if (assessmentId) getOptions();
  }, [assessmentId, getOptions]);

  const handleChoose = (workflowName: string) => {
    onChange({
      ...options,
      workflowName,
    });
  };

  useEffect(() => {
    if (getWorkflowOptionsError) {
      // eslint-disable-next-line no-console
      console.error(getWorkflowOptionsError);

      errorApi.post(new Error('Get workflow options failed'));
    }
  }, [errorApi, getWorkflowOptionsError]);

  useEffect(() => {
    if (startAssessmentError) {
      // eslint-disable-next-line no-console
      console.error(startAssessmentError);

      errorApi.post(new Error('Start assessment failed'));
    }
  }, [errorApi, startAssessmentError]);

  return (
    <FormControl
      margin="normal"
      required={required}
      error={rawErrors?.length > 0 && !formData}
    >
      <Typography paragraph>
        Your project qualifies for the following option(s):
      </Typography>
      <Grid container direction="row" spacing={2}>
        {workflowOptions?.map(workflowOption => (
          <Grid item xs={12} lg={6} xl={4} key={workflowOption.identifier}>
            <Card
              className={cs(styles.applicationCard, {
                [styles.recommended]:
                  workflowOption.workFlowName === options?.workflowName,
              })}
              variant="elevation"
              elevation={3}
            >
              <CardMedia>
                <CardContent>{workflowOption.type}</CardContent>
                <ItemCardHeader
                  title={workflowOption.displayName}
                  classes={{ root: styles.applicationHeader }}
                />
              </CardMedia>
              <CardContent>{workflowOption.description}</CardContent>
              <CardActions>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => handleChoose(workflowOption.workFlowName)}
                >
                  Choose
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </FormControl>
  );
}
