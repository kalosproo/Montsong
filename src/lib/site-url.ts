/**
 * Public site URL helpers.
 *
 * `NEXT_PUBLIC_SITE_URL` is intentionally read here rather than from the
 * server-only environment module: Next.js may expose `NEXT_PUBLIC_*` values to
 * client bundles, whereas the rest of the application's configuration must
 * remain server-only.
 */
export const LOCAL_SITE_URL = 'http://localhost:3000';

export class SiteUrlConfigError extends Error {
  override name = 'SiteUrlConfigError';
}

function configurationError(): SiteUrlConfigError {
  return new SiteUrlConfigError(
    'NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) URL in production. ' +
      'Example: NEXT_PUBLIC_SITE_URL=https://example.com',
  );
}

/**
 * Return the validated public origin used for metadata, canonical URLs, and
 * the sitemap. Missing configuration is safe only outside production; a
 * production build must never silently publish localhost canonical URLs.
 */
export function siteOrigin(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configured) {
    if (process.env.NODE_ENV === 'production') throw configurationError();
    return new URL(LOCAL_SITE_URL);
  }

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw configurationError();
  }

  // An origin must be an HTTP(S) origin, not a relative, opaque, credentialed,
  // or path-prefixed URL. `origin` also removes a harmless trailing slash.
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.origin === 'null' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw configurationError();
  }

  return new URL(url.origin);
}

/** Build an absolute URL rooted at the validated public site origin. */
export function siteUrl(path = ''): string {
  const origin = siteOrigin();
  if (!path) return origin.origin;
  return new URL(path.startsWith('/') ? path : `/${path}`, origin).toString();
}
