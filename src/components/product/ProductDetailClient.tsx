'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  MessageCircle,
  Minus,
  PackageCheck,
  Play,
  Plus,
  Send,
  Share,
  Star,
  Truck,
} from 'lucide-react';
import PaymentOptionSvg from '@/assets/Payment-Option.svg';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddToCompareButton } from '@/components/compare/AddToCompareButton';
import { AddToWishlistButton } from '@/components/wishlist/AddToWishlistButton';
import { useCartStore } from '@/lib/cart-store';
import { formatMoney, formatPriceLabelWithUnit } from '@/lib/cart';
import { cn } from '@/lib/utils';
import { getProductPrimaryImage, type Product } from '@/lib/storefront-types';
import { isOutOfStockLabel } from '@/lib/stock';
import { addCartItem } from '@/services/Cart';

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.77 7.46H14.5v-1.42c0-.66.1-1 1.15-1h3v-3.97H11.3c-1.45 0-1.77.86-1.77 1.77V8.5H8.15v3.5h3v8.15h3.5v-8.15h2.75l.27-3.54z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.621 4.267 6.03v6.711zM5.337 7.433c-1.144 0-2.064-.926-2.064-2.084 0-1.16.92-2.084 2.064-2.084 1.14 0 2.063.924 2.063 2.084 0 1.158-.922 2.084-2.063 2.084zm1.602 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.752v20.495C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.752C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function PinterestIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={className}
    >
      <text
        x="12"
        y="19"
        textAnchor="middle"
        fontSize="26"
        fontWeight="bold"
        fill="#6b7280"
      >
        P
      </text>
    </svg>
  );
}

type ProductDetailClientProps = {
  product: Product;
  reviewSummary?: {
    total: number;
    averageRating: number;
  };
};

const WHATSAPP_URL = 'https://wa.me/8801972525821';
const HERO_IMAGE_QUALITY = 90;
const sharePlatforms = [
  {
    name: 'Facebook',
    Icon: FacebookIcon,
    buildHref: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  },
  {
    name: 'X',
    Icon: TwitterIcon,
    buildHref: (url: string) => `https://x.com/share?url=${url}`,
  },
  {
    name: 'Pinterest',
    Icon: PinterestIcon,
    buildHref: (url: string, media: string, title: string) =>
      `https://pinterest.com/pin/create/button/?url=${url}&media=${media}&description=${encodeURIComponent(title)}`,
  },
  {
    name: 'LinkedIn',
    Icon: LinkedinIcon,
    buildHref: (url: string) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}`,
  },
  {
    name: 'WhatsApp',
    Icon: MessageCircle,
    buildHref: (url: string) =>
      `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
  },
  {
    name: 'Telegram',
    Icon: Send,
    buildHref: (url: string) => `https://telegram.me/share/url?url=${url}`,
  },
] as const;

function sanitizeProductHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\shref=["']javascript:[^"']*["']/gi, '');
}

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

type GalleryMedia =
  | {
      type: 'image';
      src: string;
      thumb: string;
      alt: string;
    }
  | {
      type: 'video';
      src: string;
      thumb: string;
      alt: string;
    };

function resolveYouTubeVideoId(product: Product) {
  if (product.youtubeVideoId?.trim()) {
    return product.youtubeVideoId.trim();
  }

  const url = product.youtubeVideoUrl?.trim();
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    const pathname = parsed.pathname.replace(/\/+$/, '');

    if (hostname === 'youtu.be') {
      const id = pathname.split('/').filter(Boolean)[0] ?? '';
      return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : '';
    }

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      if (pathname === '/watch') {
        const id = parsed.searchParams.get('v') ?? '';
        return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : '';
      }

      if (pathname.startsWith('/embed/')) {
        const id = pathname.split('/').filter(Boolean)[1] ?? '';
        return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : '';
      }

      if (pathname.startsWith('/shorts/')) {
        const id = pathname.split('/').filter(Boolean)[1] ?? '';
        return YOUTUBE_VIDEO_ID_PATTERN.test(id) ? id : '';
      }
    }
  } catch {
    return '';
  }

  return '';
}

