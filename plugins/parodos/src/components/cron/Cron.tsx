import { Grid } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import {
  daysUnit,
  getPeriodFromCronParts,
  hoursUnit,
  minutesUnit,
  monthsUnit,
  parseCronString,
  parsePartString,
  weekdaysUnit,
} from './helpers';
import { PeriodSelector } from './PeriodSelector';
import { TimeSelector } from './TimeSelector';
import { Period } from './types';

export interface CronProps {
  cron: string;
  leadingZero?: boolean | Period[];
  clockFormat?: '12h' | '24h';
  onChange: (cron: string) => void;
}

function parseCron(cron: string): [Period, ...string[]] {
  const parts = parseCronString(cron);
  const units = [minutesUnit, hoursUnit, daysUnit, monthsUnit, weekdaysUnit];
  const parsed = parts.map((part, index) =>
    parsePartString(part, units[index]),
  );

  return [getPeriodFromCronParts(parsed), ...parts];
}

export function Cron({
  cron,
  onChange,
  clockFormat,
  leadingZero,
}: CronProps): JSX.Element {
  const [period, setPeriod] = useState(Period.Year);
  const [minutes, setMinutes] = useState<string>('*');
  const [hours, setHours] = useState<string>('*');
  const [days, setDays] = useState<string>('*');
  const [months, setMonths] = useState<string>('*');
  const [weekdays, setWeekdays] = useState<string>('*');

  useEffect(() => {
    const [newPeriod, newMinutes, newHours, newDays, newMonths, newWeekdays] =
      parseCron(cron);
    setPeriod(newPeriod);
    setMinutes(newMinutes);
    setHours(newHours);
    setDays(newDays);
    setMonths(newMonths);
    setWeekdays(newWeekdays);
  }, [cron]);

  useEffect(() => {
    onChange([minutes, hours, days, months, weekdays].join(' '));
  }, [minutes, hours, days, months, weekdays, onChange]);

  return (
    <Grid container spacing={2} alignItems="flex-end">
      <Grid item xs={12} sm={6} md={2}>
        <PeriodSelector period={period} onChange={setPeriod} />
      </Grid>
      {period === Period.Year && (
        <Grid item xs={12} sm={6} md={2}>
          <TimeSelector
            unit={monthsUnit}
            label="in month(s)"
            rawValue={months}
            onChange={setMonths}
            humanize
          />
        </Grid>
      )}
      {(period === Period.Year || period === Period.Month) && (
        <Grid item xs={12} sm={6} md={2}>
          <TimeSelector
            unit={daysUnit}
            label="on day(s)"
            rawValue={days}
            onChange={setDays}
            leadingZero={leadingZero}
          />
        </Grid>
      )}
      {(period === Period.Year ||
        period === Period.Month ||
        period === Period.Week) && (
        <Grid item xs={12} sm={6} md={2}>
          <TimeSelector
            unit={weekdaysUnit}
            label="on weekday(s)"
            rawValue={weekdays}
            onChange={setWeekdays}
            humanize
          />
        </Grid>
      )}
      {(period === Period.Year ||
        period === Period.Month ||
        period === Period.Week ||
        period === Period.Day) && (
        <Grid item xs={12} sm={6} md={2}>
          <TimeSelector
            unit={hoursUnit}
            label="at hour(s)"
            rawValue={hours}
            onChange={setHours}
            clockFormat={clockFormat}
            leadingZero={leadingZero}
          />
        </Grid>
      )}
      {(period === Period.Year ||
        period === Period.Month ||
        period === Period.Week ||
        period === Period.Day ||
        period === Period.Hour) && (
        <Grid item xs={12} sm={6} md={2}>
          <TimeSelector
            unit={minutesUnit}
            label="at minute(s)"
            rawValue={minutes}
            onChange={setMinutes}
            clockFormat={clockFormat}
            leadingZero={leadingZero}
          />
        </Grid>
      )}
    </Grid>
  );
}
