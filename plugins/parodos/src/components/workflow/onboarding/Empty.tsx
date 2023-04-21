import React from 'react';
import { InfoCard } from '@backstage/core-components';
import { Typography, Button, makeStyles, Box } from '@material-ui/core';
import { IChangeEvent } from '@rjsf/core-v5';
import { RJSFSchema } from '@rjsf/utils';

export const useStyles = makeStyles(theme => ({
  spacing: {
    display: 'grid',
    placeItems: 'center',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
  },
  next: {
    marginTop: theme.spacing(5),
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4),
  },
}));

interface Props {
  startWorkflow: ({
    formData,
  }?: IChangeEvent<any, RJSFSchema, any>) => Promise<void>;
}

export function Empty({ startWorkflow }: Props): JSX.Element {
  const styles = useStyles();

  return (
    <InfoCard>
      <Box className={styles.spacing}>
        <Typography paragraph>
          Nothing is needed from you to get started.
        </Typography>
        <Typography paragraph>
          Click the Run button below to get started.
        </Typography>
        <Button
          type="button"
          variant="contained"
          color="primary"
          className={styles.next}
          onClick={async () => {
            await startWorkflow();
          }}
        >
          Run Workflow
        </Button>
      </Box>
    </InfoCard>
  );
}
