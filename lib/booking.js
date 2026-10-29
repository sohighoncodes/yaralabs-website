export const BOOKING_URL = 'https://calendar.app.google/BEKk213nkobDqUM47';

export function sharedBookingIntent(pathname) {
  const path = pathname.replace(/\/+$/, '');
  return path === '/quote' ? 'quote' : path === '/book' ? 'call' : null;
}
