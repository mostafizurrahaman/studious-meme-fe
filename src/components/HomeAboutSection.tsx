'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { siteConfig, siteAboutSections } from '@/lib/seo';

const VISIBLE_COUNT = 3;

export function HomeAboutSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const visibleSections = isExpanded
    ? siteAboutSections
    : siteAboutSections.slice(0, VISIBLE_COUNT);

  return (
    <Card className="mt-8 shadow-sm">
      <CardContent className="p-6">
        <h2 className="text-xl font-medium text-secondary sm:text-2xl">
          {siteConfig.name} - Online Hardware Store Bangladesh
        </h2>
        <Separator className="my-5" />
        <div className="space-y-6 text-sm leading-7 text-foreground/70">
          {visibleSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-bold text-secondary">{section.heading}</h3>
              <p className="mt-1">{section.content}</p>
            </div>
          ))}
        </div>
        {siteAboutSections.length > VISIBLE_COUNT && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Read less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Read more
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
