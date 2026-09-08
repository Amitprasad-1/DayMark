import { format, parseISO, isValid, differenceInCalendarDays } from 'date-fns';

/**
 * Normalizes any date string (ISO timestamp or YYYY-MM-DD) into a clean YYYY-MM-DD string.
 */
export function normalizeDateStr(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  if (dateInput instanceof Date) {
    return isValid(dateInput) ? format(dateInput, 'yyyy-MM-dd') : '';
  }
  const trimmed = String(dateInput).trim();
  if (!trimmed) return '';

  // If already plain YYYY-MM-DD without time
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try parsing ISO timestamp to respect the user's local timezone
  try {
    const parsed = parseISO(trimmed);
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd');
    }
  } catch {
    // ignore
  }

  // Fallback: If contains T or space, take first part if it's YYYY-MM-DD
  const firstPart = trimmed.split(/[T ]/)[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) {
    return firstPart;
  }

  return firstPart;
}

/**
 * Robust calendar day matching. Compares primary date and optional fallback startTime against a target YYYY-MM-DD.
 */
export function isSameCalendarDay(
  primaryDate: string | undefined | null,
  fallbackStartTime: string | undefined | null,
  targetDateStr: string
): boolean {
  if (!targetDateStr) return false;
  const cleanTarget = normalizeDateStr(targetDateStr);

  if (primaryDate) {
    const cleanPrimary = normalizeDateStr(primaryDate);
    if (cleanPrimary === cleanTarget) return true;
  }

  if (fallbackStartTime) {
    const cleanFallback = normalizeDateStr(fallbackStartTime);
    if (cleanFallback === cleanTarget) return true;
  }

  return false;
}

/**
 * Computes difference in calendar days between targetDate and now.
 * Avoids 24h fractional hour truncation issues.
 */
export function getCalendarDaysRemaining(targetDateInput: string | Date, baseDate = new Date()): {
  daysRemaining: number;
  isPassed: boolean;
  formattedTarget: string;
} {
  const cleanStr = normalizeDateStr(targetDateInput);
  if (!cleanStr) {
    return { daysRemaining: 0, isPassed: true, formattedTarget: '' };
  }

  const [year, month, day] = cleanStr.split('-').map(Number);
  const targetObj = new Date(year, month - 1, day);
  const baseObj = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

  const daysRemaining = differenceInCalendarDays(targetObj, baseObj);
  const isPassed = daysRemaining < 0;

  let formattedTarget = cleanStr;
  try {
    formattedTarget = format(targetObj, 'MMM d, yyyy');
  } catch {
    // fallback
  }

  return { daysRemaining, isPassed, formattedTarget };
}
