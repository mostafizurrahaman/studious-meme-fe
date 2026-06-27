import { describe, expect, it } from 'vitest';

import {
  decodeAuthToken,
  getAuthTokenFromRequest,
  getAuthUserFromRequest,
} from './session';

function buildToken(payload: Record<string, unknown>): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${encoded}.signature`;
}

describe('auth session helpers', () => {
  it('decodes a valid auth token into a user', () => {
    const token = buildToken({
      _id: 'user-1',
      name: 'Amina',
      email: 'amina@example.com',
      image: 'https://example.com/avatar.png',
      role: 'admin',
      phone: '+8801000000000',
      dob: '1998-01-01',
    });

    expect(decodeAuthToken(token)).toEqual({
      _id: 'user-1',
      name: 'Amina',
      email: 'amina@example.com',
      image: 'https://example.com/avatar.png',
      role: 'ADMIN',
      phone: '+8801000000000',
      dob: '1998-01-01',
    });
  });

  it('rejects expired or incomplete tokens', () => {
    const expiredToken = buildToken({
      _id: 'user-2',
      name: 'Expired',
      email: 'expired@example.com',
      role: 'USER',
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const incompleteToken = buildToken({
      email: 'missing@example.com',
      role: 'ADMIN',
    });

    expect(decodeAuthToken(expiredToken)).toBeNull();
    expect(decodeAuthToken(incompleteToken)).toBeNull();
    expect(decodeAuthToken('not-a-token')).toBeNull();
    expect(decodeAuthToken(null)).toBeNull();
  });

  it('reads the access token from request cookies', () => {
    const request = {
      cookies: {
        get: (name: string) =>
          name === 'accessToken' ? { value: 'abc123' } : undefined,
      },
    } satisfies Parameters<typeof getAuthTokenFromRequest>[0];

    expect(getAuthTokenFromRequest(request)).toBe('abc123');
  });

  it('reads the user from request cookies when the token is valid', () => {
    const token = buildToken({
      _id: 'user-3',
      name: 'Rafi',
      email: 'rafi@example.com',
      role: 'SUPER_ADMIN',
    });

    const request = {
      cookies: {
        get: (name: string) =>
          name === 'accessToken' ? { value: token } : undefined,
      },
    } satisfies Parameters<typeof getAuthTokenFromRequest>[0];

    expect(getAuthUserFromRequest(request)).toEqual({
      _id: 'user-3',
      name: 'Rafi',
      email: 'rafi@example.com',
      image: '',
      role: 'SUPER_ADMIN',
    });
  });
});
