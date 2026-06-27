import { siteConfig } from '@/lib/seo';

export function GoogleSearchConsole() {
  const verification = siteConfig.googleVerification;

  if (!verification) {
    return null;
  }

  return <meta name="google-site-verification" content={verification} />;
}
