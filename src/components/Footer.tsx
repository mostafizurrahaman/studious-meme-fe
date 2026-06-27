import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Container } from '@/components/Container';
import { contactChannels } from '@/lib/static-site-content';
import { siteConfig } from '@/lib/seo';
import type { Brand, Category } from '@/lib/storefront-types';

type Props = {
  categories: Category[];
  brands: Brand[];
};

export function Footer({ categories, brands }: Props) {
  return (
    <footer className="mt-auto border-t border-border bg-secondary text-secondary-foreground">
      <Container>
        <div className="grid gap-10 py-12 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h3 className="text-sm font-bold tracking-wide">
              Registered Office
            </h3>
            <p className="mt-3 text-sm leading-6 text-secondary-foreground/80">
              {siteConfig.address}
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a
                className="block text-secondary-foreground/90 hover:text-secondary-foreground"
                href={`mailto:${siteConfig.supportEmail}`}
              >
                {siteConfig.supportEmail}
              </a>
              <a
                className="block text-secondary-foreground/90 hover:text-secondary-foreground"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              <a
                className="block text-secondary-foreground/90 hover:text-secondary-foreground"
                href={`tel:${siteConfig.phone.replace(/\s+/g, '')}`}
              >
                Hotline: {siteConfig.phone} (10am to 7pm)
              </a>
              <a
                className="block text-secondary-foreground/90 hover:text-secondary-foreground"
                href="tel:+8801972525821"
              >
                B2B Sales & WhatsApp Number: +8801972525821
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide">Store Sitemap</h3>
            <div className="mt-4 grid gap-2 text-sm text-secondary-foreground/90">
              <Link className="hover:text-secondary-foreground" href="/shop">
                Shop
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/promotions"
              >
                Promotions
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/main-categories"
              >
                Main Categories
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/shop-by-brands"
              >
                Shop By Brands
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/quotation-request"
              >
                Quotation Request
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/our-contacts"
              >
                Our Contacts
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/about-us"
              >
                About Us
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/my-account"
              >
                My Account
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/wishlist"
              >
                My Wishlist
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/privacy-policy"
              >
                Privacy Policy
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/terms-and-conditions"
              >
                Terms & Conditions
              </Link>
              <Link
                className="hover:text-secondary-foreground"
                href="/return-policy"
              >
                Return Policy
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide">Categories</h3>
            <div className="mt-4 grid gap-2 text-sm text-secondary-foreground/90">
              {categories.slice(5, 25).map((category) => (
                <Link
                  key={category.name}
                  className="hover:text-secondary-foreground"
                  href={category.href}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide">Contact</h3>
            <div className="mt-4 grid gap-2 text-sm text-secondary-foreground/90">
              {contactChannels.map((channel) => (
                <a
                  key={channel.label}
                  className="hover:text-secondary-foreground"
                  href={channel.href}
                >
                  {channel.label}: {channel.value}
                </a>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold text-secondary-foreground/80">
              {brands.slice(10, 30).map((brand) => (
                <Link
                  key={brand.name}
                  href={brand.href}
                  className="rounded-2xl bg-white/10 px-3 py-2 text-center transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white/15 hover:shadow-sm hover:ring-1 hover:ring-white/15"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Separator className="bg-white/15" />
        <div className="py-6 text-xs text-secondary-foreground/70">
          © {new Date().getFullYear()} {siteConfig.name}
        </div>
      </Container>
    </footer>
  );
}
