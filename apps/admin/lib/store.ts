import {
  imageToRow,
  mapBrandRow,
  mapCategoryRow,
  mapLeadRow,
  mapProductRow,
  productToRow,
  type Brand,
  type BrandRow,
  type Category,
  type CategoryRow,
  type Lead,
  type LeadRow,
  type Product,
  type ProductImage,
  type ProductImageRow,
  type ProductRow,
} from "@ecom/shared";
import {
  PRODUCT_IMAGES_BUCKET,
  createServerClient,
} from "./supabase";

type ProductWithImages = ProductRow & {
  product_images?: ProductImageRow[] | null;
};

function mapProductWithImages(row: ProductWithImages): Product {
  const { product_images, ...product } = row;
  return mapProductRow(product, product_images ?? []);
}

async function replaceProductImages(
  productId: string,
  images: ProductImage[],
): Promise<void> {
  const supabase = createServerClient();
  const { error: delError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (delError) {
    throw new Error(`Failed to clear product images: ${delError.message}`);
  }

  if (images.length === 0) return;

  const rows = images.map((img, index) =>
    imageToRow({
      ...img,
      id: img.id || `${productId}-img-${index}`,
      productId,
      sortOrder: img.sortOrder ?? index,
    }),
  );

  const { error: insError } = await supabase
    .from("product_images")
    .insert(rows);
  if (insError) {
    throw new Error(`Failed to insert product images: ${insError.message}`);
  }
}

/** Upload a file to the public `product-images` bucket; returns public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createServerClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
  return ((data ?? []) as ProductWithImages[]).map(mapProductWithImages);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  if (!data) return undefined;
  return mapProductWithImages(data as ProductWithImages);
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

export async function getLeads(): Promise<Lead[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    throw new Error(`Failed to fetch leads: ${error.message}`);
  }
  return ((data ?? []) as LeadRow[]).map(mapLeadRow);
}

export async function createProduct(
  input: Omit<Product, "id">,
): Promise<Product> {
  const id = `prod-${Date.now()}`;
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

  const images = input.images.map((img, i) => ({
    ...img,
    id: `${id}-img-${i}`,
    productId: id,
    sortOrder: i,
  }));
  await replaceProductImages(id, images);

  return mapProductRow(data as ProductRow, images.map(imageToRow));
}

export async function updateProduct(
  id: string,
  input: Partial<Product>,
): Promise<Product | null> {
  const existing = await getProduct(id);
  if (!existing) return null;

  const merged: Product = { ...existing, ...input, id };
  const { images, ...rest } = merged;
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
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  if (input.images) {
    const normalized = input.images.map((img, i) => ({
      ...img,
      id: img.id || `${id}-img-${i}`,
      productId: id,
      sortOrder: img.sortOrder ?? i,
    }));
    await replaceProductImages(id, normalized);
    return mapProductRow(data as ProductRow, normalized.map(imageToRow));
  }

  const { data: imageRows, error: imgError } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", id)
    .order("sort_order");

  if (imgError) {
    throw new Error(`Failed to fetch product images: ${imgError.message}`);
  }

  return mapProductRow(data as ProductRow, (imageRows ?? []) as ProductImageRow[]);
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
    .insert({ id, name: input.name, slug: input.slug })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create brand: ${error.message}`);
  }
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

export async function getDashboardCounts() {
  const [products, brands, leads] = await Promise.all([
    getProducts(),
    getBrands(),
    getLeads(),
  ]);

  return {
    products: products.length,
    published: products.filter((p) => p.isPublished).length,
    brands: brands.length,
    leads: leads.length,
  };
}
