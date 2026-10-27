import { BOOKING_URL } from '../lib/booking';

export default function BookingLink({ children, ...props }) {
  return <a {...props} href={BOOKING_URL} data-booking-link="">{children}</a>;
}
