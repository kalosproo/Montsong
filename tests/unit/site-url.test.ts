import { afterEach, describe, expect, it, vi } from 'vitest';

import { LOCAL_SITE_URL, siteOrigin, siteUrl } from '@/lib/site-url';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('site URL configuration', () => {
  it('normalizes a valid origin and builds absolute URLs', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://montsong.example/');

    expect(siteOrigin().origin).toBe('https://montsong.example');
    expect(siteUrl()).toBe('https://montsong.example');
    expect(siteUrl('/song/test')).toBe('https://montsong.example/song/test');
  });

  it('uses localhost only when the URL is absent outside production', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');

    expect(siteUrl()).toBe(LOCAL_SITE_URL);
  });

  it.each(['montsong.example', '/', '/home', 'https://montsong.example/path'])
  ('rejects an invalid public origin: %s', (value) => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', value);

    expect(siteOrigin).toThrow(/NEXT_PUBLIC_SITE_URL must be an absolute HTTP\(S\) URL in production/);
  });

  it('requires a public origin in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', '');

    expect(siteOrigin).toThrow(/NEXT_PUBLIC_SITE_URL must be an absolute HTTP\(S\) URL in production/);
  });
});
