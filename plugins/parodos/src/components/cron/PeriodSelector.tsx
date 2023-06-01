import { Select } from '@backstage/core-components';
import React, { useCallback } from 'react';
import { Period } from './types';

const options = Object.values(Period).map(value => ({ label: value, value }));

export interface PeriodSelectorProps {
  period: Period;
  onChange: (period: Period) => void;
}

export function PeriodSelector({
  period,
  onChange,
}: PeriodSelectorProps): JSX.Element {
  const handleChange = useCallback(
    value => onChange(value as Period),
    [onChange],
  );
  return (
    <Select
      label="Every"
      selected={period}
      items={options}
      onChange={handleChange}
    />
  );
}
