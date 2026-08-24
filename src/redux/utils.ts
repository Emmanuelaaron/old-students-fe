import { CONTRIBUTION, FINE_AMT, type Contribution } from "./types";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function load<T>(key: string, init: () => T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : init();
  } catch {
    return init();
  }
}

export const isLate = (month: string, paidAt: string) => {
  const [y, m] = month.split("-").map(Number);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return new Date(paidAt) > new Date(ny, nm - 1, 5);
};

export const isPastDue = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  const nm = m === 12 ? 1 : m + 1;
  const ny = m === 12 ? y + 1 : y;
  return new Date() > new Date(ny, nm - 1, 5);
};

export const getMonthsFrom = (joinedAt: string): string[] => {
  const months: string[] = [];
  const start = new Date(joinedAt);
  let y = start.getFullYear();
  let mo = start.getMonth() + 1;
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  while (y < cy || (y === cy && mo <= cm)) {
    months.push(`${y}-${String(mo).padStart(2, "0")}`);
    mo++;
    if (mo > 12) {
      mo = 1;
      y++;
    }
  }
  return months;
};

export function buildContribution(
  memberId: string,
  month: string,
  paidAt: string,
  id = `c-${uid()}`
): Contribution {
  const hf = isLate(month, paidAt);
  return {
    id,
    memberId,
    month,
    amount: CONTRIBUTION,
    paidAt: new Date(paidAt).toISOString(),
    hasFine: hf,
    fineAmount: hf ? FINE_AMT : 0,
    finePaid: false,
  };
}
