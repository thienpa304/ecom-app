import {
  seedBrands,
  seedCategories,
  seedLeads,
  seedProducts,
  type Brand,
  type Category,
  type Lead,
  type Product,
} from "@ecom/shared";

type Store = {
  products: Product[];
  brands: Brand[];
  categories: Category[];
  leads: Lead[];
};

const globalForStore = globalThis as unknown as { __ecomAdminStore?: Store };

function createStore(): Store {
  return {
    products: structuredClone(seedProducts),
    brands: structuredClone(seedBrands),
    categories: structuredClone(seedCategories),
    leads: structuredClone(seedLeads),
  };
}

function getStore(): Store {
  if (!globalForStore.__ecomAdminStore) {
    globalForStore.__ecomAdminStore = createStore();
  }
  return globalForStore.__ecomAdminStore;
}

export function getProducts(): Product[] {
  return getStore().products;
}

export function getProduct(id: string): Product | undefined {
  return getStore().products.find((p) => p.id === id);
}

export function getBrands(): Brand[] {
  return getStore().brands;
}

export function getCategories(): Category[] {
  return getStore().categories;
}

export function getLeads(): Lead[] {
  return getStore().leads;
}

export function createProduct(input: Omit<Product, "id">): Product {
  const product: Product = { ...input, id: `prod-${Date.now()}` };
  getStore().products.unshift(product);
  return product;
}

export function updateProduct(id: string, input: Partial<Product>): Product | null {
  const store = getStore();
  const idx = store.products.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  store.products[idx] = { ...store.products[idx], ...input, id };
  return store.products[idx];
}

export function deleteProduct(id: string): boolean {
  const store = getStore();
  const before = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  return store.products.length < before;
}

export function toggleProductPublished(id: string): Product | null {
  const product = getProduct(id);
  if (!product) return null;
  return updateProduct(id, { isPublished: !product.isPublished });
}

export function createBrand(input: Omit<Brand, "id">): Brand {
  const brand: Brand = { ...input, id: `brand-${Date.now()}` };
  getStore().brands.push(brand);
  return brand;
}

export function deleteBrand(id: string): boolean {
  const store = getStore();
  const before = store.brands.length;
  store.brands = store.brands.filter((b) => b.id !== id);
  return store.brands.length < before;
}

export function createCategory(input: Omit<Category, "id">): Category {
  const category: Category = { ...input, id: `cat-${Date.now()}` };
  getStore().categories.push(category);
  return category;
}

export function deleteCategory(id: string): boolean {
  const store = getStore();
  const before = store.categories.length;
  store.categories = store.categories.filter((c) => c.id !== id);
  return store.categories.length < before;
}

export function getDashboardCounts() {
  const store = getStore();
  return {
    products: store.products.length,
    published: store.products.filter((p) => p.isPublished).length,
    brands: store.brands.length,
    leads: store.leads.length,
  };
}
