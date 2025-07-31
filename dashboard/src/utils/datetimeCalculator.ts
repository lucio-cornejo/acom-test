import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);


const spanishDaysFromSunday = [
  "Domingo", "Lunes", "Martes", 
  "Miércoles", "Jueves", "Viernes", "Sábado"
];

export const spanishMonths = [
  "Enero", "Febrero", "Marzo", "Abril",
  "Mayo", "Junio", "Julio", "Agosto",
  "Setiembre", "Octubre", "Noviembre", "Diciembre"
];


const limaTimezone = "America/Lima";

const prependZeroIfNeeded = (num: number): string => {
  return num < 10 ? `0${num}` : `${num}`;
}


export function formatDate(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
};

export function formatDatetime(dt: dayjs.Dayjs): string {
  return dt.format('YYYY-MM-DD HH:mm:ss');
}

export function getCurrentDatetime(): dayjs.Dayjs {
  return dayjs().tz(limaTimezone);
}

export function getCurrentTime(): string {
  const currentLimaDatetime = getCurrentDatetime();
  return [
    currentLimaDatetime.hour(),
    currentLimaDatetime.minute(),
    currentLimaDatetime.second()
  ].map(prependZeroIfNeeded).join(":");
}


export function getCurrentDate(): string {
  const currentLimaDatetime = getCurrentDatetime();
  return [
    spanishDaysFromSunday[currentLimaDatetime.day()],
    ", ",
    currentLimaDatetime.date(),
    " ",
    spanishMonths[currentLimaDatetime.month()],
    " ",
    currentLimaDatetime.year()
  ].join('');
}


export function parseLimaDatetime(
  dateOrDatetime: string, 
  useTimezone: boolean = true,
  format?: string
): dayjs.Dayjs | null {
  try {
    const parsed = format
      ? dayjs(dateOrDatetime, format)
      : dayjs(dateOrDatetime);

    return useTimezone
      ? parsed.tz(limaTimezone)
      : parsed;
    
  } catch (error) {
    console.warn(`Date ${dateOrDatetime} produced error ${error}`);
    return null;
  }
}


export function parseUtcDatetime(utcDatetime: string): dayjs.Dayjs {
  return dayjs(utcDatetime).utc(true);
}


export function setLimeDateFormat(dateText: string): string | null {
  return parseLimaDatetime(dateText)
    ?.format("DD/MM/YYYY") ?? null;
}



export function assignTurno(initialHours: number[] | null): string | null {
    const FIRST_HOUR_FOR_VALUE_PM = 12;

    if (!Array.isArray(initialHours)) return null;

    const hasTurnAM = initialHours.some(hour => hour < FIRST_HOUR_FOR_VALUE_PM);
    const hasTurnPM = initialHours.some(hour => hour >= FIRST_HOUR_FOR_VALUE_PM);

    if (hasTurnAM && hasTurnPM) return "AM,PM";

    // Either is false, but logicwise it can not be the case that both values are false
    if (hasTurnAM) return "AM";
    
    return "PM";
}
