import { BOOKING_URL } from '../lib/booking';

export default function BookingLink({ children, intent = 'call', ...props }) {
  return <a {...props} href={BOOKING_URL} data-booking-link="" data-booking-intent={intent} aria-haspopup="dialog">{children}</a>;
}
