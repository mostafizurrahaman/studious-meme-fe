'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type HeroSlide = {
  title: string;
  description: string;
  image: string;
  href: string;
};

type HomeHeroCarouselProps = {
  slides: HeroSlide[];
  features?: HeroSlide[];
};

export function HomeHeroCarousel({ slides, features }: HomeHeroCarouselProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const featureCards = features?.length ? features : slides;

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  const heroSlide = slides[heroIndex] ?? slides[0];
  if (!heroSlide) {
    return (
      <Card className="flex min-h-80 items-center justify-center p-8 text-center shadow-sm">
        <div>
          <div className="text-xl font-black text-secondary">
            No active homepage banners
          </div>
          <p className="mt-2 text-sm text-foreground/60">
            Publish homepage hero content from the dashboard to fill this
            section.
          </p>
        </div>
      </Card>
    );
  }

  const topFeature = featureCards[0] ?? heroSlide;
  const bottomFeatures = [featureCards[1], featureCards[2]].filter(
    Boolean,
  ) as HeroSlide[];
  const mobileFeatures = [featureCards[1], featureCards[2]].filter(
    Boolean,
  ) as HeroSlide[];

  return (
    <div className="overflow-hidden border-0 rounded-none bg-transparent shadow-none">
      <div className="grid h-full items-stretch gap-0 p-0 lg:grid-cols-2 lg:gap-4 lg:p-6">
        <div className="relative aspect-1163/794 overflow-hidden bg-background sm:h-full sm:min-h-96 sm:aspect-auto">
          <Link
            href={heroSlide.href}
            aria-label={heroSlide.title}
            className="absolute inset-0 z-10"
          >
            <Image
              src={heroSlide.image}
              alt={heroSlide.title}
              fill
              priority
              fetchPriority="high"
              // quality={100}
              // unoptimized
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center transition duration-500 ease-out"
            />
          </Link>

          {slides.length > 1 ? (
            <>
              <Button
                type="button"
                onClick={() =>
                  setHeroIndex(
                    (prev) => (prev - 1 + slides.length) % slides.length,
                  )
                }
                aria-label="Previous banner"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-transparent text-foreground shadow-md backdrop-blur-sm transition hover:bg-background hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={() =>
                  setHeroIndex((prev) => (prev + 1) % slides.length)
                }
                aria-label="Next banner"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-transparent text-foreground shadow-md backdrop-blur-sm transition hover:bg-background hover:text-primary"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          ) : null}

          {slides.length > 1 ? (
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-background/90 px-3 py-2 shadow-sm backdrop-blur-sm">
              {slides.map((slide, index) => (
                <button
                  key={`${slide.title}-${index}`}
                  type="button"
                  onClick={() => setHeroIndex(index)}
                  aria-label={`Go to banner ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all ${index === heroIndex ? 'w-7 bg-primary' : 'w-2.5 bg-border'}`}
                />
              ))}
            </div>
          ) : null}
        </div>

        {mobileFeatures.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pt-3 pb-1 lg:hidden">
            {mobileFeatures.map((slide, index) => (
              <Link
                key={`${slide.title}-${index}`}
                href={slide.href}
                className="relative aspect-[1.3/1] w-full overflow-hidden border border-border bg-muted p-1.5 shadow-sm"
                aria-label={slide.title}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition duration-300"
                />
              </Link>
            ))}
          </div>
        ) : null}

        <div className="hidden gap-4 lg:grid lg:grid-cols-1">
          <Link
            href={topFeature.href}
            className="group relative aspect-[2.6/1] cursor-pointer overflow-hidden border border-border bg-muted shadow-sm"
          >
            <Image
              src={topFeature.image}
              alt={topFeature.title}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition duration-300 group-hover:scale-105"
            />
            {/* <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/5 to-transparent" /> */}
            {/* <Badge className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white shadow-sm">
              Feature 1
            </Badge> */}
          </Link>

          <div className="grid grid-cols-2 gap-4">
            {bottomFeatures.map((slide, index) => (
              <Link
                key={`${slide.title}-${index}`}
                href={slide.href}
                className="group relative aspect-[1.85/1] cursor-pointer overflow-hidden border border-border bg-muted shadow-sm"
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  loading="lazy"
                  // quality={100}
                  // unoptimized
                  sizes="(max-width: 1024px) 50vw, 12.5vw"
                  className="object-cover object-center transition duration-300 group-hover:scale-105"
                />
                {/* <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/5 to-transparent" /> */}
                {/* <Badge className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white shadow-sm">
                  Feature {index + 2}
                </Badge> */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { ArrowLeft, ArrowRight } from 'lucide-react';
// // import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';

// type HeroSlide = {
//   title: string;
//   description: string;
//   image: string;
//   href: string;
// };

// type HomeHeroCarouselProps = {
//   slides: HeroSlide[];
//   features?: HeroSlide[];
// };

// export function HomeHeroCarousel({ slides, features }: HomeHeroCarouselProps) {
//   const [heroIndex, setHeroIndex] = useState(0);
//   const featureCards = features?.length ? features : slides;

//   useEffect(() => {
//     if (slides.length <= 1) return;

//     const timer = window.setInterval(() => {
//       setHeroIndex(prev => (prev + 1) % slides.length);
//     }, 5000);

//     return () => window.clearInterval(timer);
//   }, [slides.length]);

//   const heroSlide = slides[heroIndex] ?? slides[0];
//   if (!heroSlide) {
//     return (
//       <Card className="flex min-h-80 items-center justify-center p-8 text-center shadow-sm">
//         <div>
//           <div className="text-xl font-black text-secondary">No active homepage banners</div>
//           <p className="mt-2 text-sm text-foreground/60">
//             Publish homepage hero content from the dashboard to fill this section.
//           </p>
//         </div>
//       </Card>
//     );
//   }

//   const topFeature = featureCards[1] ?? featureCards[0] ?? heroSlide;
//   const bottomFeatures = [featureCards[0], featureCards[2]].filter(Boolean) as HeroSlide[];
//   const mobileFeatures = featureCards.slice(0, 2);

//   return (
//     <Card className="overflow-hidden shadow-sm">
//       <div className="grid h-full items-stretch gap-0 p-0 sm:gap-4 sm:p-6 lg:grid-cols-2 lg:p-6">
//         <div className="ui-image-card relative aspect-[1163/794] overflow-hidden rounded-3xl bg-background sm:h-full sm:min-h-96 sm:aspect-auto">
//           <Link href={heroSlide.href} aria-label={heroSlide.title} className="absolute inset-0 z-10">
//             <Image
//               src={heroSlide.image}
//               alt={heroSlide.title}
//               fill
//               loading="eager"
//               // quality={100}
//               // unoptimized
//               sizes="(max-width: 1024px) 100vw, 50vw"
//               className="object-cover object-center transition duration-500 ease-out"
//             />
//           </Link>

//           {slides.length > 1 ? (
//             <>
//               <Button
//                 type="button"
//                 onClick={() => setHeroIndex(prev => (prev - 1 + slides.length) % slides.length)}
//                 aria-label="Previous banner"
//                 variant="secondary"
//                 size="icon"
//                 className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-transparent text-foreground shadow-md backdrop-blur-sm transition hover:bg-background hover:text-primary"
//               >
//                 <ArrowLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 type="button"
//                 onClick={() => setHeroIndex(prev => (prev + 1) % slides.length)}
//                 aria-label="Next banner"
//                 variant="secondary"
//                 size="icon"
//                 className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-transparent text-foreground shadow-md backdrop-blur-sm transition hover:bg-background hover:text-primary"
//               >
//                 <ArrowRight className="h-4 w-4" />
//               </Button>
//             </>
//           ) : null}

//           {slides.length > 1 ? (
//             <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-background/90 px-3 py-2 shadow-sm backdrop-blur-sm">
//               {slides.map((slide, index) => (
//                 <button
//                   key={`${slide.title}-${index}`}
//                   type="button"
//                   onClick={() => setHeroIndex(index)}
//                   aria-label={`Go to banner ${index + 1}`}
//                   className={`h-2.5 rounded-full transition-all ${index === heroIndex ? 'w-7 bg-primary' : 'w-2.5 bg-border'}`}
//                 />
//               ))}
//             </div>
//           ) : null}
//         </div>

//         {mobileFeatures.length > 0 ? (
//           <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pt-3 pb-1 pr-4 lg:hidden">
//             {mobileFeatures.map((slide, index) => (
//               <Link
//                 key={`${slide.title}-${index}`}
//                 href={slide.href}
//                 className="ui-image-card relative aspect-[1.3/1] w-[82%] shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-muted shadow-sm first:ml-0"
//                 aria-label={slide.title}
//               >
//                 <Image
//                   src={slide.image}
//                   alt={slide.title}
//                   fill
//                   loading={index === 0 ? 'eager' : 'lazy'}
//                   sizes="(max-width: 1024px) 50vw, 25vw"
//                   className="object-cover object-center transition duration-300"
//                 />
//               </Link>
//             ))}
//           </div>
//         ) : null}

//         <div className="hidden gap-4 lg:grid lg:grid-cols-1">
//           <Link
//             href={topFeature.href}
//             className="ui-image-card group relative aspect-[2.6/1] cursor-pointer overflow-hidden rounded-3xl border border-border bg-muted shadow-sm"
//           >
//             <Image
//               src={topFeature.image}
//               alt={topFeature.title}
//               fill
//               loading="eager"
//               fetchPriority="high"
//               quality={100}
//               unoptimized
//               sizes="(max-width: 1024px) 50vw, 25vw"
//               className="object-cover object-center transition duration-300 group-hover:scale-105"
//             />
//             {/* <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/5 to-transparent" /> */}
//             {/* <Badge className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white shadow-sm">
//               Feature 1
//             </Badge> */}
//           </Link>

//           <div className="grid grid-cols-2 gap-4">
//             {bottomFeatures.map((slide, index) => (
//               <Link
//                 key={`${slide.title}-${index}`}
//                 href={slide.href}
//                 className="ui-image-card group relative aspect-[1.85/1] cursor-pointer overflow-hidden rounded-3xl border border-border bg-muted shadow-sm"
//               >
//                 <Image
//                   src={slide.image}
//                   alt={slide.title}
//                   fill
//                   loading="eager"
//                   // quality={100}
//                   // unoptimized
//                   sizes="(max-width: 1024px) 50vw, 12.5vw"
//                   className="object-cover object-center transition duration-300 group-hover:scale-105"
//                 />
//                 {/* <div className="absolute inset-0 bg-linear-to-r from-black/10 via-black/5 to-transparent" /> */}
//                 {/* <Badge className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white shadow-sm">
//                   Feature {index + 2}
//                 </Badge> */}
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }
