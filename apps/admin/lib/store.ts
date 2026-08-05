import {
  DEFAULT_SITE_SETTINGS,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
  homeSectionToRow,
  mapBrandRow,
  mapCategoryRow,
  mapHomeSectionRow,
  mapLeadRow,
  mapProductRow,
  mapSiteSettingsRow,
  mediaToRow,
  productToRow,
  siteSettingsToRow,
  storagePathFromPublicUrl,
  type Brand,
  type BrandRow,
  type Category,
  type CategoryRow,
  type HomeSection,
  type HomeSectionRow,
  type Lead,
  type LeadRow,
  type Product,
  type StockStatus,
  type ProductMedia,
  type ProductMediaRow,
  type ProductRow,
  type SiteSettings,
  type SiteSettingsRow,
} from "@ecom/shared";
import {
  PRODUCT_IMAGES_BUCKET,
  createServerClient,
} from "./supabase";

type ProductWithMedia = ProductRow & {
  product_media?: ProductMediaRow[] | null;
};

function mapProductWithMedia(row: ProductWithMedia): Product {
  const { product_media, ...product } = row;
  return mapProductRow(product, product_media ?? []);
}

async function replaceProductMedia(
  productId: string,
  media: ProductMedia[],
): Promise<void> {
  const supabase = createServerClient();
  const { error: delError } = await supabase
    .from("product_media")
    .delete()
    .eq("product_id", productId);
  if (delError) {
    throw new Error(`Failed to clear product media: ${delError.message}`);
  }

  if (media.length === 0) return;

  const rows = media.map((item, index) =>
    mediaToRow({
      ...item,
      id: item.id || `${productId}-media-${index}`,
      productId,
      sortOrder: item.sortOrder ?? index,
    }),
  );

  const { error: insError } = await supabase.from("product_media").insert(rows);
  if (insError) {
    throw new Error(`Failed to insert product media: ${insError.message}`);
  }
}

export type MediaKind = "image" | "video" | "other";

export type MediaAsset = {
  path: string;
  url: string;
  name: string;
  size: number | null;
  kind: MediaKind;
  updatedAt: string | null;
};

const IMAGE_EXT = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "svg",
  "bmp",
]);
const VIDEO_EXT = new Set(["mp4", "webm", "mov", "ogg", "m4v"]);
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "image/bmp",
]);

const ALLOWED_VIDEO_MIME = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/ogg",
  "video/x-m4v",
]);

function validateUploadFile(file: File): void {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `File "${file.name}" vượt quá ${MAX_UPLOAD_MB}MB (giới hạn upload)`,
    );
  }

  const kind = mediaKindFromName(file.name);
  if (kind === "other") {
    throw new Error(`File "${file.name}" không phải ảnh hoặc video`);
  }

  if (file.type) {
    if (kind === "image" && !ALLOWED_IMAGE_MIME.has(file.type)) {
      throw new Error(`Định dạng ảnh không hỗ trợ: ${file.type}`);
    }
    if (kind === "video" && !ALLOWED_VIDEO_MIME.has(file.type)) {
      throw new Error(`Định dạng video không hỗ trợ: ${file.type}`);
    }
  }
}


function mediaKindFromName(name: string): MediaKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (IMAGE_EXT.has(ext)) return "image";
  if (VIDEO_EXT.has(ext)) return "video";
  return "other";
}

function publicUrlFor(path: string): string {
  const supabase = createServerClient();
  return supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    .data.publicUrl;
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadProductMedia(file, "img");
}

