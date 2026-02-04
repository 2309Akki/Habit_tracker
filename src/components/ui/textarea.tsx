import * as React from "react";
import { clsx } from "clsx";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={clsx(
        "min-h-24 w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-offset-white focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-100",
        className
      )}
      {...props}
    />
  );
}
