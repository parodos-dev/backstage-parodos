import {
  Box,
  CircularProgress,
  CircularProgressProps,
  LinearProgress,
  Typography,
  TypographyProps,
  type LinearProgressProps,
} from '@material-ui/core';
import React from 'react';

export type ProgressBarProps =
  | {
      variant: 'circular';
      value: number;
      progressProps?: Omit<CircularProgressProps, 'variant' | 'value'>;
    }
  | {
      variant: 'linear';
      value: number;
      progressProps?: Omit<LinearProgressProps, 'variant' | 'value'>;
    };

function ProgressBarText({
  value,
}: { value: number } & Pick<TypographyProps, 'variant'>): JSX.Element {
  return (
    <Typography variant="caption" component="div" color="textSecondary">{`${
      value === 0 || value === 100 ? Math.round(value) : value.toFixed(1)
    }%`}</Typography>
  );
}

function CircularProgressBar({
  value,
  ...props
}: Omit<CircularProgressProps, 'variant' | 'value'> & {
  value: number;
}): JSX.Element {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        value={value}
        size="50px"
        {...(props ?? {})}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <ProgressBarText variant="caption" value={value} />
      </Box>
    </Box>
  );
}

function LinearProgressBar({
  value,
  ...props
}: Omit<LinearProgressProps, 'variant' | 'value'> & {
  value: number;
}): JSX.Element {
  return (
    <Box>
      <Box width="100%" mr={1}>
        <LinearProgress
          color="primary"
          variant="determinate"
          value={value}
          {...props}
        />
      </Box>
      <Box minWidth={35}>
        <ProgressBarText variant="body2" value={value} />
      </Box>
    </Box>
  );
}

export function ProgressBar({
  variant,
  ...props
}: ProgressBarProps & { value: number }) {
  return variant === 'circular' ? (
    <CircularProgressBar {...props} />
  ) : (
    <LinearProgressBar {...props} />
  );
}
