import { ItemCardHeader } from '@backstage/core-components';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  makeStyles,
  Typography,
} from '@material-ui/core';
import React from 'react';
import { useCommonStyles } from '../../styles';
import { Link } from 'react-router-dom';
import { type Project } from '../../models/project';
import { WorkflowOptionsListItem } from './hooks/useCreateWorkflow';
import cs from 'classnames';
import CheckIcon from '@material-ui/icons/Check';

interface WorkflowOptionsListProps {
  project: Project;
  workflowOptions: WorkflowOptionsListItem[];
  assessmentWorkflowExecutionId: string;
  isNew: boolean;
}

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
  badge: {
    marginLeft: theme.spacing(15),
  },
  badgeContent: {
    display: 'flex',
    padding: '2rem .5rem',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
}));

export function WorkflowOptionsList({
  project,
  workflowOptions,
  assessmentWorkflowExecutionId,
  isNew,
}: WorkflowOptionsListProps): JSX.Element {
  const commonStyles = useCommonStyles();
  const styles = useStyles();

  const introduction = isNew
    ? 'Assessment completed. To continue please select from the following option(s):'
    : 'Your project qualifies for the following option(s):';

  return (
    <>
      <Typography paragraph className={commonStyles.margintop1}>
        {introduction}
      </Typography>
      <Grid container direction="row" spacing={2}>
        {workflowOptions.map(workflowOption => (
          <Grid item xs={12} lg={6} xl={4} key={workflowOption.identifier}>
            <Card
              className={cs(styles.applicationCard, {
                [styles.recommended]: workflowOption.recommended,
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
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                marginLeft="1rem"
                marginRight="2rem"
                marginY="1rem"
              >
                <Button
                  variant="text"
                  color="primary"
                  component={Link}
                  to={`/parodos/onboarding/${project?.id}/${workflowOption.workFlowName}/${assessmentWorkflowExecutionId}/new/?option=${workflowOption.displayName}`}
                >
                  START
                </Button>
                {workflowOption.recommended && (
                  <Badge
                    color="primary"
                    badgeContent={
                      <div className={styles.badgeContent}>
                        <span>Recommended</span>
                        <CheckIcon />
                      </div>
                    }
                    overlap="circular"
                    className={styles.badge}
                  />
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
