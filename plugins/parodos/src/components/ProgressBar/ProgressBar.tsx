import {
  Box,
  LinearProgress,
  Typography,
  type LinearProgressProps,
} from '@material-ui/core';
import React from 'react';

export function ProgressBar(props: LinearProgressProps & { value: number }) {
  return (
    <Box>
      <Box width="100%" mr={1}>
        <LinearProgress color="primary" variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${
          props.value % 1 === 0
            ? Math.round(props.value)
            : props.value.toFixed(1)
        }%`}</Typography>
      </Box>
    </Box>
  );
}
