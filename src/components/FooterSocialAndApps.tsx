import { siteConfig } from '@/lib/seo';

export function FacebookIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function YouTubeIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export function TikTokIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 2.89 3.49 2.72 1.34-.04 2.54-.88 2.97-2.16.27-.75.3-1.57.28-2.36.03-4.99.01-9.98.02-14.97z" />
    </svg>
  );
}

export function InstagramIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function LinkedInIcon({ className = 'size-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

export function GooglePlayIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#00D3FF"
        d="M3.6 1.2c-.3.3-.5.8-.5 1.4v18.8c0 .6.2 1.1.5 1.4l.1.1 10.5-10.5v-.2L3.7 1.1l-.1.1z"
      />
      <path
        fill="#FFCE00"
        d="M17.7 15.9l-3.5-3.5v-.2l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.8 0 2.5l-4.3 2.2z"
      />
      <path
        fill="#FF334B"
        d="M14.2 12.2L3.6 22.8c.4.4 1.1.5 1.8.1l12.3-7-3.5-3.7z"
      />
      <path
        fill="#00E676"
        d="M14.2 11.8l3.5-3.5L5.4 1.3C4.7.9 4 1 3.6 1.4l10.6 10.4z"
      />
    </svg>
  );
}

export function AppStoreIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 170 170"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.85-11.93-14.42-6.19-9.5-11.05-20.2-14.59-32.09-3.54-11.89-5.31-23.01-5.31-33.37 0-14.57 3.54-26.69 10.61-36.35 7.08-9.66 16.21-14.67 27.4-15.03 4.8 0 10.14 1.25 16.03 3.75 5.88 2.5 9.77 3.75 11.66 3.75 1.52 0 5.48-1.27 11.89-3.82 6.4-2.55 11.96-3.75 16.68-3.6 12.3.98 22.04 5.76 29.21 14.34-10.87 6.64-16.19 15.77-15.96 27.39.22 9.14 3.69 16.86 10.42 23.16 6.74 6.3 14.68 9.87 23.82 10.72-2.17 6.3-4.94 13.04-8.31 20.22zm-28.81-105.51c0-6.96 2.5-13.26 7.5-18.9 5-5.65 11.09-9.13 18.26-10.44.22 1.3.33 2.39.33 3.26 0 6.85-2.66 13.37-7.98 19.57-5.33 6.19-11.41 9.68-18.26 10.44-.11-1.3-.17-2.61-.17-3.93z" />
    </svg>
  );
}

export function AppGalleryIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="24" height="24" rx="5" fill="#ED1C24" />
      <path
        fill="#FFFFFF"
        d="M12 4.8c-2.9 0-5.3 1.9-6.1 4.5h1.9c.7-1.6 2.3-2.7 4.2-2.7s3.5 1.1 4.2 2.7H18.1c-.8-2.6-3.2-4.5-6.1-4.5zm0 14.4c2.9 0 5.3-1.9 6.1-4.5h-1.9c-.7 1.6-2.3 2.7-4.2 2.7s-3.5-1.1-4.2-2.7H5.9c.8 2.6 3.2 4.5 6.1 4.5z"
      />
    </svg>
  );
}

const socialLinks = [
  {
    name: 'Facebook',
    href: siteConfig.socials.facebook,
    icon: FacebookIcon,
    hoverClass: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]',
  },
  {
    name: 'YouTube',
    href: siteConfig.socials.youtube,
    icon: YouTubeIcon,
    hoverClass: 'hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]',
  },
  {
    name: 'TikTok',
    href: siteConfig.socials.tiktok,
    icon: TikTokIcon,
    hoverClass: 'hover:bg-black hover:text-[#00f2fe] hover:border-[#00f2fe]',
  },
  {
    name: 'Instagram',
    href: siteConfig.socials.instagram,
    icon: InstagramIcon,
    hoverClass:
      'hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] hover:text-white hover:border-pink-500',
  },
  {
    name: 'LinkedIn',
    href: siteConfig.socials.linkedin,
    icon: LinkedInIcon,
    hoverClass: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]',
  },
];

export function SocialIconList({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {socialLinks.map((social) => {
        const IconComponent = social.icon;
        return (
          <a
            key={social.name}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit Malamal on ${social.name}`}
            className={`flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${social.hoverClass}`}
          >
            <IconComponent className="size-4" />
          </a>
        );
      })}
    </div>
  );
}

export function FooterAppDownloadAndSocial() {
  return (
    <div className="border-t border-white/15 py-8">
      <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
        {/* App Download Teaser & Store Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:justify-start">
          {/* Happy Shopping Teaser linking to Google Play */}
          <a
            href={siteConfig.apps.googlePlay}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Malamal Android App on Google Play"
            className="flex items-center gap-3 transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl border border-cyan-300/40 bg-gradient-to-br from-cyan-100 to-teal-100 p-2 shadow-sm">
              <svg className="size-full" viewBox="0 0 32 32" fill="none">
                <path
                  d="M10 9V7a6 6 0 0 1 12 0v2m-16 3h20l-1.5 14a3 3 0 0 1-3 2.7h-11a3 3 0 0 1-3-2.7L6 12z"
                  stroke="#f57224"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="16" cy="18" r="2" fill="#f57224" />
              </svg>
            </div>
            <div>
              <span className="block text-sm font-black tracking-tight text-[#f57224] sm:text-base">
                Happy Shopping
              </span>
              <span className="block text-xs font-bold text-white/95">
                Download App
              </span>
            </div>
          </a>

          {/* Store Download Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {/* Google Play */}
            <a
              href={siteConfig.apps.googlePlay}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Malamal Android App on Google Play"
              className="flex items-center gap-2.5 rounded-lg border border-white/20 bg-black/90 px-3.5 py-2 shadow-sm transition-all duration-200 hover:scale-[1.03] hover:border-white/50 hover:bg-black hover:shadow-md"
            >
              <GooglePlayIcon className="size-5 shrink-0" />
              <div className="text-left leading-none">
                <span className="block text-[8px] font-semibold tracking-wider text-white/70 uppercase">
                  ANDROID APP ON
                </span>
                <span className="mt-0.5 block text-xs font-bold tracking-wide text-white">
                  Google play
                </span>
              </div>
            </a>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <span className="text-xs font-bold tracking-wider text-white/90 uppercase">
            Follow Us:
          </span>
          <SocialIconList />
        </div>
      </div>
    </div>
  );
}

