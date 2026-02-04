import * as React from "react";
import { clsx } from "clsx";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={clsx(
        "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm outline-none ring-offset-white focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-100",
        className
      )}
      {...props}
    />
  );
}
