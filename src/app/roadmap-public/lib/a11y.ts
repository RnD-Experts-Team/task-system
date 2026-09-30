// ─── Accessibility helpers ─────────────────────────────────────────

/** aria-describedby value for a control rendered inside <Field>. */
export function describedBy(id: string, { hint, error }: { hint?: string; error?: string }): string | undefined {
  const ids = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean)
  return ids.length ? ids.join(" ") : undefined
}
