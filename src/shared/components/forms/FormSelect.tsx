import { SelectHTMLAttributes } from 'react';

type Props = SelectHTMLAttributes<HTMLSelectElement>;
export function FormSelect(props: Props) {
  return (
    <select {...props} className="border border-slate-200 w-full p-2">
      {props.children}
    </select>
  );
}
