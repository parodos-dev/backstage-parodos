import {
  ClickAwayListener,
  Grow,
  makeStyles,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  TextField,
} from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';
import {
  isFullInterval,
  isInterval,
  parsePartString,
  partToString,
} from './helpers';
import { Period, TimeUnit } from './types';

const useStyles = makeStyles(() => ({
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '8px',
    width: '300px',
  },
}));

export interface TimeSelectorProps {
  rawValue: string;
  unit: TimeUnit;
  label: string;
  onChange: (value: string) => void;
  humanize?: boolean;
  leadingZero?: boolean | Period[];
  clockFormat?: '12h' | '24h';
}

export function TimeSelector({
  rawValue,
  unit,
  label,
  onChange,
  humanize,
  leadingZero,
  clockFormat,
}: TimeSelectorProps): JSX.Element {
  const classes = useStyles();
  const valueInputRef = React.useRef<HTMLInputElement>(null);
  const [openSelect, setOpenSelect] = React.useState(false);
  const [period, setPeriod] = useState<number | undefined>();
  const [values, setValues] = useState(
    new Set(parsePartString(rawValue, unit)),
  );
  const stringValue = useMemo(
    () => partToString([...values], unit, humanize, leadingZero, clockFormat),
    [values, unit, humanize, leadingZero, clockFormat],
  );

  const handleSelectClose = (event: React.MouseEvent<Node, MouseEvent>) => {
    if (
      valueInputRef.current &&
      valueInputRef.current.contains(event.target as Node)
    ) {
      return;
    }

    setOpenSelect(false);
  };
  const handleListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpenSelect(false);
    }
  };
  const handleChangeTime = (value: number) => {
    setPeriod(undefined);
    setValues(prevValues => {
      if (prevValues.has(value)) {
        const newValues = new Set(prevValues);
        newValues.delete(value);
        return newValues;
      }
      const newValues = [...prevValues, value].sort((a, b) => a - b);
      return new Set(newValues);
    });
  };
  const handleChangePeriod = (value: number) => {
    if (value < 2 || value === period) {
      setPeriod(undefined);
      setValues(new Set());
    } else {
      setPeriod(value);
      setValues(
        new Set(
          Array.from({ length: unit.total })
            .map((_, index) => index + unit.min)
            .filter(v => v % value === 0),
        ),
      );
    }
  };

  useEffect(() => {
    const newPeriod = isInterval([...values]);
    if (newPeriod && isFullInterval([...values], unit, newPeriod)) {
      setPeriod(newPeriod);
    }
  }, [values, unit]);

  useEffect(() => {
    if (!openSelect) {
      onChange(stringValue);
    }
  }, [openSelect, onChange, stringValue]);

  useEffect(() => {
    setPeriod(undefined);
    setValues(new Set(parsePartString(rawValue, unit)));
  }, [rawValue, unit]);

  const inputValue = useMemo(() => {
    if (period) {
      return `every ${period} ${unit.label}${period > 1 ? 's' : ''}`;
    }
    return values.size > 0 ? stringValue : `every ${unit.label}`;
  }, [values, unit, stringValue, period]);

  return (
    <>
      <Popper
        open={openSelect}
        anchorEl={valueInputRef.current}
        role={undefined}
        transition
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleSelectClose}>
                <MenuList
                  autoFocusItem={openSelect}
                  id={`cron-${unit.type.toLowerCase()}-selector`}
                  onKeyDown={handleListKeyDown}
                  className={
                    unit.type !== Period.Month && unit.type !== Period.Week
                      ? classes.menuGrid
                      : undefined
                  }
                >
                  {Array.from({ length: unit.total }).map((_, index) => (
                    <MenuItem
                      key={index}
                      selected={values.has(index + unit.min)}
                      onClick={() => handleChangeTime(index + unit.min)}
                      onDoubleClick={() => handleChangePeriod(index + unit.min)}
                    >
                      {unit.labels ? unit.labels[index] : index + unit.min}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      <TextField
        ref={valueInputRef}
        label={label}
        fullWidth
        InputProps={{ readOnly: true }}
        variant="outlined"
        value={inputValue}
        onClick={() => setOpenSelect(true)}
      />
    </>
  );
}
