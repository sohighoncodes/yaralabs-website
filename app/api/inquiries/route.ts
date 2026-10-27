import { handleInquiry } from '../../../lib/inquiries';

export async function POST(request: Request) {
  return handleInquiry(request);
}
