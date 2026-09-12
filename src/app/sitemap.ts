import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { getAllSitemapEntries, getSitemapChunkCount, SITEMAP_CHUNK_SIZE } from "@/lib/sitemapUrls";

// Force full static prerendering at build time (every chunk id from
// generateSitemaps() below is enumerable ahead of time, so Next.js can and
// should generate real static XML files, not render on-demand per request).
// Without this, Google Search Console repeatedly failed to fetch the sitemap
// ("Hämtning misslyckades") despite the endpoint responding correctly to every
// manual/curl check — the response carried a `Vary: rsc, next-router-state-tree,
// ...` header characteristic of Next.js's dynamic RSC rendering path, unusual
// for a large (8MB+) plain-XML file and a likely culprit for an inconsistent
// crawl fetch. This makes the sitemap a genuinely static asset.
export const dynamic = "force-static";

export async function generateSitemaps() {
  return Array.from({ length: getSitemapChunkCount() }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const chunkId = Number(await id);
  const start = chunkId * SITEMAP_CHUNK_SIZE;
  const entries = getAllSitemapEntries().slice(start, start + SITEMAP_CHUNK_SIZE);

  return entries.map(({ path, priority, changeFrequency, lastModified }) => ({
    url: absoluteUrl(path),
    changeFrequency,
    priority,
    ...(lastModified ? { lastModified } : {}),
  }));
}
