'use client';

import { useEffect, useMemo, useRef } from 'react';
import {
  Bold,
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

type DashboardRichTextEditorProps = {
  label: string;
  value: string;
  minHeightClassName?: string;
  onChange: (value: string) => void;
};

function runEditorCommand(command: string, value?: string) {
  document.execCommand(command, false, value);
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

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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
        <div className="flex flex-wrap items-center gap-1 border-b bg-muted/35 p-2">
          <Select onValueChange={(value) => handleFormat('formatBlock', value)}>
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
          <Select onValueChange={(value) => handleFormat('foreColor', value)}>
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
          <Select onValueChange={(value) => handleFormat('hiliteColor', value)}>
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
          id={editorId}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncEditorContent}
          onBlur={syncEditorContent}
          className={`${minHeightClassName} px-5 py-4 text-sm leading-7 outline-none [&_a]:font-semibold [&_a]:text-primary [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-foreground/65 [&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-black [&_h2]:mt-5 [&_h2]:text-xl [&_h2]:font-black [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc`}
        />
      </div>
    </div>
  );
}
