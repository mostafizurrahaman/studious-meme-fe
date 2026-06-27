import { PageShell } from '@/components/PageShell';
import type { BackendPage } from '@/lib/page-content';

type ManagedPageContentProps = {
  page: BackendPage | null;
  fallbackTitle: string;
  fallbackDescription: string;
  fallback: React.ReactNode;
};

function sanitizeManagedHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\sclass=["'][^"']*["']/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
    .replace(/\shref=["']javascript:[^"']*["']/gi, '')
    .replace(/\sstyle=(["'])([\s\S]*?)\1/gi, (_match, quote, styles) => {
      const safeStyles = String(styles)
        .split(';')
        .map((item) => item.trim())
        .filter((item) =>
          /^(color|background-color|font-weight|font-style|text-align|text-decoration)\s*:/i.test(
            item,
          ),
        )
        .join('; ');

      return safeStyles ? ` style=${quote}${safeStyles}${quote}` : '';
    });
}

export function ManagedPageContent({
  page,
  fallbackTitle,
  fallbackDescription,
  fallback,
}: ManagedPageContentProps) {
  const content = page?.content?.trim();

  return (
    <PageShell
      title={page?.title?.trim() || fallbackTitle}
      description={fallbackDescription}
    >
      {content ? (
        <div
          className="max-w-full overflow-hidden text-sm leading-7 break-words text-foreground/70 [&_*]:max-w-full [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_img]:h-auto [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_td]:break-words [&_th]:break-words [&_ul]:list-disc"
          dangerouslySetInnerHTML={{ __html: sanitizeManagedHtml(content) }}
        />
      ) : (
        fallback
      )}
    </PageShell>
  );
}
