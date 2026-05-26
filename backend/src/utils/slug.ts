export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "generated-site";
}

export function uniqueSlug(base: string): string {
  return `${slugify(base)}-${crypto.randomUUID().slice(0, 8)}`;
}
