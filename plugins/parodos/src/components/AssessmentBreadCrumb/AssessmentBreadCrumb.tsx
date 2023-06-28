import React from 'react';
import { makeStyles, Typography } from '@material-ui/core';
import { Link, Breadcrumbs } from '@backstage/core-components';

interface AssessmentBreadCrumbProps {
  linkText?: string;
  projectId: string;
  executionId: string;
  current: string;
}

const useStyles = makeStyles(theme => ({
  link: {
    color: theme.palette.primary.main,
  },
}));

export function AssessmentBreadCrumb({
  projectId,
  executionId,
  linkText = 'Return to Assessment results',
  current,
}: AssessmentBreadCrumbProps): JSX.Element {
  const styles = useStyles();

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <Link
        className={styles.link}
        to={`/parodos/workflows/assessment/${projectId}/${executionId}`}
      >
        {linkText}
      </Link>
      <Typography>{current}</Typography>
    </Breadcrumbs>
  );
}
