import { env } from "../config/env.js";

export function buildPreviewUrl(siteId: string): string {
  return `${env.PUBLIC_BASE_URL}/api/sites/${siteId}`;
}

export function buildPublishUrl(slug: string): string {
  return `${env.PUBLIC_SITE_BASE_URL}/sites/${slug}`;
}
