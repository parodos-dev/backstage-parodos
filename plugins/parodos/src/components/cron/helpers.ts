import { Period, TimeUnit } from './types';

export const minutesUnit: TimeUnit = {
  label: 'minute',
  type: Period.Minute,
  min: 0,
  max: 59,
  total: 60,
};

export const hoursUnit: TimeUnit = {
  label: 'hour',
  type: Period.Hour,
  min: 0,
  max: 23,
  total: 24,
};

export const daysUnit: TimeUnit = {
  label: 'day of the month',
  type: Period.Day,
  min: 1,
  max: 31,
  total: 31,
};

export const monthsUnit: TimeUnit = {
  label: 'month',
  type: Period.Month,
  min: 1,
  max: 12,
  total: 12,
  alt: [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ],
  labels: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

export const weekdaysUnit: TimeUnit = {
  label: 'day of the week',
  type: Period.Week,
  min: 0,
  max: 6,
  total: 7,
  alt: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
  labels: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
};

export const units = {
  [Period.Minute]: minutesUnit,
  [Period.Hour]: hoursUnit,
  [Period.Day]: daysUnit,
  [Period.Week]: weekdaysUnit,
  [Period.Month]: monthsUnit,
};

/**
 * Returns the cron part array as a string.
 */
export function partToString(
  cronPart: number[],
  unit: TimeUnit,
  humanize?: boolean,
  leadingZero?: boolean | Period[],
  clockFormat?: '12h' | '24h',
) {
  const options = {
    unit,
    humanize,
    leadingZero,
    clockFormat,
  };
  let retval = '';

  if (isFull(cronPart, options.unit) || cronPart.length === 0) {
    retval = '*';
  } else {
    const step = isInterval(cronPart);

    if (step) {
      if (isFullInterval(cronPart, options.unit, step)) {
        retval = `*/${step}`;
      } else {
        retval = `${formatValue(cronPart[0], options)}-${formatValue(
          cronPart[cronPart.length - 1],
          options,
        )}/${step}`;
      }
    } else {
      retval = toRanges(cronPart)
        .map((valueOrRange: number | number[]) => {
          if (Array.isArray(valueOrRange)) {
            return `${formatValue(valueOrRange[0], options)}-${formatValue(
              valueOrRange[1],
              options,
            )}`;
          }

          return formatValue(valueOrRange, options);
        })
        .join(',');
    }
  }
  return retval;
}

/**
 * Returns true if range has all the values of the unit
 */
function isFull(values: number[], unit: TimeUnit) {
  return values.length === unit.max - unit.min + 1;
}

/**
 * Returns true if the range can be represented as an interval
 */
export function isInterval(values: number[]) {
  let step: number | undefined;

  if (values.length <= 2) return undefined;

  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const value = values[i];

    if (step === undefined) {
      step = value - prev;
    } else if (value - prev !== step) {
      return undefined;
    }
  }

  return step === undefined || step <= 1 ? undefined : step;
}

/**
 * Returns true if the range contains all the interval values
 */
export function isFullInterval(values: number[], unit: TimeUnit, step: number) {
  const min = values[0];
  const max = values[values.length - 1];
  const haveAllValues = values.length === (max - min) / step + 1;

  return min === unit.min && max + step > unit.max && haveAllValues;
}

/**
 * Returns the range as an array of ranges
 * defined as arrays of positive integers
 */
function toRanges(values: number[]) {
  const retval: (number[] | number)[] = [];
  let startPart: number | null = null;

  values.forEach((value, index, self) => {
    if (value !== self[index + 1] - 1) {
      if (startPart !== null) {
        retval.push([startPart, value]);
        startPart = null;
      } else {
        retval.push(value);
      }
    } else if (startPart === null) {
      startPart = value;
    }
  });

  return retval;
}

/**
 * Format the value
 */
export function formatValue(
  value: number,
  options: {
    unit: TimeUnit;
    humanize?: boolean;
    leadingZero?: boolean | Period[];
    clockFormat?: '12h' | '24h';
  },
) {
  const { unit, humanize, leadingZero, clockFormat } = options;
  let cronPartString = value.toString();
  const { type, alt, min } = unit;
  const needLeadingZero =
    leadingZero && (leadingZero === true || leadingZero.includes(type as any));
  const need24HourClock =
    clockFormat === '24h' && (type === Period.Hour || type === Period.Minute);

  if (
    (humanize && type === Period.Week) ||
    (humanize && type === Period.Month)
  ) {
    cronPartString = alt![value - min];
  } else if (value < 10 && (needLeadingZero || need24HourClock)) {
    cronPartString = cronPartString.padStart(2, '0');
  }

  if (type === Period.Hour && clockFormat === '12h') {
    const suffix = value >= 12 ? 'PM' : 'AM';
    let hour: number | string = value % 12 || 12;

    if (hour < 10 && needLeadingZero) {
      hour = hour.toString().padStart(2, '0');
    }

    cronPartString = `${hour}${suffix}`;
  }

  return cronPartString;
}

