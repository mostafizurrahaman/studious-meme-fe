'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Bold,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Indent,
  Italic,
  Link as LinkIcon,
  Link2Off,
  List,
  ListOrdered,
  Outdent,
  Pilcrow,
  Quote,
  Redo2,
  Sparkles,
  Strikethrough,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  TextAlignJustify,
  Underline,
  Undo2,
  Highlighter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Dynamically import the CodeEditor component to prevent SSR hydration mismatches in Next.js
const CodeEditor = dynamic(
  () => import('@uiw/react-textarea-code-editor').then(mod => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full bg-muted/10 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading code editor...
      </div>
    ),
  },
);

type DashboardRichTextEditorProps = {
  label: string;
  value: string;
  minHeightClassName?: string;
  onChange: (value: string) => void;
};

function runEditorCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
}

const VOID_TAGS = /^<(br|hr|img|input|meta|link)/i;

function prettyPrintHtml(html: string) {
  const spaced = (html || '').replace(/></g, '>\n<').trim();
  if (!spaced) return '';
  let depth = 0;
  return spaced
    .split('\n')
    .map(rawLine => {
      const line = rawLine.trim();
      if (!line) return null;
      const isClosing = /^<\/\w/.test(line);
      if (isClosing) depth = Math.max(depth - 1, 0);
      const indented = '  '.repeat(depth) + line;
      const isSelfClosingOrVoid =
        VOID_TAGS.test(line) || /\/>\s*$/.test(line) || /^<!--/.test(line);
      const isOpening =
        /^<[a-zA-Z]/.test(line) && !isClosing && !isSelfClosingOrVoid;
      const closesOnSameLine =
        /<\/\w+>\s*$/.test(line) && /^<[a-zA-Z]/.test(line);
      if (isOpening && !closesOnSameLine) depth++;
      return indented;
    })
    .filter((line): line is string => line !== null)
    .join('\n');
}

