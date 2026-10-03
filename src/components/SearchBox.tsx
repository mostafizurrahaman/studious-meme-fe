'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { searchProducts, type SearchResult } from '@/services/Product';
import { Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trackSearch } from '@/lib/facebook-pixel';

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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.trim().length < 2) {
        setResults(null);
        return;
    };

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await searchProducts(query, 20);
        setResults(data);
        setIsOpen(true);
        trackSearch(query);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    setIsOpen(false);
    router.push(`/shop?searchTerm=${encodeURIComponent(term)}`);
  }

  const showDropdown = isOpen && results && query.trim().length >= 2;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Search Input Form */}
      <form
        className="flex w-full overflow-hidden rounded-full border border-border bg-background shadow-sm focus-within:ring-2 focus-within:ring-primary/20"
        onSubmit={handleSearchSubmit}
      >
        <div className="relative flex flex-1 items-center">
          <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder="Search products..."
            className="h-11 w-full bg-transparent px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
            aria-label="Search"
          />
          {query && (
             <button 
                type="button" 
                onClick={() => setQuery('')}
                className="mr-2 p-1 text-muted-foreground hover:text-foreground"
             >
                <X className="h-4 w-4" />
             </button>
          )}
          {isLoading && (
            <Loader2 className="mr-4 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        <button
          type="submit"
          className="flex h-11 shrink-0 items-center bg-secondary px-5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 lg:left-1/2 lg:right-auto lg:-translate-x-1/2 top-full z-[9999] mt-2 flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl lg:w-[900px] xl:w-[1100px] max-h-[70vh] sm:max-h-[75vh]">
          
          {/* Header - Fixed at top of dropdown */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Search Results
              </p>
              <p className="text-xs font-bold text-secondary">
                {results.products.length} products found for "{query}"
              </p>
            </div>
            <Link
              href={`/shop?searchTerm=${encodeURIComponent(query.trim())}`}
              onClick={() => setIsOpen(false)}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold !text-primary-foreground transition hover:opacity-90"
            >
              View All
            </Link>
          </div>

          {/* Results List - Scrollable Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain p-3 custom-scrollbar">
            {results.products.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.products.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/product/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2 transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1 transition duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-[10px] text-muted-foreground">No Image</div>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="line-clamp-1 text-sm font-bold text-foreground group-hover:text-primary">
                        <HighlightedText text={product.title} query={query} />
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {product.sellingUnit || 'Unit'}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-black text-primary">
                          Tk. {product.price.toLocaleString('en-BD')}
                        </span>
                        {product.oldPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            Tk. {product.oldPrice.toLocaleString('en-BD')}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Search className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No products found matching your search.</p>
              </div>
            )}
          </div>

          {/* Bottom Shadow Overlay for Mobile (Optional) */}
          <div className="pointer-events-none absolute bottom-0 left-0 h-4 w-full bg-gradient-to-t from-background to-transparent sm:hidden" />
        </div>
      )}
    </div>
  );
}