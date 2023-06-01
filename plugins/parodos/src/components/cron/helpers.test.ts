import {
  partToString,
  parseCronString,
  parsePartString,
  monthsUnit,
  weekdaysUnit,
  minutesUnit,
  hoursUnit,
} from './helpers';

describe('cron helpers', () => {
  describe('partToString', () => {
    it('should return *', () => {
      expect(partToString([], monthsUnit)).toEqual('*');
    });
    it('should return */x', () => {
      expect(partToString([1, 3, 5, 7, 9, 11], monthsUnit)).toEqual('*/2');
    });
    it('should return 2-12/2', () => {
      expect(partToString([2, 4, 6, 8, 10, 12], monthsUnit)).toEqual('2-12/2');
    });
    it('should return 1,3,7,12', () => {
      expect(partToString([1, 3, 7, 12], monthsUnit)).toEqual('1,3,7,12');
    });
    it('should return 1-11', () => {
      expect(
        partToString([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], monthsUnit),
      ).toEqual('1-11');
    });
    it('should return 1,3-5,7,9,11-12', () => {
      expect(partToString([1, 3, 4, 5, 7, 9, 11, 12], monthsUnit)).toEqual(
        '1,3-5,7,9,11-12',
      );
    });
    it('should return JAN-FEB', () => {
      expect(partToString([1, 2], monthsUnit, true)).toEqual('JAN-FEB');
    });
    it('should return WED-THU,SAT', () => {
      expect(partToString([3, 4, 6], weekdaysUnit, true)).toEqual(
        'WED-THU,SAT',
      );
    });
    it('should return MON-FRI/2', () => {
      expect(partToString([1, 3, 5], weekdaysUnit, true)).toEqual('MON-FRI/2');
    });
    it('should return 00,02,04-08', () => {
      expect(
        partToString([0, 2, 4, 5, 6, 7, 8], minutesUnit, false, true),
      ).toEqual('00,02,04-08');
    });
    it('should return 00-08/2', () => {
      expect(partToString([0, 2, 4, 6, 8], minutesUnit, false, true)).toEqual(
        '00-08/2',
      );
    });
    it('should return 5AM-3PM/2', () => {
      expect(
        partToString([5, 7, 9, 11, 13, 15], hoursUnit, false, false, '12h'),
      ).toEqual('5AM-3PM/2');
    });
  });

  describe('parseCronString', () => {
    it('should parse cron string', () => {
      expect(parseCronString('* * * * *')).toEqual(['*', '*', '*', '*', '*']);
      expect(parseCronString('*/2 1,3,5,7,9,11 1-11 1,3,7,12 1-11')).toEqual([
        '*/2',
        '1,3,5,7,9,11',
        '1-11',
        '1,3,7,12',
        '1-11',
      ]);
      expect(parseCronString('a b c d e')).toEqual(['a', 'b', 'c', 'd', 'e']);
    });
    it('should throw error', () => {
      expect(() => parseCronString({} as string)).toThrow(
        'Invalid cron string',
      );
      expect(() => parseCronString('a b')).toThrow(
        'Invalid cron string format',
      );
    });
  });

  describe('parsePartString', () => {
    it('should return []', () => {
      expect(parsePartString('*', monthsUnit)).toEqual([]);
    });
    it('should return [1,3,5,7,9,11]', () => {
      expect(parsePartString('*/2', monthsUnit)).toEqual([1, 3, 5, 7, 9, 11]);
    });
    it('should return [1,3,4,5,7,9,10,11]', () => {
      expect(parsePartString('*/2,*/3', monthsUnit)).toEqual([
        1, 3, 4, 5, 7, 9, 10, 11,
      ]);
    });
    it('should return [2,4,6,8,10,12]', () => {
      expect(parsePartString('2-12/2', monthsUnit)).toEqual([
        2, 4, 6, 8, 10, 12,
      ]);
    });
    it('should return [1,3,5,6]', () => {
      expect(parsePartString('MON,WED,FRI-SAT', weekdaysUnit)).toEqual([
        1, 3, 5, 6,
      ]);
    });
  });
});
