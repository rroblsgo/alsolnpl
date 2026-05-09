'use client';

/**
 * RichTextToolbar
 * Toolbar compacta compartida para TaskRichTextEditor y NplRichTextEditor.
 * Ubicación: src/shared/components/editor/RichTextToolbar.tsx
 *
 * Rediseño respecto a la versión anterior:
 * - Una sola barra horizontal con separadores finos en lugar de grupos en caja
 * - Botones reducidos a h-7 w-7 (iconos) y h-7 px-2 (texto)
 * - Sin bordes individuales por grupo — fondo unificado bg-slate-100
 * - Separador visual | entre grupos
 */

import type { Editor } from '@tiptap/react';
import {
  Bold, Italic, Strikethrough,
  Heading2, Heading3,
  List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight,
  PaintBucket, Highlighter,
  Link as LinkIcon, Unlink,
  Table2, Rows3, Columns3, Trash2,
  Undo2, Redo2,
  CalendarDays,
} from 'lucide-react';
import clsx from 'clsx';
import { useMemo, useState } from 'react';

// ─── Constantes ───────────────────────────────────────────────────────────────

const MONO_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace';

const TEXT_COLORS = [
  { label: 'Rojo',    value: '#dc2626' },
  { label: 'Azul',   value: '#2563eb' },
  { label: 'Verde',  value: '#16a34a' },
  { label: 'Naranja',value: '#ea580c' },
];

const HIGHLIGHT_COLORS = [
  { label: 'Amarillo',    value: '#fef08a' },
  { label: 'Azul claro',  value: '#bfdbfe' },
  { label: 'Verde claro', value: '#bbf7d0' },
  { label: 'Rosa claro',  value: '#fbcfe8' },
];

// ─── Subcomponentes ───────────────────────────────────────────────────────────

type BtnProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
  wide?: boolean; // para botones de texto como "Mono" o "A"
};

function Btn({ onClick, active, title, disabled, children, wide }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center justify-center rounded text-sm transition-colors',
        wide ? 'h-7 px-2' : 'h-7 w-7',
        active
          ? 'bg-slate-700 text-white'
          : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900',
        disabled && 'cursor-not-allowed opacity-40'
      )}
    >
      {children}
    </button>
  );
}

