const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function formatDayMonth(dateStr: string): { day: number; month: string } {
  const d = new Date(`${dateStr}T00:00:00`);
  return { day: d.getDate(), month: MONTHS_FR[d.getMonth()] };
}

export function formatFullDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}
