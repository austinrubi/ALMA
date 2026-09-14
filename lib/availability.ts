import type { AlmaDB, PlayWindow } from '../types';

export const DOW_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DOW_ABBR  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DOW_LONG  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function fmtTime12(hhmm: string): string {
  const [h, m] = String(hhmm).split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}${m ? ':' + String(m).padStart(2, '0') : ''} ${ap}`;
}

export function playWindowsOf(db: AlmaDB): PlayWindow[] {
  return (db.SEASON && db.SEASON.playWindows) || [];
}

export interface Slot {
  id: string;
  dow: number;
  start: string;
  end: string;
}

export function weeklySlots(db: AlmaDB): Slot[] {
  const out: Slot[] = [];
  playWindowsOf(db).forEach(w => {
    w.days.slice().sort((a, b) => a - b).forEach(d => {
      out.push({ id: `${w.id}-${d}`, dow: d, start: w.start, end: w.end });
    });
  });
  return out.sort((a, b) => (a.dow === b.dow ? a.start.localeCompare(b.start) : a.dow - b.dow));
}

export function weekSlotId(week: number, slotId: string): string {
  return `w${week}-${slotId}`;
}

export function seasonWeeks(db: AlmaDB): number[] {
  return Array.from({ length: (db.SEASON && db.SEASON.weekCount) || 8 }, (_, i) => i + 1);
}

export function slotAvailabilityOf(db: AlmaDB, uid: string): Record<string, string> {
  return ((db.SEASON && db.SEASON.slotAvailability) || {})[uid] || {};
}

export function weekAnswerCount(db: AlmaDB, uid: string, week: number): { answered: number; total: number } {
  const mine = slotAvailabilityOf(db, uid);
  const slots = weeklySlots(db);
  return { answered: slots.filter(s => mine[weekSlotId(week, s.id)]).length, total: slots.length };
}

export function weeksAnsweredCount(db: AlmaDB, uid: string): number {
  return seasonWeeks(db).filter(w => {
    const { answered, total } = weekAnswerCount(db, uid, w);
    return total > 0 && answered === total;
  }).length;
}

export function slotLabel(slot: Slot): string {
  return `${DOW_LONG[slot.dow]}s`;
}

export function slotHours(slot: Slot): string {
  return `${fmtTime12(slot.start)}\u2013${fmtTime12(slot.end)} ET`;
}

export function toMin(hhmm: string): number {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

export function describeWindow(w: PlayWindow): string {
  const days = w.days.slice().sort((a, b) => a - b).map(d => DOW_LONG[d] + 's');
  if (!days.length) return 'No days chosen';
  const joined = days.length <= 1 ? days[0] || '' : days.length === 2 ? days.join(' & ') : days.slice(0, -1).join(', ') + ' & ' + days[days.length - 1];
  return `${joined}, ${fmtTime12(w.start)}\u2013${fmtTime12(w.end)} ET`;
}
