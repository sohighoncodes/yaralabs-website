export function calendarFixture() {
  const day = new Date(); day.setUTCDate(day.getUTCDate() + 1); day.setUTCHours(3, 0, 0, 0);
  return { slots: [0, 30, 60, 24 * 60].map(minute => new Date(+day + minute * 60000).toISOString()), duration: 30, timeZone: 'Asia/Manila' };
}