export async function uploadProductMedia(
  file: File,
  prefix = "media",
): Promise<string> {
  validateUploadFile(file);

  const supabase = createServerClient();
  const kind = mediaKindFromName(file.name);
  const folder =
    prefix === "img" || prefix === "video" || prefix === "media"
      ? prefix
      : kind === "video"
        ? "video"
        : "img";
  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Failed to upload media: ${error.message}`);
  }

  return publicUrlFor(path);
}

export type ListMediaParams = {
  filter?: "image" | "video" | "all";
  q?: string;
  page?: number;
  pageSize?: number;
};

export type ListMediaResult = {
  items: MediaAsset[];
  total: number;
  page: number;
  pageSize: number;
};

export async function listMediaAssets(
  filterOrParams: "image" | "video" | "all" | ListMediaParams = "all",
): Promise<ListMediaResult> {
  const params: ListMediaParams =
    typeof filterOrParams === "string"
      ? { filter: filterOrParams }
      : filterOrParams;
  const filter = params.filter ?? "all";
  const q = params.q?.trim().toLowerCase() ?? "";
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 24));

  const supabase = createServerClient();
  const folders =
    filter === "image"
      ? ["img", "media", ""]
      : filter === "video"
        ? ["video", "media", ""]
        : ["img", "video", "media", ""];

  const folderResults = await Promise.all(
    folders.map(async (folder) => {
      const { data, error } = await supabase.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .list(folder || undefined, {
          limit: 200,
          sortBy: { column: "created_at", order: "desc" },
        });
      if (error) {
        console.error("listMediaAssets(" + folder + "):", error.message);
        return [] as MediaAsset[];
      }
      const assets: MediaAsset[] = [];
      for (const item of data ?? []) {
        if (!item.name || item.id == null) continue;
        const storagePath = folder ? folder + "/" + item.name : item.name;
        const kind = mediaKindFromName(item.name);
        if (filter === "image" && kind !== "image") continue;
        if (filter === "video" && kind !== "video") continue;
        assets.push({
          path: storagePath,
          url: publicUrlFor(storagePath),
          name: item.name,
          size: item.metadata?.size ?? null,
          kind,
          updatedAt: item.updated_at ?? item.created_at ?? null,
        });
      }
      return assets;
    }),
  );

  const seen = new Set<string>();
  const all = folderResults
    .flat()
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))
    .filter((a) => {
      if (seen.has(a.path)) return false;
      seen.add(a.path);
      return true;
    })
    .filter((a) => {
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) || a.path.toLowerCase().includes(q)
      );
    });

  const total = all.length;
  const from = (page - 1) * pageSize;
  return {
    items: all.slice(from, from + pageSize),
    total,
    page,
    pageSize,
  };
}

export type MediaUsageRef = {
  mediaId: string;
  productId: string;
  productName: string;
};

export type MediaUsage = {
  path: string;
  refs: MediaUsageRef[];
};

const MEDIA_REF_COLUMNS = "id, url, storage_path, product_id";

type MediaRefRow = {
  id: string;
  url: string;
  storage_path: string | null;
  product_id: string;
};

export async function findMediaUsage(paths: string[]): Promise<MediaUsage[]> {
  const wanted = [...new Set(paths.filter(Boolean))];
  if (wanted.length === 0) return [];

  const supabase = createServerClient();

  const [matched, legacy] = await Promise.all([
    supabase.from("product_media").select(MEDIA_REF_COLUMNS).in(
      "storage_path",
      wanted,
    ),
    supabase
      .from("product_media")
      .select(MEDIA_REF_COLUMNS)
      .is("storage_path", null),
  ]);

  for (const res of [matched, legacy]) {
    if (res.error) {
      throw new Error(`Failed to check media usage: ${res.error.message}`);
    }
  }

  const wantedSet = new Set(wanted);
  const byPath = new Map<string, MediaRefRow[]>();
  const collect = (row: MediaRefRow, path: string | null) => {
    if (!path || !wantedSet.has(path)) return;
    const list = byPath.get(path);
    if (list) list.push(row);
    else byPath.set(path, [row]);
  };

  for (const row of (matched.data ?? []) as MediaRefRow[]) {
    collect(row, row.storage_path);
  }
  for (const row of (legacy.data ?? []) as MediaRefRow[]) {
    collect(row, storagePathFromPublicUrl(row.url));
  }

  if (byPath.size === 0) return [];

  const productIds = [
    ...new Set([...byPath.values()].flat().map((row) => row.product_id)),
  ];
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);
  if (prodError) {
    throw new Error(`Failed to check media usage: ${prodError.message}`);
  }

  const nameById = new Map(
    ((products ?? []) as { id: string; name: string }[]).map((p) => [
      p.id,
      p.name,
    ]),
  );

  return wanted
    .filter((path) => byPath.has(path))
    .map((path) => ({
      path,
      refs: (byPath.get(path) ?? []).map((row) => ({
        mediaId: row.id,
        productId: row.product_id,
        productName: nameById.get(row.product_id) ?? row.product_id,
      })),
    }));
}

export async function purgeMediaReferences(paths: string[]): Promise<number> {
  const usage = await findMediaUsage(paths);
  const mediaIds = usage.flatMap((u) => u.refs.map((r) => r.mediaId));
  if (mediaIds.length === 0) return 0;

  const supabase = createServerClient();
  const { error } = await supabase
    .from("product_media")
    .delete()
    .in("id", mediaIds);
  if (error) {
    throw new Error(`Failed to clear media references: ${error.message}`);
  }
  return mediaIds.length;
}

export type DeleteMediaResult = {
  deleted: number;
  referencesRemoved: number;
};

export async function deleteMediaAsset(
  path: string,
  opts: { purgeReferences?: boolean } = {},
): Promise<DeleteMediaResult> {
  return deleteMediaAssets([path], opts);
}

export async function deleteMediaAssets(
  paths: string[],
  opts: { purgeReferences?: boolean } = {},
): Promise<DeleteMediaResult> {
  if (paths.length === 0) return { deleted: 0, referencesRemoved: 0 };

  const referencesRemoved = opts.purgeReferences
    ? await purgeMediaReferences(paths)
    : 0;

  const supabase = createServerClient();
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove(paths);
  if (error) {
    throw new Error(`Failed to delete media: ${error.message}`);
  }

  return { deleted: paths.length, referencesRemoved };
}


export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  model: string;
  brandId: string;
  categoryId: string;
  price: number;
  salePrice: number | null;
  stockStatus: StockStatus;
  isPublished: boolean;
};

export type ListProductsParams = {
  page?: number;
  pageSize?: number;
  filters?: {
    q?: string;
    brandId?: string;
    published?: string;
  };
};

export type ListProductsResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

const PRODUCT_LIST_COLUMNS =
  "id, name, slug, model, brand_id, category_id, price, sale_price, stock_status, is_published";

function mapProductListRow(row: {
  id: string;
  name: string;
  slug: string;
  model: string;
  brand_id: string;
  category_id: string;
  price: number | string;
  sale_price: number | string | null;
  stock_status: StockStatus;
  is_published: boolean;
}): ProductListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    model: row.model,
    brandId: row.brand_id,
    categoryId: row.category_id,
    price: Number(row.price),
    salePrice: row.sale_price == null ? null : Number(row.sale_price),
    stockStatus: row.stock_status,
    isPublished: row.is_published,
  };
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ListProductsResult> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const filters = params.filters ?? {};
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = filters.q?.trim();
  if (q) {
    const escaped = q.replace(/[%_,]/g, (ch) => "\\" + ch);
    query = query.or(
      "name.ilike.%" + escaped + "%,model.ilike.%" + escaped + "%,slug.ilike.%" + escaped + "%",
    );
  }
  if (filters.brandId) {
    query = query.eq("brand_id", filters.brandId);
  }
  if (filters.published === "1") {
    query = query.eq("is_published", true);
  } else if (filters.published === "0") {
    query = query.eq("is_published", false);
  }

  const { data, error, count } = await query;
  if (error) {
    throw new Error("Failed to list products: " + error.message);
  }

  return {
    items: ((data ?? []) as Parameters<typeof mapProductListRow>[0][]).map(
      mapProductListRow,
    ),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_media(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  return ((data ?? []) as ProductWithMedia[]).map(mapProductWithMedia);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_media(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  if (!data) return undefined;
  return mapProductWithMedia(data as ProductWithMedia);
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .order("name");
  if (error) {
    throw new Error(`Failed to fetch brands: ${error.message}`);
  }
  return ((data ?? []) as BrandRow[]).map(mapBrandRow);
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
  return ((data ?? []) as CategoryRow[]).map(mapCategoryRow);
}

export type LeadWithProductName = Lead & { productName: string };

export async function getLeads(): Promise<Lead[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error("Failed to fetch leads: " + error.message);
  }
  return ((data ?? []) as LeadRow[]).map(mapLeadRow);
}

export async function getLeadsWithProductNames(): Promise<LeadWithProductName[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch leads: " + error.message);
  }

  type LeadJoinRow = LeadRow & {
    products: { name: string } | { name: string }[] | null;
  };

  return ((data ?? []) as LeadJoinRow[]).map((row) => {
    const lead = mapLeadRow(row);
    const joined = row.products;
    const productName = Array.isArray(joined)
      ? (joined[0]?.name ?? lead.productId ?? "—")
      : (joined?.name ?? (lead.productId ? lead.productId : "—"));
    return { ...lead, productName };
  });
}

export async function createProduct(
  input: Omit<Product, "id"> & { id?: string },
): Promise<Product> {
  const id = input.id ?? `prod-${Date.now()}`;
  const supabase = createServerClient();
  const row = productToRow({ ...input, id });

  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  const media = input.media.map((item, i) => ({
    ...item,
    id: item.id || `${id}-media-${i}`,
    productId: id,
    sortOrder: i,
  }));
  await replaceProductMedia(id, media);

  return mapProductRow(data as ProductRow, media.map(mediaToRow));
}

export async function updateProduct(
  id: string,
  input: Partial<Product>,
): Promise<Product | null> {
  const existing = await getProduct(id);
  if (!existing) return null;

  const merged: Product = { ...existing, ...input, id };
  const { media, ...rest } = merged;
  const row = productToRow(rest);

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: row.name,
      slug: row.slug,
      model: row.model,
      brand_id: row.brand_id,
      category_id: row.category_id,
      price: row.price,
      sale_price: row.sale_price,
      stock_status: row.stock_status,
      sold_count: row.sold_count,
      warranty: row.warranty,
      origin: row.origin,
      motor: row.motor,
      specs: row.specs,
      is_published: row.is_published,
      description: row.description,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      seo_keywords: row.seo_keywords,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  if (input.media) {
    const normalized = input.media.map((item, i) => ({
      ...item,
      id: item.id || `${id}-media-${i}`,
      productId: id,
      sortOrder: item.sortOrder ?? i,
    }));
    await replaceProductMedia(id, normalized);
    return mapProductRow(data as ProductRow, normalized.map(mediaToRow));
  }

  const { data: mediaRows, error: mediaError } = await supabase
    .from("product_media")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  if (mediaError) {
    throw new Error(`Failed to fetch product media: ${mediaError.message}`);
  }

  return mapProductRow(data as ProductRow, (mediaRows ?? []) as ProductMediaRow[]);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("products")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function toggleProductPublished(
  id: string,
): Promise<Product | null> {
  const product = await getProduct(id);
  if (!product) return null;
  return updateProduct(id, { isPublished: !product.isPublished });
}

export async function createBrand(input: Omit<Brand, "id">): Promise<Brand> {
  const id = `brand-${Date.now()}`;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("brands")
    .insert({
      id,
      name: input.name,
      slug: input.slug,
      description: input.description,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create brand: ${error.message}`);
  }
  return mapBrandRow(data as BrandRow);
}