/**
 * Parses a cron string to an array of parts
 */
export function parseCronString(str: string) {
  if (typeof str !== 'string') {
    throw new Error('Invalid cron string');
  }

  const parts = str.replace(/\s+/g, ' ').trim().split(' ');

  if (parts.length === 5) {
    return parts;
  }

  throw new Error('Invalid cron string format');
}

/**
 * Parses a string as a range of positive integers
 */
export function parsePartString(str: string, unit: TimeUnit) {
  if (str === '*' || str === '*/1') {
    return [];
  }

  const values = [
    ...new Set(
      fixSunday(
        replaceAlternatives(str, unit.min, unit.alt)
          .split(',')
          .map(value => {
            const valueParts = value.split('/') as [string, string | undefined];

            if (valueParts.length > 2) {
              throw new Error(`Invalid value "${str} for "${unit.type}"`);
            }

            let parsedValues: number[];
            const left = valueParts[0];
            const right = valueParts[1];

            if (left === '*') {
              parsedValues = range(unit.min, unit.max);
            } else {
              parsedValues = parseRange(left, str, unit);
            }

            const step = parseStep(right, unit);

            return applyInterval(parsedValues, step);
          })
          .flat(),
        unit,
      ),
    ),
  ].sort((a, b) => a - b);

  const value = outOfRange(values, unit);

  if (typeof value !== 'undefined') {
    throw new Error(`Value "${value}" out of range for ${unit.type}`);
  }

  // Prevent to return full array
  // If all values are selected we don't want any selection visible
  if (values.length === unit.total) {
    return [];
  }

  return values;
}

/**
 * Replace all 7 with 0 as Sunday can be represented by both
 */
function fixSunday(values: number[], unit: TimeUnit) {
  if (unit.type === Period.Week) {
    return values.map(value => value % 7);
  }

  return values;
}

/**
 * Replaces the alternative representations of numbers in a string
 */
function replaceAlternatives(str: string, min: number, alt?: string[]) {
  if (alt) {
    return Array.from(alt).reduce(
      (s, a, i) => s.replace(a, `${i + min}`),
      str.toUpperCase(),
    );
  }

  return str;
}

/**
 * Creates an array of integers from start to end, inclusive
 */
function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

/**
 * Parses a range string
 */
function parseRange(rangeStr: string, context: string, unit: TimeUnit) {
  const subparts = rangeStr.split('-');

  if (subparts.length === 1) {
    const value = convertStringToNumber(subparts[0]);

    if (isNaN(value)) {
      throw new Error(`Invalid value "${context}" for ${unit.type}`);
    }

    return [value];
  } else if (subparts.length === 2) {
    const minValue = convertStringToNumber(subparts[0]);
    const maxValue = convertStringToNumber(subparts[1]);

    if (isNaN(minValue) || isNaN(maxValue)) {
      throw new Error(`Invalid value "${context}" for ${unit.type}`);
    }

    if (maxValue < minValue) {
      throw new Error(
        `Max range is less than min range in "${rangeStr}" for ${unit.type}`,
      );
    }

    return range(minValue, maxValue);
  }

  throw new Error(`Invalid value "${rangeStr}" for ${unit.type}`);
}

/**
 * Convert a string to number but fail if not valid for cron
 */
function convertStringToNumber(str: string) {
  const parseIntValue = parseInt(str, 10);
  const numberValue = Number(str);

  return parseIntValue === numberValue ? numberValue : NaN;
}

/**
 * Parses the step from a part string
 */
function parseStep(step: string | undefined, unit: TimeUnit) {
  if (!step) return undefined;

  const parsedStep = convertStringToNumber(step);

  if (isNaN(parsedStep) || parsedStep < 1) {
    throw new Error(`Invalid interval step value "${step}" for ${unit.type}`);
  }

  return parsedStep;
}

/**
 * Applies an interval step to a collection of values
 */
function applyInterval(values: number[], step?: number) {
  if (!step) return values;

  const minVal = values[0];

  return values.filter(value => {
    return value % step === minVal % step || value === minVal;
  });
}

/**
 * Finds an element from values that is outside of the range of unit
 */
function outOfRange(values: number[], unit: TimeUnit) {
  const first = values[0];
  const last = values[values.length - 1];

  if (first < unit.min) {
    return first;
  } else if (last > unit.max) {
    return last;
  }

  return undefined;
}

/**
 * Find the period from cron parts
 */
export function getPeriodFromCronParts(cronParts: number[][]): Period {
  if (cronParts[3].length > 0) {
    return Period.Year;
  } else if (cronParts[2].length > 0) {
    return Period.Month;
  } else if (cronParts[4].length > 0) {
    return Period.Week;
  } else if (cronParts[1].length > 0) {
    return Period.Day;
  } else if (cronParts[0].length > 0) {
    return Period.Hour;
  }
  return Period.Minute;
}
