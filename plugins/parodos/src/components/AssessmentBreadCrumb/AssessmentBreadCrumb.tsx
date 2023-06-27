import React, { type ReactNode } from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { Link, Breadcrumbs } from '@backstage/core-components';

interface AssessmentBreadCrumbProps {
  children: ReactNode;
  projectId: string;
  executionId: string;
}

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.primary.main,
  },
}));

export function AssessmentBreadCrumb({
  projectId,
  executionId,
  children,
}: AssessmentBreadCrumbProps): JSX.Element {
  const styles = useStyles();

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        className={styles.link}
        to={`/parodos/workflows/assessment/${projectId}/${executionId}`}
      >
        Return to Assessment results
      </Link>
      <Typography>{children}</Typography>
    </Breadcrumbs>
  );
}
