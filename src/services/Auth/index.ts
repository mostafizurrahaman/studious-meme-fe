'use server';

import { cookies } from 'next/headers';
import type { FieldValues } from 'react-hook-form';
import { requestBackendJson } from '@/lib/backend-api';
import { getValidAccessTokenForServerActions } from '@/lib/getValidAccessToken';
import type { AuthUser } from '@/types';
import { decodeAuthToken } from '@/lib/auth/session';

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
};

type ForgotPasswordToken = {
  token: string;
};

type ResetPasswordToken = {
  resetPasswordToken: string;
};

type SignupOtpResponse = {
  userEmail?: string;
};

async function getCookieStore() {
  return cookies();
}

async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await getCookieStore();

  cookieStore.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  if (tokens.refreshToken) {
    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }
}

async function clearAuthCookies() {
  const cookieStore = await getCookieStore();

  cookieStore.set('accessToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  cookieStore.set('refreshToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

async function setPasswordFlowCookies(token: string) {
  const cookieStore = await getCookieStore();

  cookieStore.set('forgotPassToken', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

// signInUser
export const signInUser = async (
  userData: FieldValues,
): Promise<BackendEnvelope<AuthTokens>> => {
  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/signin',
    {
      method: 'POST',
      body: userData as Record<string, unknown>,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};

export const signUpUser = async (userData: {
  name: string;
  email: string;
  password: string;
}): Promise<BackendEnvelope<SignupOtpResponse>> => {
  return requestBackendJson<BackendEnvelope<SignupOtpResponse>>(
    '/user/signup',
    {
      method: 'POST',
      body: userData,
    },
  );
};

export const verifySignupOtp = async (payload: {
  userEmail: string;
  otp: string;
}): Promise<BackendEnvelope<AuthTokens>> => {
  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/verify-signup-otp',
    {
      method: 'POST',
      body: payload,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};

export const sendSignupOtpAgain = async (
  userEmail: string,
): Promise<BackendEnvelope<SignupOtpResponse>> => {
  return requestBackendJson<BackendEnvelope<SignupOtpResponse>>(
    '/user/send-signup-otp-again',
    {
      method: 'POST',
      body: { userEmail },
    },
  );
};

// updateProfilePhoto
export const updateProfilePhoto = async (
  data: FormData,
): Promise<BackendEnvelope<AuthTokens>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/update-profile-photo',
    {
      method: 'PUT',
      body: data,
      token: accessToken ?? undefined,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};

// updateProfileData
export const updateProfileData = async (
  data: FieldValues,
): Promise<BackendEnvelope<AuthTokens>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/update-profile-data',
    {
      method: 'PATCH',
      body: data as Record<string, unknown>,
      token: accessToken ?? undefined,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};

/*
export const fetchProfile = async (): Promise<BackendEnvelope<AuthUser>> => {
    const accessToken = await getValidAccessTokenForServerActions();
    return requestBackendJson<BackendEnvelope<AuthUser>>('/user/profile', {
        method: 'GET',
        token: accessToken ?? undefined,
    });
};
*/

// changePassword
export const changePassword = async (data: {
  oldPassword: string;
  newPassword: string;
}): Promise<BackendEnvelope<AuthTokens>> => {
  const accessToken = await getValidAccessTokenForServerActions();

  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/change-password',
    {
      method: 'PATCH',
      body: data,
      token: accessToken ?? undefined,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};

// forgotPassword
export const forgotPassword = async (
  email: string,
): Promise<BackendEnvelope<ForgotPasswordToken>> => {
  const result = await requestBackendJson<BackendEnvelope<ForgotPasswordToken>>(
    '/user/forgot-password',
    {
      method: 'POST',
      body: { email },
    },
  );

  if (result?.success && result.data?.token) {
    await setPasswordFlowCookies(result.data.token);
  }

  return result;
};

// sendForgotPasswordOtpAgain
export const sendForgotPasswordOtpAgain = async (): Promise<
  BackendEnvelope<unknown>
> => {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get('forgotPassToken')?.value;

  return requestBackendJson<BackendEnvelope<unknown>>(
    '/user/send-forgot-password-otp-again',
    {
      method: 'POST',
      body: { token },
    },
  );
};

// verifyOtpForForgotPassword
export const verifyOtpForForgotPassword = async (
  otp: string,
): Promise<BackendEnvelope<ResetPasswordToken>> => {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get('forgotPassToken')?.value;

  const result = await requestBackendJson<BackendEnvelope<ResetPasswordToken>>(
    '/user/verify-forgot-password-otp',
    {
      method: 'POST',
      body: { token, otp },
    },
  );

  if (result?.success && result.data?.resetPasswordToken) {
    cookieStore.set('resetPasswordToken', result.data.resetPasswordToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return result;
};

// setNewPasswordIntoDB
export const setNewPasswordIntoDB = async (
  newPassword: string,
): Promise<BackendEnvelope<unknown>> => {
  const cookieStore = await getCookieStore();
  const resetPasswordToken = cookieStore.get('resetPasswordToken')?.value;

  const result = await requestBackendJson<BackendEnvelope<unknown>>(
    '/user/reset-password',
    {
      method: 'POST',
      body: { resetPasswordToken, newPassword },
    },
  );

  if (result?.success) {
    cookieStore.delete('forgotPassToken');
    cookieStore.delete('resetPasswordToken');
  }

  return result;
};

// getCurrentUser
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const accessToken = await getValidAccessTokenForServerActions();
  return decodeAuthToken(accessToken);
};

// logOut
export const logOut = async (): Promise<void> => {
  await clearAuthCookies();
};

// getNewAccessToken
export const getNewAccessToken = async (
  refreshToken: string,
): Promise<BackendEnvelope<AuthTokens>> => {
  const result = await requestBackendJson<BackendEnvelope<AuthTokens>>(
    '/user/access-token',
    {
      method: 'GET',
      token: refreshToken,
    },
  );

  if (result?.success && result.data?.accessToken) {
    await setAuthCookies(result.data);
  }

  return result;
};