function ColorDot({
  color, active, onClick, title,
}: {
  color: string; active?: boolean; onClick: () => void; title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={clsx(
        'inline-flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-slate-200',
        active && 'ring-2 ring-slate-500 ring-offset-1'
      )}
    >
      <span
        className="h-4 w-4 rounded-full border border-black/15 shadow-sm"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

// Separador vertical entre grupos
function Sep() {
  return <span className="mx-0.5 h-5 w-px bg-slate-300" />;
}

// ─── InsertDateButton inline ──────────────────────────────────────────────────

function InsertDateBtn({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState('');

  const formatted = useMemo(() => {
    if (!dateValue) return '';
    const [y, m, d] = dateValue.split('-');
    return `${d}/${m}/${y}`;
  }, [dateValue]);

  const insertDate = () => {
    if (!dateValue) return;
    editor.chain().focus().insertContent(`${formatted} `).run();
    setOpen(false);
    setDateValue('');
  };

  return (
    <div className="relative">
      <Btn title="Insertar fecha" onClick={() => setOpen((p) => !p)}>
        <CalendarDays className="h-3.5 w-3.5" />
      </Btn>

      {open && (
        <div className="absolute left-0 top-9 z-30 w-60 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium text-slate-600">Insertar fecha</p>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => setDateValue(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
          {formatted && (
            <p className="mt-1.5 text-xs text-slate-500">
              Se insertará: <span className="font-medium">{formatted}</span>
            </p>
          )}
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setOpen(false); setDateValue(''); }}
              className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={insertDate}
              disabled={!dateValue}
              className="rounded bg-slate-800 px-2.5 py-1 text-xs text-white disabled:opacity-40"
            >
              Insertar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Toolbar principal ────────────────────────────────────────────────────────

type Props = {
  editor: Editor;
  showDate?: boolean; // solo Tasks usa el botón de fecha
};

export default function RichTextToolbar({ editor, showDate = false }: Props) {
  const setLink = () => {
    const prev = editor.getAttributes('link').href || '';
    const url = window.prompt('Introduce la URL', prev);
    if (url === null) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: trimmed }).run();
  };

  const setAlign = (a: 'left' | 'center' | 'right') => {
    if (editor.isActive('table')) {
      editor.chain().focus().setCurrentTableTextAlign(a).run();
      return;
    }
    editor.chain().focus().setTextAlign(a).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-b-0 border-slate-300 bg-slate-100 px-2 py-1.5">

      {/* Formato de texto */}
      <Btn title="Negrita" active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Cursiva" active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Tachado" active={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Headings */}
      <Btn title="Título H2" active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Título H3" active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Listas */}
      <Btn title="Lista con viñetas" active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Lista numerada" active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Alineación */}
      <Btn title="Alinear izquierda" active={editor.isActive({ textAlign: 'left' })}
        onClick={() => setAlign('left')}>
        <AlignLeft className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Centrar" active={editor.isActive({ textAlign: 'center' })}
        onClick={() => setAlign('center')}>
        <AlignCenter className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Alinear derecha" active={editor.isActive({ textAlign: 'right' })}
        onClick={() => setAlign('right')}>
        <AlignRight className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Color de texto */}
      <PaintBucket className="h-3 w-3 shrink-0 text-slate-400" />
      {TEXT_COLORS.map((c) => (
        <ColorDot key={c.value} color={c.value} title={c.label}
          active={editor.isActive('textStyle', { color: c.value })}
          onClick={() => editor.chain().focus().setColor(c.value).run()} />
      ))}
      <Btn title="Quitar color de texto" wide
        onClick={() => editor.chain().focus().unsetColor().run()}>
        <span className="text-xs font-bold">A</span>
      </Btn>

      <Sep />

      {/* Resaltado */}
      <Highlighter className="h-3 w-3 shrink-0 text-slate-400" />
      {HIGHLIGHT_COLORS.map((c) => (
        <ColorDot key={c.value} color={c.value} title={c.label}
          active={editor.isActive('textStyle', { backgroundColor: c.value })}
          onClick={() => editor.chain().focus().setBackgroundColor(c.value).run()} />
      ))}
      <Btn title="Quitar resaltado" wide
        onClick={() => editor.chain().focus().unsetBackgroundColor().run()}>
        <span className="text-xs">✕</span>
      </Btn>

      <Sep />

      {/* Enlace */}
      <Btn title="Insertar/editar enlace" active={editor.isActive('link')} onClick={setLink}>
        <LinkIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Quitar enlace" onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink className="h-3.5 w-3.5" />
      </Btn>

      {/* Fecha (solo si showDate) */}
      {showDate && (
        <>
          <Sep />
          <InsertDateBtn editor={editor} />
        </>
      )}

      <Sep />

      {/* Tabla */}
      <Btn title="Insertar tabla"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Table2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Añadir fila" disabled={!editor.isActive('table')}
        onClick={() => editor.chain().focus().addRowAfter().run()}>
        <Rows3 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Añadir columna" disabled={!editor.isActive('table')}
        onClick={() => editor.chain().focus().addColumnAfter().run()}>
        <Columns3 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Eliminar tabla" disabled={!editor.isActive('table')}
        onClick={() => editor.chain().focus().deleteTable().run()}>
        <Trash2 className="h-3.5 w-3.5" />
      </Btn>

      <Sep />

      {/* Mono */}
      <Btn title="Fuente monoespaciada" wide
        active={editor.isActive('textStyle', { fontFamily: MONO_FONT_FAMILY })}
        onClick={() => {
          if (editor.isActive('textStyle', { fontFamily: MONO_FONT_FAMILY })) {
            editor.chain().focus().unsetFontFamily().run();
          } else {
            editor.chain().focus().setFontFamily(MONO_FONT_FAMILY).run();
          }
        }}>
        <span className="font-mono text-xs">M</span>
      </Btn>

      <Sep />

      {/* Deshacer / Rehacer */}
      <Btn title="Deshacer"
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 className="h-3.5 w-3.5" />
      </Btn>
      <Btn title="Rehacer"
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 className="h-3.5 w-3.5" />
      </Btn>

    </div>
  );
}
