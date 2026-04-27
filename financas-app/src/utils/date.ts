export function getLocalDateParts(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return { year, month, day };
}

export function getTodayLocalISO(date = new Date()) {
  const { year, month, day } = getLocalDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthLocalISO(date = new Date()) {
  const { year, month } = getLocalDateParts(date);
  return `${year}-${month}`;
}

export function shiftMonthLocalISO(month: string, delta: number) {
  const [yearString, monthString] = month.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const shifted = new Date(year, monthIndex + delta, 1);
  return getCurrentMonthLocalISO(shifted);
}

export function addMonthsToLocalISODate(dateString: string, monthsToAdd: number) {
  const [yearString, monthString, dayString] = dateString.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const day = Number(dayString);
  const shifted = new Date(year, monthIndex + monthsToAdd, day);
  return getTodayLocalISO(shifted);
}