function minifyHtml(html: string) {
  return (html || '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const textColors = [
  '#000000',
  '#e03131',
  '#2f9e44',
  '#f08c00',
  '#1971c2',
  '#862e9c',
  '#ffffff',
];

const highlightColors = [
  '#ffffff',
  '#fffb99',
  '#ffec99',
  '#a5d8ff',
  '#b2f2bb',
  '#ffc9c9',
];

export function DashboardRichTextEditor({
  label,
  value,
  minHeightClassName = 'min-h-48',
  onChange,
}: DashboardRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeView, setIsCodeView] = useState(false);

  // Sync value back to visual editor when switching out of code view or when value updates from parent
  useEffect(() => {
    if (
      !isCodeView &&
      editorRef.current &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isCodeView]);

  const editorId = useMemo(
    () => `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-editor`,
    [label],
  );

  function syncEditorContent() {
    onChange(editorRef.current?.innerHTML ?? '');
  }

  function handleFormat(command: string, commandValue?: string) {
    editorRef.current?.focus();
    runEditorCommand(command, commandValue);
    syncEditorContent();
  }

  function handleLink() {
    const url = window.prompt('Enter link URL');
    if (!url) return;
    handleFormat('createLink', url);
  }

  return (
    <div className="grid gap-2">
      <label
        className="text-xs font-medium text-muted-foreground"
        htmlFor={editorId}
      >
        {label}
      </label>
      <div className="overflow-hidden rounded-xl border bg-background">
        {/* Toolbar Section */}
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/35 p-2">
          <Select
            disabled={isCodeView}
            onValueChange={value => handleFormat('formatBlock', value)}
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
            disabled={isCodeView}
            onClick={() => handleFormat('undo')}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('redo')}
          >
            <Redo2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('bold')}
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('italic')}
          >
            <Italic className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('underline')}
          >
            <Underline className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('strikeThrough')}
          >
            <Strikethrough className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('formatBlock', 'p')}
          >
            <Pilcrow className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('formatBlock', 'h1')}
          >
            <Heading1 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('formatBlock', 'h2')}
          >
            <Heading2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('formatBlock', 'h3')}
          >
            <Heading3 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('formatBlock', 'blockquote')}
          >
            <Quote className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('insertUnorderedList')}
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('insertOrderedList')}
          >
            <ListOrdered className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={handleLink}
          >
            <LinkIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('unlink')}
          >
            <Link2Off className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('justifyLeft')}
          >
            <TextAlignStart className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('justifyCenter')}
          >
            <TextAlignCenter className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('justifyRight')}
          >
            <TextAlignEnd className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('justifyFull')}
          >
            <TextAlignJustify className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('outdent')}
          >
            <Outdent className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCodeView}
            onClick={() => handleFormat('indent')}
          >
            <Indent className="size-4" />
          </Button>
          <Select
            disabled={isCodeView}
            onValueChange={value => handleFormat('foreColor', value)}
          >
            <SelectTrigger className="h-8 w-30 bg-background">
              <SelectValue placeholder="Text" />
            </SelectTrigger>
            <SelectContent>
              {textColors.map(color => (
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
            disabled={isCodeView}
            onValueChange={value => handleFormat('hiliteColor', value)}
          >
            <SelectTrigger className="h-8 w-34 bg-background">
              <SelectValue placeholder="Highlight" />
            </SelectTrigger>
            <SelectContent>
              {highlightColors.map(color => (
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
            disabled={isCodeView}
            onClick={() => handleFormat('removeFormat')}
          >
            <Eraser className="size-4" />
          </Button>

          {/* Toggle View Mode Button */}
          <div className="ml-auto flex items-center gap-1 border-l pl-1">
            <Button
              type="button"
              variant={isCodeView ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setIsCodeView(prev => !prev)}
              title={
                isCodeView ? 'Switch to Visual Editor' : 'Switch to Code Editor'
              }
            >
              <Code className="size-4" />
            </Button>
            <Highlighter className="size-4 text-muted-foreground" />
          </div>
        </div>

        {/* 
          CSS OVERLAY HOTFIX:
          Forces the internal textarea to overlay absolutely and remain 100% transparent. 
          This overrides any global Tailwind, styling framework resets, or Next.js CSS loader issues.
        */}
        {isCodeView && (
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .w-tc-editor {
              position: relative !important;
              min-height: inherit !important;
              display: flex !important;
              flex-direction: column !important;
            }
            /* Make the text editor wrapper and active typing input overlay properly */
            .w-tc-editor > textarea {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              color: transparent !important;
              -webkit-text-fill-color: transparent !important;
              background: transparent !important;
              caret-color: #ffffff !important; /* Keeps cursor visible */
              font-family: inherit !important;
              font-size: inherit !important;
              line-height: inherit !important;
              padding: 16px !important;
              resize: none !important;
              overflow: auto !important;
              z-index: 10 !important;
            }
            /* Keep syntax highlighted text behind the input, aligned perfectly */
            .w-tc-editor > pre {
              margin: 0 !important;
              padding: 16px !important;
              font-family: inherit !important;
              font-size: inherit !important;
              line-height: inherit !important;
              pointer-events: none !important;
              white-space: pre-wrap !important;
              word-break: break-all !important;
              z-index: 1 !important;
            }
          `,
            }}
          />
        )}

        {/* Editor Body Area */}
        {isCodeView ? (
          /* 1. Code Editor View: Rendered only when isCodeView is true */
          <div
            key="code-editor-view"
            className={`relative bg-zinc-950 text-slate-100 dark:bg-zinc-950 resize-y overflow-y-auto ${minHeightClassName} flex flex-col`}
          >
            <div
              className="flex items-center gap-1.5 px-2 py-1.5 sticky top-0 z-20 bg-zinc-950"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span
                className="mr-auto flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide"
                style={{ color: '#a1a1aa' }}
              >
                <Sparkles className="size-3" /> HTML source
              </span>
              <button
                type="button"
                onClick={() => onChange(prettyPrintHtml(value))}
                className="rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10 transition-colors"
                style={{ color: '#d4d4d8', background: 'transparent' }}
              >
                Format
              </button>
              <button
                type="button"
                onClick={() => onChange(minifyHtml(value))}
                className="rounded-md px-2 py-1 text-xs font-medium hover:bg-white/10 transition-colors"
                style={{ color: '#d4d4d8', background: 'transparent' }}
              >
                Minify
              </button>
            </div>
            <CodeEditor
              value={value}
              language="html"
              placeholder="Write HTML raw code here..."
              onChange={e => onChange(e.target.value)}
              padding={16}
              className="border-none focus:outline-none focus:ring-0"
              style={{
                fontSize: 13,
                backgroundColor: 'transparent',
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                flex: 1,
                minHeight: 'inherit',
              }}
            />
          </div>
        ) : (
          /* 2. Visual Rich Text Editor: Rendered only when isCodeView is false */
          <div
            key="visual-editor-view"
            id={editorId}
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={syncEditorContent}
            onBlur={syncEditorContent}
            className={`${minHeightClassName} resize-y overflow-auto px-5 py-4 text-sm leading-7 outline-none [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-foreground/65 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc`}
          />
        )}
      </div>
    </div>
  );
}
