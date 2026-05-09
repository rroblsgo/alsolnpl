'use client';

import { useMemo, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { CalendarDays } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  editor: Editor;
};

function formatDateForDisplay(value: string) {
  if (!value) return '';

  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function InsertDateButton({ editor }: Props) {
  const [open, setOpen] = useState(false);
  const [dateValue, setDateValue] = useState('');

  const formatted = useMemo(() => formatDateForDisplay(dateValue), [dateValue]);

  const insertDate = () => {
    if (!dateValue) return;

    editor
      .chain()
      .focus()
      // .insertContent(
      //   `<time datetime="${dateValue}" class="task-date">${formatted}</time>&nbsp;`
      // )
      .insertContent(`${formatted} `)
      .run();

    setOpen(false);
    setDateValue('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        title="Insertar fecha"
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 transition hover:bg-slate-100'
        )}
      >
        <CalendarDays className="h-4 w-4" />
      </button>

      {open ? (
        <div className="absolute left-0 top-11 z-20 w-64 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Selecciona una fecha
            </label>

            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />

            {formatted ? (
              <p className="text-sm text-slate-600">
                Se insertará: <span className="font-medium">{formatted}</span>
              </p>
            ) : null}

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDateValue('');
                }}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={insertDate}
                disabled={!dateValue}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
              >
                Insertar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
