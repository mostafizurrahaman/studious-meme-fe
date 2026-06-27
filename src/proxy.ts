import { NextResponse, type NextRequest } from 'next/server';
import { decodeAuthToken } from '@/lib/auth/session';
import { getSafeRedirectPath } from '@/lib/auth/redirect';
import {
  getDashboardPathByRole,
  isAllowedDashboardPath,
} from '@/lib/auth/roles';

const BACKEND_FULL_URL =
  process.env.NEXT_PUBLIC_BACKEND_FULL_URL?.replace(/\/$/, '') ?? '';

function setAccessCookie(response: NextResponse, accessToken: string) {
  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
}

function clearAuthCookies(response: NextResponse) {
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

async function refreshAccessToken(
  request: NextRequest,
): Promise<string | null> {
  const refreshToken = request.cookies.get('refreshToken')?.value;

  if (!refreshToken || !BACKEND_FULL_URL) {
    return null;
  }

  const response = await fetch(`${BACKEND_FULL_URL}/user/access-token`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as {
    data?: { accessToken?: string };
  } | null;

  return payload?.data?.accessToken ?? null;
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const currentAccessToken = request.cookies.get('accessToken')?.value ?? null;
  const currentRefreshToken =
    request.cookies.get('refreshToken')?.value ?? null;
  let session = decodeAuthToken(currentAccessToken);
  let refreshedAccessToken: string | null = null;
  const safeRedirect = getSafeRedirectPath(searchParams.get('redirect'));

  if (!session) {
    const accessToken = await refreshAccessToken(request);

    if (accessToken) {
      refreshedAccessToken = accessToken;
      session = decodeAuthToken(accessToken);
    }
  }

  const buildResponse = (
    kind: 'next' | 'redirect',
    targetPath?: string,
    clearCookies = false,
  ) => {
    const response =
      kind === 'redirect' && targetPath
        ? NextResponse.redirect(new URL(targetPath, request.url))
        : NextResponse.next();

    if (refreshedAccessToken) {
      setAccessCookie(response, refreshedAccessToken);
    }

    if (clearCookies) {
      clearAuthCookies(response);
    }

    return response;
  };

  if (!session) {
    if (currentRefreshToken) {
      return buildResponse(
        'redirect',
        safeRedirect ? `/my-account?redirect=${safeRedirect}` : '/my-account',
        true,
      );
    }

    if (pathname === '/my-account') {
      return buildResponse('next');
    }

    return buildResponse(
      'redirect',
      safeRedirect ? `/my-account?redirect=${safeRedirect}` : '/my-account',
    );
  }

  if (pathname === '/my-account' || pathname.startsWith('/my-account/')) {
    if (safeRedirect) {
      return buildResponse('redirect', safeRedirect);
    }

    if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
      return buildResponse(
        'redirect',
        getDashboardPathByRole(session.role) ?? '/',
      );
    }

    return buildResponse('redirect', '/');
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    if (pathname === '/dashboard') {
      return buildResponse(
        'redirect',
        getDashboardPathByRole(session.role) ?? '/dashboard',
      );
    }

    if (!isAllowedDashboardPath(session.role, pathname)) {
      return buildResponse(
        'redirect',
        getDashboardPathByRole(session.role) ?? '/dashboard',
      );
    }
  }

  return buildResponse('next');
}

export const config = {
  matcher: ['/dashboard/:path*', '/my-account/:path*'],
};
