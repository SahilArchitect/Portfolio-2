'use server';

import { submitInquiry } from '@/lib/api';

export type InquiryFormState = {
  ok: boolean;
  message: string;
};

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function submitInquiryAction(
  _previousState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const name = readString(formData, 'name');
  const email = readString(formData, 'email');
  const company = readString(formData, 'company');
  const intent = readString(formData, 'intent') || 'other';
  const message = readString(formData, 'message');

  if (!name || !email || !message) {
    return { ok: false, message: 'Name, email, and message are required.' };
  }

  if (!email.includes('@')) {
    return { ok: false, message: 'Use a valid email address.' };
  }

  try {
    await submitInquiry({ name, email, company: company || undefined, intent, message });
    return { ok: true, message: 'Inquiry received. The backend will score and triage it.' };
  } catch {
    return {
      ok: false,
      message: 'The API is not accepting inquiries right now. Use the email shortcut instead.',
    };
  }
}
