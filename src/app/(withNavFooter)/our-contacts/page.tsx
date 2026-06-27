import { SeoScripts } from '@/components/SeoScripts';
import { Card } from '@/components/ui/card';
import { contactChannels } from '@/lib/static-site-content';
import { siteConfig } from '@/lib/seo';
import { ourContactsMetadata, ourContactsSchemas } from '@/lib/seo';
export const metadata = ourContactsMetadata;

export default function OurContactsPage() {
  return (
    <>
      <SeoScripts data={ourContactsSchemas} />
      <main className="flex-1 bg-background pb-16">
        <div className="px-4 py-6 lg:px-6">
          <Card className="p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              Get in touch
            </p>
            <h1 className="mt-4 text-3xl font-black text-secondary sm:text-4xl">
              Our Contacts
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-foreground/65 sm:text-base">
              Contact details, office information and support channels are laid
              out for the storefront.
            </p>
          </Card>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {contactChannels.map((channel) => (
              <Card key={channel.label} className="p-5 shadow-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  {channel.label}
                </div>
                <div className="mt-3 text-lg font-black text-secondary">
                  {channel.value}
                </div>
              </Card>
            ))}
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-0 bg-secondary p-6 text-secondary-foreground shadow-sm">
              <h2 className="text-2xl font-black">Office</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-secondary-foreground/78">
                {siteConfig.address}
              </p>
              <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-secondary-foreground/82">
                B2B support, quotation follow-up and direct sales assistance are
                handled here.
              </div>
            </Card>
            <Card className="p-6 shadow-sm">
              <h2 className="text-2xl font-black text-secondary">
                Support hours
              </h2>
              <div className="mt-4 space-y-3 text-sm text-foreground/65">
                <div className="flex justify-between gap-4">
                  <span>Sunday - Thursday</span>
                  <span>10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Friday</span>
                  <span>Closed</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Saturday</span>
                  <span>10:00 AM - 5:00 PM</span>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
