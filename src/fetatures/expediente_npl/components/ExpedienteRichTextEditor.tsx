'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, BackgroundColor } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import RichTextToolbar from '@/src/shared/components/editor/RichTextToolbar';

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export default function ExpedienteRichTextEditor({
  value,
  onChange,
  placeholder = 'Escribe el contenido de la nota. Puedes usar listas, enlaces y formato.',
  error,
}: Props) {
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
      Placeholder.configure({ placeholder }),
      TextStyle,
      Color,
      BackgroundColor,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`rounded-md border ${error ? 'border-red-400' : 'border-gray-300'} bg-white`}>
      {/* Guard: RichTextToolbar requiere editor no-null */}
      {editor && <RichTextToolbar editor={editor} />}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 text-sm focus:outline-none min-h-[120px]"
      />
      {error && <p className="px-3 pb-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
