export interface TimeUnit {
  label: string;
  type: Period;
  min: number;
  max: number;
  total: number;
  alt?: string[];
  labels?: string[];
}

export enum Period {
  Minute = 'Minute',
  Hour = 'Hour',
  Day = 'Day',
  Week = 'Week',
  Month = 'Month',
  Year = 'Year',
}