export async function updateBrand(
  id: string,
  input: Omit<Brand, "id">,
): Promise<Brand | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("brands")
    .update({
      name: input.name,
      slug: input.slug,
      description: input.description,
      meta_title: input.metaTitle,
      meta_description: input.metaDescription,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update brand: ${error.message}`);
  }
  if (!data) return null;
  return mapBrandRow(data as BrandRow);
}

export async function deleteBrand(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("brands")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete brand: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function createCategory(
  input: Omit<Category, "id">,
): Promise<Category> {
  const id = `cat-${Date.now()}`;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      id,
      name: input.name,
      slug: input.slug,
      parent_id: input.parentId,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create category: ${error.message}`);
  }
  return mapCategoryRow(data as CategoryRow);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("categories")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete category: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function listHomeSections(): Promise<HomeSection[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("home_sections")
    .select("*")
    .order("sort_order");

  if (error) {
    throw new Error(`Failed to fetch home sections: ${error.message}`);
  }
  return ((data ?? []) as HomeSectionRow[]).map(mapHomeSectionRow);
}

export async function createHomeSection(
  input: Omit<HomeSection, "id">,
): Promise<HomeSection> {
  const id = `home-section-${Date.now()}`;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("home_sections")
    .insert(homeSectionToRow({ ...input, id }))
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create home section: ${error.message}`);
  }
  return mapHomeSectionRow(data as HomeSectionRow);
}

export async function updateHomeSection(
  id: string,
  input: Omit<HomeSection, "id">,
): Promise<HomeSection | null> {
  const row = homeSectionToRow(input);
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("home_sections")
    .update({
      title: row.title,
      kind: row.kind,
      category_id: row.category_id,
      product_limit: row.product_limit,
      style: row.style,
      sort_order: row.sort_order,
      is_published: row.is_published,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update home section: ${error.message}`);
  }
  if (!data) return null;
  return mapHomeSectionRow(data as HomeSectionRow);
}

