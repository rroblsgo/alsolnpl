import { TextareaHTMLAttributes } from 'react';

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextarea(props: Props) {
  return (
    <textarea {...props} className="border border-slate-200 w-full p-2 h-40" />
  );
}
