'use server';

import { AuthError } from 'next-auth';

import { signIn } from '@/auth';

export type SignInState = {
  error: string;
};

function safeCallbackUrl(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string' || value.length === 0) return '/';
  return value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

export async function adminSignInAction(
  _previousState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const redirectTo = safeCallbackUrl(formData.get('callbackUrl'));

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Use the allowlisted email and current admin code.' };
    }
    throw error;
  }

  return { error: '' };
}
