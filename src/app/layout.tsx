import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import './spinner.css';
import { SeoScripts } from '@/components/SeoScripts';
import { FacebookPixel } from '@/components/FacebookPixel';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { GoogleTagManager } from '@/components/GoogleTagManager';
import { NetworkStatusGate } from '@/components/NetworkStatusGate';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
// import { NoticePopup } from '@/components/NoticePopup';
import { siteMetadata, siteSchemas } from '@/lib/seo';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import UserProvider from '@/context/UserContext';
import { MicrosoftClarity } from '@/components/MicrosoftClarity';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      data-scroll-behavior="smooth"
      className={cn(
        'h-full',
        'antialiased',
        poppins.variable,
        'font-sans',
        inter.variable,
      )}
    >
      {process.env.NODE_ENV === 'production' && <MicrosoftClarity />}
      <body className="storefront-layout min-h-full flex flex-col bg-background text-foreground">
        <GoogleAnalytics />
        <GoogleTagManager />

        <SeoScripts data={siteSchemas} />
        <FacebookPixel />

        <UserProvider>
          <ServiceWorkerRegistration />
          <Toaster
            richColors
            //   position="top-center"
            toastOptions={{
              style: {
                // background: "#2ecc71",
                border: 'none',
              },
            }}
          />

          {children}
          <NetworkStatusGate />
          {/* <NoticePopup /> */}
        </UserProvider>
      </body>
    </html>
  );
}
