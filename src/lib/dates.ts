import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export function ymd(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function parseYmd(value: string) {
  return parseISO(value);
}

export function getMonthGridDays(anchor: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(startOfMonth(anchor), { weekStartsOn });
  const end = endOfWeek(endOfMonth(anchor), { weekStartsOn });
  const days: Date[] = [];
  let cur = start;
  while (isBefore(cur, end) || isSameDay(cur, end)) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export function getWeekDays(anchor: Date, weekStartsOn: 0 | 1 = 1) {
  const start = startOfWeek(anchor, { weekStartsOn });
  const end = endOfWeek(anchor, { weekStartsOn });
  const days: Date[] = [];
  let cur = start;
  while (isBefore(cur, end) || isSameDay(cur, end)) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export function clampDateToRange(date: Date, min: Date, max: Date) {
  if (isBefore(date, min)) return min;
  if (isAfter(date, max)) return max;
  return date;
}
