import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { stripHtml } from "@ecom/shared";
import { ArticleBody } from "@/components/ArticleBody";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import {
  getPolicyPageBySlug,
  getSiteSettings,
  listPolicyPages,
} from "@/lib/data";
import { breadcrumbJsonLd, siteShareImage } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 60;

const META_DESCRIPTION_MAX = 160;

function derivedDescription(body: string): string {
  const plain = stripHtml(body).replace(/\s+/g, " ").trim();
  if (plain.length <= META_DESCRIPTION_MAX) return plain;
  return `${plain.slice(0, META_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export async function generateStaticParams() {
  const pages = await listPolicyPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPolicyPageBySlug(slug);
  if (!page) return { title: "Không tìm thấy trang" };

  const path = `/chinh-sach/${page.slug}`;
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || derivedDescription(page.body);
  const settings = await getSiteSettings();

  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      type: "article",
      images: siteShareImage(settings),
    },
  };
}

export default async function PolicyPageDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, others] = await Promise.all([
    getPolicyPageBySlug(slug),
    listPolicyPages(),
  ]);

  if (!page) notFound();

  const siblings = others.filter((item) => item.slug !== page.slug);
  const crumbs = [
    { name: "Trang chủ", path: "/" },
    { name: "Hỗ trợ khách hàng" },
    { name: page.title },
  ];

  return (
    <div className="container-page py-4 sm:py-6">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />

      <Breadcrumb items={crumbs} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article className="min-w-0">
          <header className="mb-4 border-b-2 border-gray-100 pb-3">
            <h1 className="text-xl font-extrabold uppercase tracking-wide text-brand sm:text-2xl">
              {page.title}
            </h1>
          </header>

          <ArticleBody html={page.body} />
        </article>

        {siblings.length > 0 ? (
          <aside className="min-w-0">
            <div className="rounded-lg border border-gray-200 bg-white">
              <h2 className="border-b border-gray-100 px-4 py-3 text-sm font-bold uppercase text-gray-900">
                Hỗ trợ khách hàng
              </h2>
              <ul className="min-w-0 divide-y divide-gray-100">
                {siblings.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/chinh-sach/${item.slug}`}
                      className="block break-words px-4 py-2.5 text-sm text-gray-600 transition hover:bg-orange-50 hover:text-accent"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
