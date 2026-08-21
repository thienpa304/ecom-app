import { NextResponse } from "next/server";
import {
  mapProductRow,
  videoMedia,
  type ProductMediaRow,
  type ProductRow,
} from "@ecom/shared";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;
const MAX_SUGGESTIONS = 6;

export type SearchSuggestItem = {
  name: string;
  slug: string;
  model: string;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  hasVideo: boolean;
};

type ProductWithMedia = ProductRow & {
  product_media?: ProductMediaRow[] | null;
};

function sanitizeQuery(value: string): string {
  return value
    .replace(/[%_",]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toSuggestion(row: ProductWithMedia): SearchSuggestItem {
  const { product_media, ...productRow } = row;
  const product = mapProductRow(productRow, product_media ?? []);
  const firstImage = product.media.find((item) => item.kind === "image");
  const hasVideo = videoMedia(product).length > 0;

  return {
    name: product.name,
    slug: product.slug,
    model: product.model,
    price: product.price,
    salePrice: product.salePrice,
    imageUrl: firstImage?.url ?? null,
    hasVideo,
  };
}

export async function GET(request: Request): Promise<NextResponse> {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const safe = sanitizeQuery(raw);

  if (safe.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ items: [] });
  }

  const pattern = `%${safe}%`;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_media(*)")
      .eq("is_published", true)
      .or(`name.ilike."${pattern}",model.ilike."${pattern}"`)
      .order("sold_count", { ascending: false, nullsFirst: false })
      .limit(MAX_SUGGESTIONS);

    if (error) {
      console.error("search-suggest:", error.message);
      return NextResponse.json({ items: [] }, { status: 502 });
    }

    const items = ((data ?? []) as ProductWithMedia[]).map(toSuggestion);
    return NextResponse.json({ items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("search-suggest:", message);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}
