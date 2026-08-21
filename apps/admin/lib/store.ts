import {
  DEFAULT_SITE_SETTINGS,
  homeSectionToRow,
  mapBrandRow,
  mapCategoryRow,
  mapHomeSectionRow,
  mapLeadRow,
  mapPolicyPageRow,
  mapPostRow,
  mapProductRow,
  mapSiteSettingsRow,
  mediaToRow,
  productToRow,
  siteSettingsToRow,
  type Brand,
  type BrandRow,
  type Category,
  type CategoryRow,
  type HomeSection,
  type HomeSectionRow,
  type Lead,
  type LeadRow,
  type PolicyPage,
  type PolicyPageRow,
  type Post,
  type PostRow,
  type Product,
  type StockStatus,
  type ProductMedia,
  type ProductMediaRow,
  type ProductRow,
  type SiteSettings,
  type SiteSettingsRow,
} from "@ecom/shared";
import { createServerClient } from "./supabase";

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

export const PRODUCT_SORTS = {
  created_desc: { column: "created_at", ascending: false },
  name_asc: { column: "name", ascending: true },
  name_desc: { column: "name", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
} as const;

export type ProductSort = keyof typeof PRODUCT_SORTS;

export const DEFAULT_PRODUCT_SORT: ProductSort = "created_desc";

export function normalizeProductSort(value?: string | null): ProductSort {
  if (value && Object.hasOwn(PRODUCT_SORTS, value)) {
    return value as ProductSort;
  }
  return DEFAULT_PRODUCT_SORT;
}

export type ListProductsParams = {
  page?: number;
  pageSize?: number;
  sort?: ProductSort;
  filters?: {
    q?: string;
    brandId?: string;
    categoryId?: string;
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

  const sort = PRODUCT_SORTS[params.sort ?? DEFAULT_PRODUCT_SORT];

  const supabase = createServerClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_LIST_COLUMNS, { count: "exact" })
    .order(sort.column, { ascending: sort.ascending })
    .order("id", { ascending: true })
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
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
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

export type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt">;

export async function getPosts(): Promise<Post[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
  return ((data ?? []) as PostRow[]).map(mapPostRow);
}

export async function getPost(id: string): Promise<Post | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`);
  }
  if (!data) return undefined;
  return mapPostRow(data as PostRow);
}

function postFields(input: PostInput) {
  return {
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt,
    body: input.body,
    cover_url: input.coverUrl,
    cover_alt: input.coverAlt,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    author_name: input.authorName,
    is_published: input.isPublished,
    published_at: input.publishedAt,
  };
}

export async function createPost(
  input: PostInput & { id?: string },
): Promise<Post> {
  const id = input.id ?? `post-${Date.now()}`;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("posts")
    .insert({ id, ...postFields(input) })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }
  return mapPostRow(data as PostRow);
}

export async function updatePost(
  id: string,
  input: PostInput,
): Promise<Post | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("posts")
    .update({ ...postFields(input), updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }
  if (!data) return null;
  return mapPostRow(data as PostRow);
}

export async function deletePost(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("posts")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

export async function togglePostPublished(id: string): Promise<Post | null> {
  const post = await getPost(id);
  if (!post) return null;

  const isPublished = !post.isPublished;
  const publishedAt =
    isPublished && !post.publishedAt
      ? new Date().toISOString()
      : post.publishedAt;

  return updatePost(id, { ...post, isPublished, publishedAt });
}

export type PolicyPageInput = Omit<
  PolicyPage,
  "id" | "createdAt" | "updatedAt"
>;

/**
 * Postgres 42P01 = undefined_table. Xảy ra khi chủ shop chưa chạy migration
 * `20260821090000_policy_pages.sql`. Trang admin bắt mã này để hiện hướng dẫn
 * chạy migration thay vì crash trắng trang.
 */
export const POLICY_PAGES_TABLE_MISSING = "POLICY_PAGES_TABLE_MISSING";

const PG_UNDEFINED_TABLE = "42P01";
/** PostgREST trả mã này khi bảng không có trong schema cache. */
const PGRST_UNKNOWN_TABLE = "PGRST205";
const PG_UNIQUE_VIOLATION = "23505";

function isMissingTableError(error: { code?: string; message: string }): boolean {
  if (error.code === PG_UNDEFINED_TABLE) return true;
  if (error.code === PGRST_UNKNOWN_TABLE) return true;
  return /could not find the table|relation .* does not exist/i.test(
    error.message,
  );
}

function policyPageError(
  error: { code?: string; message: string },
  fallback: string,
): Error {
  if (isMissingTableError(error)) {
    return new Error(POLICY_PAGES_TABLE_MISSING);
  }
  if (error.code === PG_UNIQUE_VIOLATION) {
    return new Error("Slug này đã được dùng cho một trang chính sách khác");
  }
  return new Error(`${fallback}: ${error.message}`);
}

function policyPageFields(input: PolicyPageInput) {
  return {
    title: input.title,
    slug: input.slug,
    body: input.body,
    meta_title: input.metaTitle,
    meta_description: input.metaDescription,
    sort_order: input.sortOrder,
    is_published: input.isPublished,
  };
}

export async function listPolicyPages(): Promise<PolicyPage[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .select("*")
    .order("sort_order")
    .order("title");

  if (error) {
    throw policyPageError(error, "Failed to fetch policy pages");
  }
  return ((data ?? []) as PolicyPageRow[]).map(mapPolicyPageRow);
}

export async function getPolicyPageById(
  id: string,
): Promise<PolicyPage | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw policyPageError(error, "Failed to fetch policy page");
  }
  if (!data) return undefined;
  return mapPolicyPageRow(data as PolicyPageRow);
}

/**
 * Id đọc được theo slug (`policy-bao-hanh`) thay vì timestamp như products —
 * slug là unique nên id theo slug vẫn duy nhất. Nếu id đã bị chiếm (slug cũ bị
 * đổi rồi tạo lại) thì thêm hậu tố số.
 */
async function nextPolicyPageId(slug: string): Promise<string> {
  const base = `policy-${slug}`;
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .select("id")
    .like("id", `${base}%`);

  if (error) {
    throw policyPageError(error, "Failed to check policy page id");
  }

  const taken = new Set(((data ?? []) as { id: string }[]).map((r) => r.id));
  if (!taken.has(base)) return base;

  for (let suffix = 2; suffix <= 50; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export async function createPolicyPage(
  input: PolicyPageInput,
): Promise<PolicyPage> {
  const id = await nextPolicyPageId(input.slug);
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("policy_pages")
    .insert({ id, ...policyPageFields(input) })
    .select("*")
    .single();

  if (error) {
    throw policyPageError(error, "Failed to create policy page");
  }
  return mapPolicyPageRow(data as PolicyPageRow);
}

export async function updatePolicyPage(
  id: string,
  input: PolicyPageInput,
): Promise<PolicyPage | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("policy_pages")
    .update({
      ...policyPageFields(input),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw policyPageError(error, "Failed to update policy page");
  }
  if (!data) return null;
  return mapPolicyPageRow(data as PolicyPageRow);
}

export async function deletePolicyPage(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const { error, count } = await supabase
    .from("policy_pages")
    .delete({ count: "exact" })
    .eq("id", id);

  if (error) {
    throw policyPageError(error, "Failed to delete policy page");
  }
  return (count ?? 0) > 0;
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

export async function updateCategory(
  id: string,
  input: Omit<Category, "id">,
): Promise<Category | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("categories")
    .update({
      name: input.name,
      slug: input.slug,
      parent_id: input.parentId,
      sort_order: input.sortOrder,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`);
  }
  if (!data) return null;
  return mapCategoryRow(data as CategoryRow);
}

export async function reorderCategories(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const supabase = createServerClient();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("categories")
        .update({ sort_order: index + 1 })
        .eq("id", id),
    ),
  );

  for (const res of results) {
    if (res.error) {
      throw new Error(`Failed to reorder categories: ${res.error.message}`);
    }
  }
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
