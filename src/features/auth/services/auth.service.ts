import { api } from '@/shared/lib/api';
import { SignupPayload, VerifyOtpPayload, SigninPasswordPayload } from '@/features/auth/types/auth.types';

export const authService = {
  /** Step 1 — request OTP (signup flow) */
  signup: (payload: SignupPayload) =>
    api.post('/auth/signup', payload),

  /** Step 2 — verify OTP and complete signup */
  verifySignup: (payload: VerifyOtpPayload) =>
    api.post('/auth/verify-otp', payload),

  /** Sign in with password → returns accessToken */
  signinWithPassword: (payload: SigninPasswordPayload) =>
    api.post('/auth/signin', payload),

  /** Sign in step 1 — request OTP */
  requestSigninOtp: (mobile: string) =>
    api.post('/auth/signin/otp', { mobile }),

  /** Sign in step 2 — verify OTP */
  verifySigninOtp: (payload: VerifyOtpPayload) =>
    api.post('/auth/signin/verify-otp', payload),

  /** Refresh access token */
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),

  /** Sign out */
  signout: () =>
    api.post('/auth/signout'),
};