export function ProductDetailClient({
  product,
  reviewSummary,
}: ProductDetailClientProps) {
  const router = useRouter();
  const addProductQuantity = useCartStore((state) => state.addProductQuantity);
  const markItemAsSynced = useCartStore((state) => state.markItemAsSynced);
  const handleScrollToReviews = () => {
    const target = document.getElementById('product-reviews');

    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const images = useMemo(
    () =>
      product.images.length > 0
        ? product.images
        : [getProductPrimaryImage(product)],
    [product],
  );
  const youtubeVideoId = resolveYouTubeVideoId(product);
  const galleryItems = useMemo<GalleryMedia[]>(() => {
    const baseItems = images.map((image, index) => ({
      type: 'image' as const,
      src: image,
      thumb: image,
      alt: `${product.title} image ${index + 1}`,
    }));

    if (!youtubeVideoId) return baseItems;

    return [
      ...baseItems,
      {
        type: 'video' as const,
        src: `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`,
        thumb: `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        alt: `${product.title} video`,
      },
    ];
  }, [images, product.title, youtubeVideoId]);
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);
  const [zoomState, setZoomState] = useState({
    mediaKey: '',
    position: '50% 50%',
    isZooming: false,
  });
  const [quantity, setQuantity] = useState(1);
  const description = sanitizeProductHtml(product.description?.trim() ?? '');
  const features = sanitizeProductHtml(product.features?.trim() ?? '');
  const productUrl = `https://malamal.com.bd/product/${product.slug}/`;
  const whatsappOrderUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hello, I want to order this product:\n\nProduct: ${product.title}\nLink: ${productUrl}`,
  )}`;
  const encodedProductUrl = encodeURIComponent(productUrl);
  const primaryImage = getProductPrimaryImage(product);
  const outOfStock = isOutOfStockLabel(product.stock);
  const shareMedia = primaryImage.startsWith('http')
    ? primaryImage
    : `https://malamal.com.bd${primaryImage}`;

  const selectedMediaStillExists = selectedMedia
    ? galleryItems.some(
        (item) =>
          item.src === selectedMedia.src && item.type === selectedMedia.type,
      )
    : false;
  const activeMedia = selectedMediaStillExists
    ? selectedMedia
    : (galleryItems[0] ?? null);
  const activeMediaKey = activeMedia
    ? `${activeMedia.type}:${activeMedia.src}`
    : '';
  const isZooming =
    zoomState.mediaKey === activeMediaKey ? zoomState.isZooming : false;
  const zoomPosition =
    zoomState.mediaKey === activeMediaKey ? zoomState.position : '50% 50%';

  function handleZoomMove(event: React.MouseEvent<HTMLDivElement>) {
    if (activeMedia?.type !== 'image') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomState({
      mediaKey: activeMediaKey,
      position: `${x}% ${y}%`,
      isZooming: true,
    });
  }

  function resetZoom(media: GalleryMedia | null = activeMedia) {
    const mediaKey = media ? `${media.type}:${media.src}` : '';
    setZoomState({ mediaKey, position: '50% 50%', isZooming: false });
  }

  function addQuantityToCart(redirect = false) {
    if (outOfStock) {
      return;
    }

    addProductQuantity(product, quantity);
    toast.success('Added to cart.', {
      description:
        quantity > 1 ? `${quantity} x ${product.title}` : product.title,
    });
    if (product.id) {
      void addCartItem(product.id, quantity)
        .then((result) => {
          if (result?.success) {
            markItemAsSynced(product.id);
          }
        })
        .catch(() => null);
    }
    if (redirect) router.push('/checkout');
  }

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:grid-cols-[620px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div
            className={cn(
              'grid gap-3',
              galleryItems.length > 1
                ? 'sm:grid-cols-[86px_minmax(0,1fr)]'
                : '',
            )}
          >
            {galleryItems.length > 1 ? (
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
                {galleryItems.map((item, index) => (
                  <button
                    key={`${item.type}-${item.src}-${index}`}
                    type="button"
                    onClick={() => {
                      setSelectedMedia(item);
                      resetZoom(item);
                    }}
                    className={cn(
                      'relative size-18 shrink-0 overflow-hidden rounded-lg sm:size-20',
                      activeMedia?.src === item.src &&
                        activeMedia.type === item.type &&
                        'ring-2 ring-primary/20',
                    )}
                  >
                    <Image
                      src={item.thumb}
                      alt={item.alt}
                      fill
                      sizes="80px"
                      className="object-cover rounded-lg"
                    />
                    {item.type === 'video' ? (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                        <span className="flex size-7 items-center justify-center rounded-full bg-black/65">
                          <Play className="size-3.5 fill-white text-white" />
                        </span>
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="order-1 sm:order-2">
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-lg lg:aspect-[1.05/1]"
                onMouseMove={handleZoomMove}
                onMouseEnter={() =>
                  setZoomState((current) => ({
                    mediaKey: activeMediaKey,
                    position:
                      current.mediaKey === activeMediaKey
                        ? current.position
                        : '50% 50%',
                    isZooming: true,
                  }))
                }
                onMouseLeave={() => resetZoom()}
              >
                {activeMedia?.type === 'video' ? (
                  <iframe
                    className="absolute inset-0 h-full w-full rounded-lg"
                    src={activeMedia.src}
                    title={activeMedia.alt}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : activeMedia?.src ? (
                  <>
                    <Image
                      src={activeMedia.src}
                      alt={product.title}
                      fill
                      priority
                      quality={HERO_IMAGE_QUALITY}
                      sizes="(max-width: 1024px) 100vw, 620px"
                      className={cn(
                        'object-contain transition-opacity rounded-lg',
                        isZooming ? 'opacity-0' : 'opacity-100',
                      )}
                    />
                    <div
                      className={cn(
                        'absolute inset-0 overflow-hidden rounded-lg bg-no-repeat transition-opacity',
                        isZooming ? 'opacity-100' : 'opacity-0',
                      )}
                      style={{
                        backgroundImage: `url(${activeMedia.src})`,
                        backgroundSize: '190%',
                        backgroundPosition: zoomPosition,
                      }}
                    />
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <Card className="hidden overflow-hidden border-0 bg-secondary p-1 text-secondary-foreground shadow-sm lg:block">
            <div className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-4">
              <div className="space-y-2">
                <div className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
                  Bulk pricing
                </div>
                <h2 className="text-lg font-extrabold leading-tight sm:text-xl">
                  Need a quotation?
                </h2>
                <p className="text-sm leading-6 text-secondary-foreground/78">
                  Share your quantity and delivery location for project or
                  retail orders.
                </p>
              </div>
              <Button
                asChild
                className="h-10 rounded-full bg-white px-5 text-sm font-bold text-black! hover:text-primary! hover:bg-white/90"
              >
                <Link href="/quotation-request">Request quotation</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/10 px-3 py-4 text-xs font-medium text-secondary-foreground/90 sm:px-4">
              <span className="rounded-full bg-white/10 px-3 py-1">
                Bulk order support
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Corporate procurement
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1">
                Delivery coordination
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-medium leading-tight text-secondary sm:text-2xl lg:text-[28px]">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>
              <span className="font-bold">SKU: </span>
              {product.sku}
            </div>
            <div>
              <span className="font-bold">Brand: </span>
              {product.brand}
            </div>
            <div>
              <span className="font-bold">Category: </span>
              {product.category}
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-end gap-2">
              {product.oldPrice ? (
                <span className="text-lg font-semibold text-muted-foreground line-through">
                  {formatMoney(Number(product.oldPrice))}
                </span>
              ) : null}
              <span className="text-2xl font-black text-primary sm:text-3xl">
                {formatPriceLabelWithUnit(product.price, product.sellingUnit)}
              </span>
            </div>

            {reviewSummary ? (
              <button
                type="button"
                onClick={handleScrollToReviews}
                className="inline-flex w-fit items-center gap-2 rounded-full border bg-background px-3 py-2 text-left shadow-sm transition hover:border-primary/40 hover:bg-primary/5 lg:self-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
                  {reviewSummary.averageRating.toFixed(1)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-0.5 text-primary">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={
                          index < Math.round(reviewSummary.averageRating)
                            ? 'size-3.5 fill-primary text-primary'
                            : 'size-3.5 text-muted-foreground/30'
                        }
                      />
                    ))}
                  </div>
                  <div className="text-xs font-medium text-muted-foreground">
                    {reviewSummary.total} review
                    {reviewSummary.total === 1 ? '' : 's'}
                  </div>
                </div>
              </button>
            ) : null}
          </div>

          {features ? (
            <div
              className="overflow-hidden text-sm leading-6 text-foreground/75 [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: features }}
            />
          ) : (
            <p className="text-sm leading-6 text-foreground/70">
              {product.title} is available for direct order with dedicated sales
              support.
            </p>
          )}

          {outOfStock ? (
            <div className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Out of stock
            </div>
          ) : null}

          <Button
            asChild
            variant="link"
            className="h-auto p-0 font-bold text-green-600! underline! underline-offset-6"
          >
            <Link href={whatsappOrderUrl} target="_blank">
              <Send className="size-4" />
              Order on WhatsApp
            </Link>
          </Button>

          <div className="grid gap-2 sm:grid-cols-[auto_1fr_1fr]">
            <div className="grid h-11 grid-cols-3 overflow-hidden rounded-md border">
              <button
                type="button"
                className="flex w-10 items-center justify-center border-r"
                onClick={() =>
                  setQuantity((current) => Math.max(1, current - 1))
                }
              >
                <Minus className="size-4" />
              </button>
              <span className="flex w-10 items-center justify-center text-sm">
                {quantity}
              </span>
              <button
                type="button"
                className="flex w-10 items-center justify-center border-l"
                onClick={() => setQuantity((current) => current + 1)}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <Button
              className="h-11 rounded-md bg-secondary font-bold"
              disabled={outOfStock}
              onClick={() => addQuantityToCart(false)}
            >
              {outOfStock ? 'Out of stock' : 'Add To Cart'}
            </Button>
            <Button
              className="h-11 rounded-md font-bold"
              disabled={outOfStock}
              onClick={() => addQuantityToCart(true)}
            >
              {outOfStock ? 'Out of stock' : 'Buy Now'}
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
            <div className="flex gap-2">
              <AddToCompareButton
                product={product}
                compact
                className="h-9 w-auto rounded-md px-3 text-xs"
              />
              <AddToWishlistButton
                product={product}
                compact
                className="h-9 w-auto rounded-md px-3 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Share className="size-4" />
              {sharePlatforms.map((platform) => {
                const Icon = platform.Icon;
                return (
                  <Button
                    key={platform.name}
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    title={platform.name}
                  >
                    <Link
                      href={platform.buildHref(
                        encodedProductUrl,
                        encodeURIComponent(shareMedia),
                        product.title,
                      )}
                      target="_blank"
                    >
                      <Icon className="size-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="grid gap-4 text-sm">
              <div className="grid grid-cols-[auto_1fr_auto] gap-3">
                <PackageCheck className="mt-0.5 size-5 text-primary" />
                <div>
                  <div className="font-bold">
                    Pick up from the Malamal Warehouse
                  </div>
                  <div className="text-muted-foreground">To pick up today</div>
                </div>
                <div className="font-bold">Free</div>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] gap-3">
                <Truck className="mt-0.5 size-5 text-primary" />
                <div>
                  <div className="font-bold">Courier / Agent delivery</div>
                  <div className="text-muted-foreground">
                    Delivery agent will deliver to the specified address.
                  </div>
                </div>
                <div className="font-bold">2-3 Days</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-sm font-bold">Payment Methods:</span>
            <Image
              src={PaymentOptionSvg}
              alt="Payment Methods"
              width={314}
              height={37}
              className="h-auto w-full max-w-80"
            />
          </div>
        </div>
      </section>

      <Card className="overflow-hidden border-0 bg-secondary p-1 text-secondary-foreground shadow-sm lg:hidden">
        <div className="space-y-3 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary-foreground">
              Bulk pricing
            </div>
            <span className="hidden text-xs font-medium text-secondary-foreground/70 sm:inline">
              Quick quote
            </span>
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold leading-tight sm:text-lg">
              Need a quote?
            </h2>
            <p className="max-w-[28ch] text-sm leading-5 text-secondary-foreground/78">
              Tell us your quantity and delivery area.
            </p>
          </div>
          <Button
            asChild
            className="h-10 w-full rounded-full bg-white px-5 text-sm font-bold text-black! hover:bg-white/90 hover:text-primary!"
          >
            <Link href="/quotation-request">Request quote</Link>
          </Button>
        </div>
      </Card>

      <section className="rounded-md bg-card p-5 shadow-sm">
        <h2 className="text-xl font-medium text-secondary">Description</h2>
        <div
          className="mt-2 text-sm leading-7 text-foreground/70 [&_a]:font-semibold [&_a]:text-primary [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
          dangerouslySetInnerHTML={{
            __html:
              description ||
              `<p>${product.title} is listed with SKU ${product.sku} and ${product.stock}.</p>`,
          }}
        />
      </section>

      {/* {youtubeVideoId ? (
        <section className="rounded-md bg-card p-5 shadow-sm">
          <h2 className="text-xl font-medium text-secondary">Product Video</h2>
          <div className="mt-4 aspect-video overflow-hidden rounded-lg border bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
              title={`${product.title} video`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      ) : null} */}
    </div>
  );
}
