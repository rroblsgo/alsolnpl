import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement>;

export function FormSubmit(props: Props) {
  return (
    <input
      {...props}
      type="submit"
      className={clsx(
        'bg-pink-600 w-full font-black p-2 rounded uppercase cursor-pointer mt-5',
        props.className
      )}
    />
  );
}
