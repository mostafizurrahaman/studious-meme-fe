'use server';

import { jwtDecode } from 'jwt-decode';
import { cookies } from 'next/headers';
import { requestBackendJson } from '@/lib/backend-api';

type TokenPayload = {
  exp?: number;
};

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
};

type RefreshResponse = BackendEnvelope<{
  accessToken?: string;
  refreshToken?: string;
}>;

const refreshInFlight = new Map<string, Promise<string | null>>();

const getTokenExpiryMs = (token: string): number | null => {
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();
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
};

export const isTokenExpired = async (token: string): Promise<boolean> => {
  const expiryMs = getTokenExpiryMs(token);
  return !expiryMs || expiryMs <= Date.now();
};

async function refreshAccessToken(
  refreshToken: string,
  writeCookie: boolean,
): Promise<string | null> {
  const inflight = refreshInFlight.get(refreshToken);

  if (inflight) {
    return inflight;
  }

  const promise = (async () => {
    try {
      const result = await requestBackendJson<RefreshResponse>(
        '/user/access-token',
        {
          method: 'GET',
          token: refreshToken,
        },
      );

      const accessToken = result?.data?.accessToken ?? null;

      if (!accessToken) {
        if (writeCookie) {
          await clearAuthCookies();
        }
        return null;
      }

      if (writeCookie) {
        const cookieStore = await cookies();
        cookieStore.set('accessToken', accessToken, { path: '/' });
      }

      return accessToken;
    } catch {
      if (writeCookie) {
        await clearAuthCookies();
      }
      return null;
    }
  })();

  refreshInFlight.set(refreshToken, promise);

  try {
    return await promise;
  } finally {
    refreshInFlight.delete(refreshToken);
  }
}

async function resolveAccessToken(
  writeCookie: boolean,
): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value ?? null;
  const refreshToken = cookieStore.get('refreshToken')?.value ?? null;

  if (!accessToken) {
    if (!refreshToken) {
      return null;
    }

    const refreshed = await refreshAccessToken(refreshToken, writeCookie);

    if (!refreshed) {
      if (writeCookie) {
        await clearAuthCookies();
      }
      return null;
    }

    return refreshed;
  }

  if (await isTokenExpired(accessToken)) {
    if (!refreshToken) {
      return null;
    }

    const refreshed = await refreshAccessToken(refreshToken, writeCookie);

    if (!refreshed) {
      if (writeCookie) {
        await clearAuthCookies();
      }
      return null;
    }

    return refreshed;
  }

  return accessToken;
}

// getValidAccessTokenForServerActions
export const getValidAccessTokenForServerActions = async (): Promise<
  string | null
> => {
  const accessToken = await resolveAccessToken(true);

  if (!accessToken) {
    return null;
  }

  return accessToken;
};

// getValidAccessTokenForServerHandlerGet
export const getValidAccessTokenForServerHandlerGet = async (): Promise<
  string | null
> => {
  return resolveAccessToken(false);
};
