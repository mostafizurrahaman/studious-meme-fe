'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Bold,
  Eraser,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Indent,
  Italic,
  Link2Off,
  Link as LinkIcon,
  List,
  ListOrdered,
  Outdent,
  Pilcrow,
  Quote,
  Redo2,
  Save,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignJustify,
  TextAlignStart,
  Underline,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  pageLabels,
  publicPagePathBySlug,
  type BackendPage,
  type DashboardPageSlug,
} from '@/lib/page-content';
import { createOrUpdatePageByType } from '@/services/Page';

type DashboardPagesManagerProps = {
  page: BackendPage | null;
  slug: DashboardPageSlug;
};

const emptyContent = '<p>Write page content here.</p>';
const textColors = [
  '#111827',
  '#2563eb',
  '#15803d',
  '#b91c1c',
  '#c2410c',
  '#7c3aed',
];
const highlightColors = [
  '#ffffff',
  '#fef3c7',
  '#dcfce7',
  '#dbeafe',
  '#fee2e2',
  '#f3e8ff',
];

function runEditorCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

function formatDashboardTimestamp(value?: string) {
  if (!value) return 'Not saved yet';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(new Date(value));
}

export function DashboardPagesManager({
  page,
  slug,
}: DashboardPagesManagerProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(page?.title ?? pageLabels[slug]);
  const [content, setContent] = useState(page?.content ?? emptyContent);
  const [isPending, startTransition] = useTransition();
  const publicPath = publicPagePathBySlug[slug];

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const plainText = useMemo(
    () => content.replace(/<[^>]+>/g, '').trim(),
    [content],
  );

  function syncEditorContent() {
    setContent(editorRef.current?.innerHTML ?? '');
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function handleFormat(command: string, value?: string) {
    focusEditor();
    runEditorCommand(command, value);
    syncEditorContent();
  }

  function handleLink() {
    const url = window.prompt('Enter link URL');
    if (!url) return;

    handleFormat('createLink', url);
  }

  function handleSave() {
    startTransition(async () => {
      if (!title.trim()) {
        toast.error('Title is required.');
        return;
      }

      if (plainText.length < 10) {
        toast.error('Content must be at least 10 characters long.');
        return;
      }

      const result = await createOrUpdatePageByType({
        slug,
        title: title.trim(),
        content,
      });

      if (!result?.success) {
        toast.error(result?.message ?? 'Failed to save page.');
        return;
      }

      toast.success(result.message ?? 'Page saved successfully.');
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="shadow-sm">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{pageLabels[slug]}</CardTitle>
              <CardDescription>
                Update storefront page content from the dashboard rich text
                editor.
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="lg">
              <Link href={publicPath} target="_blank">
                <ExternalLink className="size-4" />
                View page
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label
              className="text-sm font-semibold text-foreground"
              htmlFor="page-title"
            >
              Page title
            </label>
            <Input
              id="page-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 bg-background text-sm"
            />
          </div>

          <div className="overflow-hidden rounded-xl border bg-background">
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/35 p-2">
              <Select
                onValueChange={(value) => handleFormat('formatBlock', value)}
              >
                <SelectTrigger className="h-8 w-34 bg-background">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p">Paragraph</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="blockquote">Quote</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('undo')}
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('redo')}
              >
                <Redo2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('bold')}
              >
                <Bold className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('italic')}
              >
                <Italic className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('underline')}
              >
                <Underline className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('strikeThrough')}
              >
                <Strikethrough className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('formatBlock', 'p')}
              >
                <Pilcrow className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('formatBlock', 'h1')}
              >
                <Heading1 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('formatBlock', 'h2')}
              >
                <Heading2 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('formatBlock', 'h3')}
              >
                <Heading3 className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('formatBlock', 'blockquote')}
              >
                <Quote className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('insertUnorderedList')}
              >
                <List className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('insertOrderedList')}
              >
                <ListOrdered className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleLink}
              >
                <LinkIcon className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('unlink')}
              >
                <Link2Off className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('justifyLeft')}
              >
                <TextAlignStart className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('justifyCenter')}
              >
                <TextAlignCenter className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('justifyRight')}
              >
                <TextAlignEnd className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('justifyFull')}
              >
                <TextAlignJustify className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('outdent')}
              >
                <Outdent className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('indent')}
              >
                <Indent className="size-4" />
              </Button>
              <Select
                onValueChange={(value) => handleFormat('foreColor', value)}
              >
                <SelectTrigger className="h-8 w-30 bg-background">
                  <SelectValue placeholder="Text" />
                </SelectTrigger>
                <SelectContent>
                  {textColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        {color}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                onValueChange={(value) => handleFormat('hiliteColor', value)}
              >
                <SelectTrigger className="h-8 w-34 bg-background">
                  <SelectValue placeholder="Highlight" />
                </SelectTrigger>
                <SelectContent>
                  {highlightColors.map((color) => (
                    <SelectItem key={color} value={color}>
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-3 rounded-full border"
                          style={{ backgroundColor: color }}
                        />
                        {color === '#ffffff' ? 'None' : color}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFormat('removeFormat')}
              >
                <Eraser className="size-4" />
              </Button>
              <Highlighter className="size-4 text-muted-foreground" />
            </div>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={syncEditorContent}
              onBlur={syncEditorContent}
              className="max-h-[65vh] min-h-90 overflow-auto px-5 py-4 text-sm leading-7 wrap-break-word outline-none **:max-w-full [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-foreground/65 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_img]:h-auto [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_ul]:list-disc"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Last updated: {formatDashboardTimestamp(page?.updatedAt)}
            </p>
            <Button
              type="button"
              size="lg"
              disabled={isPending}
              onClick={handleSave}
            >
              <Save className="size-4" />
              {isPending ? 'Saving...' : 'Save content'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit shadow-sm">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            This is how the saved rich content will flow on the public page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border bg-muted/20 p-4">
            <h2 className="text-xl font-black text-secondary">
              {title || pageLabels[slug]}
            </h2>
            <div
              className="mt-4 max-h-[70vh] overflow-auto text-sm leading-7 wrap-break-word text-foreground/70 **:max-w-full [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-foreground/65 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-black [&_h2]:mt-5 [&_h2]:text-lg [&_h2]:font-black [&_h3]:mt-4 [&_h3]:font-bold [&_img]:h-auto [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