export async function deleteHomeSection(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("home_sections")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete home section: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function reorderHomeSections(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const supabase = createServerClient();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("home_sections")
        .update({ sort_order: index + 1 })
        .eq("id", id),
    ),
  );

  for (const res of results) {
    if (res.error) {
      throw new Error(`Failed to reorder home sections: ${res.error.message}`);
    }
  }
}

export async function getDashboardCounts() {
  const supabase = createServerClient();

  const [productsRes, publishedRes, brandsRes, leadsRes] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("brands").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }),
  ]);

  for (const res of [productsRes, publishedRes, brandsRes, leadsRes]) {
    if (res.error) {
      throw new Error(`Failed to count dashboard: ${res.error.message}`);
    }
  }

  return {
    products: productsRes.count ?? 0,
    published: publishedRes.count ?? 0,
    brands: brandsRes.count ?? 0,
    leads: leadsRes.count ?? 0,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("getSiteSettings:", error.message);
    return DEFAULT_SITE_SETTINGS;
  }
  if (!data) return DEFAULT_SITE_SETTINGS;
  return mapSiteSettingsRow(data as SiteSettingsRow);
}

export async function updateSiteSettings(
  input: Omit<SiteSettings, "id" | "updatedAt">,
): Promise<SiteSettings> {
  const supabase = createServerClient();
  const row = siteSettingsToRow({ ...input, id: 1 });
  const { data, error } = await supabase
    .from("site_settings")
    .upsert({
      ...row,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update site settings: ${error.message}`);
  }
  return mapSiteSettingsRow(data as SiteSettingsRow);
}
