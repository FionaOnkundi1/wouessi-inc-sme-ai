import { notFound } from "next/navigation";
import PublicSite from "../../../../components/PublicSite";
import {
  buildSiteMetadata,
  fetchPublishedSite,
  resolvePage
} from "../../../../lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug, page } = await params;
  const currentPage = resolvePage(page);
  const site = await fetchPublishedSite(slug);

  if (!site || !currentPage) {
    return {
      title: "Website not found | Wouessi",
      robots: { index: false, follow: false }
    };
  }

  return buildSiteMetadata(site, currentPage);
}

export default async function PublishedSitePage({ params }) {
  const { slug, page } = await params;
  const currentPage = resolvePage(page);
  const site = await fetchPublishedSite(slug);

  if (!site || !currentPage) {
    notFound();
  }

  return <PublicSite site={site} currentPage={currentPage} />;
}
