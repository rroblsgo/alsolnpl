import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

export function FormInput(props: Props) {
  return (
    <input
      {...props}
      className={clsx(
        'border border-slate-300 w-full p-2 rounded',
        props.className
      )}
    />
  );
}
