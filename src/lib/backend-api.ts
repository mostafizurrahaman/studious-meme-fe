import { CATALOG_REVALIDATE_SECONDS } from '@/lib/isr';

type JsonRecord = Record<string, unknown>;

function getBackendApiBase(): string {
  return (process.env.NEXT_PUBLIC_BACKEND_FULL_URL as string).replace(
    /\/$/,
    '',
  );
}

function isJsonSerializableBody(body: unknown): body is JsonRecord {
  return (
    Boolean(body) &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    typeof body !== 'string'
  );
}

// function getErrorMessage(payload: unknown, fallback: string): string {
//     if (typeof payload === 'object' && payload !== null) {
//         const candidate = payload as BackendApiErrorPayload;

//         return candidate.message ?? candidate.error ?? fallback;
//     }

//     return fallback;
// }

async function readJsonSafely(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

interface BackendRequestOptions extends Omit<RequestInit, 'body' | 'headers'> {
  body?: RequestInit['body'] | JsonRecord | unknown[];
  headers?: HeadersInit;
  token?: string | null;
  baseUrl?: string;
  next?: NextFetchRequestConfig;
}

export async function requestBackendJson<T>(
  path: string,
  options: BackendRequestOptions = {},
): Promise<T> {
  const { body, headers, token, baseUrl, ...fetchOptions } = options;
  const method = String(fetchOptions.method ?? 'GET').toUpperCase();

  const requestHeaders = new Headers(headers);

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  if (isJsonSerializableBody(body) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const requestBody: BodyInit | undefined = isJsonSerializableBody(body)
    ? JSON.stringify(body)
    : typeof body === 'undefined' || body === null
      ? undefined
      : (body as BodyInit);

  const nextOptions =
    !token && method === 'GET' && !fetchOptions.cache
      ? {
          next: {
            revalidate:
              fetchOptions.next?.revalidate ?? CATALOG_REVALIDATE_SECONDS,
            tags: fetchOptions.next?.tags,
          },
        }
      : {};

  const cacheOptions =
    token && method === 'GET' && !fetchOptions.cache
      ? { cache: 'no-store' as const }
      : {};

  const response = await fetch(
    `${(baseUrl ?? getBackendApiBase()).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`,
    {
      ...fetchOptions,
      ...cacheOptions,
      ...nextOptions,
      headers: requestHeaders,
      body: requestBody,
    },
  );

  return (await readJsonSafely(response)) as T;
}
