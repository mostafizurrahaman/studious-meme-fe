import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { AddToCompareButton } from '@/components/compare/AddToCompareButton';
import { AddToWishlistButton } from '@/components/wishlist/AddToWishlistButton';
import { formatMoney, formatPriceLabelWithUnit } from '@/lib/cart';
import { getProductPrimaryImage, type Product } from '@/lib/storefront-types';
import { isOutOfStockLabel } from '@/lib/stock';

type Props = {
  product: Product;
  priority?: boolean;
  trailingAction?: React.ReactNode;
};

// function shouldBypassImageOptimization(src: string) {
//   return src.startsWith('https://malamal.com.bd/wp-content/uploads/');
// }

export function ProductCard({
  product,
  priority = false,
  trailingAction,
}: Props) {
  const primaryImage = getProductPrimaryImage(product);
  const outOfStock = isOutOfStockLabel(product.stock);
  // const unoptimized = shouldBypassImageOptimization(primaryImage);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square shrink-0 bg-muted p-2">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 block"
        >
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            // unoptimized={unoptimized}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="ui-image-card object-contain p-2 transition duration-300 group-hover:scale-105"
          />
          {product.badge ? (
            <Badge className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] shadow-sm">
              {product.badge}
            </Badge>
          ) : null}
        </Link>
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5 opacity-0 transition duration-300 group-hover:opacity-100">
          <AddToCompareButton
            product={product}
            compact
            className="w-full rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground/70 shadow-sm transition hover:border-primary/30 hover:text-primary"
          />
          {/* <Link
            href={`/product/${product.slug}`}
            className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground/70 shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            Quick view
          </Link> */}
          <AddToWishlistButton
            product={product}
            compact
            className="w-full rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-semibold text-foreground/70 shadow-sm transition hover:border-primary/30 hover:text-primary"
          />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col p-2.5 pt-2.5 sm:p-4 sm:pt-4">
        <Link href={`/product/${product.slug}`} className="block">
          <h3
            className="line-clamp-2 min-h-10 wrap-break-word text-[11px] font-semibold leading-5 text-foreground transition hover:text-primary sm:text-[13px]"
            title={product.title}
          >
            {product.title}
          </h3>
        </Link>
        <div className="mt-1.5 flex items-center justify-between gap-3 text-[9px] text-foreground/55 sm:mt-2 sm:text-[11px]">
          <span className="min-w-0 truncate">Brand: {product.brand}</span>
          <span className="shrink-0">SKU: {product.sku}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[9px] text-primary sm:mt-2 sm:text-[11px]">
          <span>★★★★★</span>
          <span className="text-foreground/50">({product.rating})</span>
        </div>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] sm:mt-2 sm:text-[13px]">
          <span className="font-extrabold text-primary">
            {formatPriceLabelWithUnit(product.price, product.sellingUnit)}
          </span>
          {product.oldPrice ? (
            <span className="text-foreground/45 line-through">
              {formatMoney(Number(product.oldPrice))}
            </span>
          ) : null}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[9px] text-foreground/60 sm:mt-2 sm:text-[11px]">
          <span>{product.stock}</span>
          <span>In catalog</span>
        </div>
        <div className="mt-auto grid gap-1.5 pt-4 sm:grid-cols-1 sm:gap-2">
          <AddToCartButton
            product={product}
            disabled={outOfStock}
            className="sm:w-full"
          />
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              className="h-8 flex-1 rounded-full border-border px-3 text-[8px] font-semibold text-foreground/70 sm:h-12 sm:text-[11px]"
            >
              <Link href={`/product/${product.slug}`}>View</Link>
            </Button>
            {trailingAction ? (
              <div className="shrink-0">{trailingAction}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
