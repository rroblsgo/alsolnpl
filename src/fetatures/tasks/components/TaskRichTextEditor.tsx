'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, BackgroundColor } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import { TableCellTextAlign } from './extensions/TableCellTextAlign';
import RichTextToolbar from '@/src/shared/components/editor/RichTextToolbar';

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export default function TaskRichTextEditor({ value, onChange, error }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Placeholder.configure({
        placeholder:
          'Escribe la descripción. Puedes usar listas, enlaces, colores, resaltado, fechas y tablas.',
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      Color,
      BackgroundColor,
      FontFamily.configure({ types: ['textStyle'] }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TableCellTextAlign,
    ],
    content: value || '<p></p>',
    editorProps: {
      attributes: {
        class:
          'tiptap min-h-[260px] w-full rounded-b-md border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    const next = value || '<p></p>';
    if (editor.getHTML() !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div className="space-y-0">
      {/* showDate=true porque Tasks usa el botón de insertar fecha */}
      <RichTextToolbar editor={editor} showDate={true} />
      <EditorContent editor={editor} />
      {error && (
        <p className="mt-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
