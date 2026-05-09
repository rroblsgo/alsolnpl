import clsx from 'clsx';
import { LabelHTMLAttributes } from 'react';

type Props = LabelHTMLAttributes<HTMLLabelElement>;

export function FormLabel(props: Props) {
  return (
    <label {...props} className={clsx('mt-10 space-y-3', props.className)}>
      {props.children}
    </label>
  );
}
