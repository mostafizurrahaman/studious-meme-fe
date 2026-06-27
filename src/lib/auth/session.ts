import { jwtDecode } from 'jwt-decode';
import { z } from 'zod';
import type { AuthUser } from '@/types';
import { normalizeRole } from './roles';

const authTokenPayloadSchema = z
  .object({
    _id: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    dob: z.union([z.string(), z.date(), z.null()]).optional(),
    image: z.string().optional(),
    role: z.string().optional(),
    exp: z.number().optional(),
  })
  .passthrough();

type AuthTokenPayload = z.infer<typeof authTokenPayloadSchema>;

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

function toAuthUser(payload: AuthTokenPayload): AuthUser | null {
  const role = normalizeRole(payload.role);
  const id = payload._id ?? payload.id;

  if (!id || !role || !payload.name || !payload.email) {
    return null;
  }

  return {
    _id: id,
    name: payload.name,
    email: payload.email,
    image: payload.image ?? '',
    role,
    phone: payload.phone,
    dob: typeof payload.dob === 'string' ? payload.dob : undefined,
  };
}

export function decodeAuthToken(
  token: string | null | undefined,
): AuthUser | null {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<unknown>(token);
    const parsed = authTokenPayloadSchema.safeParse(decoded);

    if (!parsed.success) {
      return null;
    }

    if (parsed.data.exp && parsed.data.exp * 1000 < Date.now()) {
      return null;
    }

    return toAuthUser(parsed.data);
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: {
  cookies: CookieStoreLike;
}): string | null {
  return request.cookies.get('accessToken')?.value ?? null;
}

export function getAuthUserFromRequest(request: {
  cookies: CookieStoreLike;
}): AuthUser | null {
  return decodeAuthToken(getAuthTokenFromRequest(request));
}
