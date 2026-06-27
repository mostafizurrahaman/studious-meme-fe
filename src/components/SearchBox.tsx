'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchProducts, type SearchResult } from '@/services/Product';
import { Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DEBOUNCE_MS = 600;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const parts = useMemo(() => {
    const safeQuery = query.trim();
    if (!safeQuery) return [text];

    const regex = new RegExp(`(${escapeRegExp(safeQuery)})`, 'ig');
    return text.split(regex).filter(Boolean);
  }, [query, text]);

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.trim().toLowerCase() && query.trim() ? (
          <mark key={`${part}-${index}`} className="bg-transparent font-extrabold text-secondary underline decoration-primary decoration-2 underline-offset-2">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 2) return;

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchProducts(query, 10);

        setResults(data);
        setIsOpen(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const visibleResults = query.trim().length >= 2 ? results : null;
  const showDropdown = isOpen && visibleResults;
  const dropdownResults = visibleResults ?? { products: [], suggestions: [] };

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = query.trim();

    if (!term) return;

    setIsOpen(false);
    router.push(`/shop?searchTerm=${encodeURIComponent(term)}`);
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        className="flex w-full overflow-hidden rounded-full border border-border bg-background shadow-sm"
        onSubmit={handleSearchSubmit}
      >
        <div className="relative flex flex-1 items-center">
          <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder="Search…"
            className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            aria-label="Search"
          />
          {isLoading && (
            <Loader2 className="mr-4 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <button
          type="submit"
          className="flex h-11 shrink-0 items-center bg-secondary px-3 text-sm font-semibold text-secondary-foreground! hover:bg-secondary/80"
        >
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="absolute left-1/2 top-full z-9999 mt-2 w-[min(1080px,calc(100vw-1rem))] -translate-x-1/2 overflow-hidden rounded-3xl border border-border bg-background shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2.5 sm:px-4 sm:py-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                Search results
              </div>
              <div className="text-xs font-bold text-secondary sm:text-sm">
                {dropdownResults.products.length} products found
              </div>
            </div>
            <Link
              href={`/shop?searchTerm=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold text-white! transition hover:text-black! hover:opacity-90 sm:px-4 sm:py-2 sm:text-xs"
            >
              View all
            </Link>
          </div>

          {dropdownResults.products.length > 0 ? (
            <div className="max-h-[70vh] overflow-y-auto p-2.5 sm:p-3">
              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {dropdownResults.products.slice(0, 8).map((product) => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex gap-2.5 rounded-2xl border border-border bg-background p-2.5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:gap-3 sm:p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-18 sm:w-18">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1.5 transition duration-300 group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="line-clamp-2 text-[12px] font-semibold leading-4 text-foreground group-hover:text-primary sm:text-[13px] sm:leading-5">
                        <HighlightedText text={product.title} query={query} />
                      </div>
                      <div className="mt-0.5 text-[10px] text-foreground/55 sm:mt-1 sm:text-xs">
                        {product.sellingUnit ? product.sellingUnit : 'Product'}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        {product.oldPrice ? (
                          <span className="text-[10px] text-foreground/35 line-through sm:text-xs">
                            Tk. {product.oldPrice.toLocaleString('en-BD')}
                          </span>
                        ) : null}
                        <span className="text-[12px] font-black text-primary sm:text-sm">
                          Tk. {product.price.toLocaleString('en-BD')}
                        </span>
                        {product.badge ? (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-secondary-foreground">
                            {product.badge}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No products found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
