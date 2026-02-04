export function uid(prefix?: string) {
  const value = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  return prefix ? `${prefix}_${value}` : value;
}
