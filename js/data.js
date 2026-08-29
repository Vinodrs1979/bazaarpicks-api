/* ============================================================
   BazaarPicks — shared data layer
   Everything is stored in the browser's localStorage so the
   admin panel and the storefront stay in sync on this device.
   ============================================================ */

const STORE_KEYS = {
  categories: "bp_categories",
  products: "bp_products",
  auth: "bp_admin_auth",
};

const DEFAULT_CATEGORIES = [
  { id: "cat_electronics", name: "Electronics", icon: "🔌" },
  { id: "cat_home", name: "Home & Kitchen", icon: "🍳" },
  { id: "cat_fashion", name: "Fashion", icon: "👕" },
  { id: "cat_beauty", name: "Beauty", icon: "💄" },
  { id: "cat_fitness", name: "Sports & Fitness", icon: "🏋️" },
  { id: "cat_books", name: "Books", icon: "📚" },
];

const DEFAULT_PRODUCTS = [
  {
    id: "p1",
    name: "Wireless Noise-Cancelling Headphones",
    category: "cat_electronics",
    price: 2499,
    originalPrice: 4999,
    rating: 4.4,
    reviews: 12500,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "Bestseller",
    description: "Over-ear headphones with active noise cancellation and 30-hour battery life.",
  },
  {
    id: "p2",
    name: "Smart Watch with Heart Rate Monitor",
    category: "cat_electronics",
    price: 1799,
    originalPrice: 3299,
    rating: 4.2,
    reviews: 8700,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "Deal",
    description: "Fitness tracking, heart rate monitor and 7-day battery in a slim aluminium body.",
  },
  {
    id: "p3",
    name: "Non-Stick Cookware Set (5 pcs)",
    category: "cat_home",
    price: 1299,
    originalPrice: 2199,
    rating: 4.5,
    reviews: 5400,
    image: "https://images.unsplash.com/photo-1584990347449-a5d9f800a783?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "",
    description: "Induction-friendly non-stick pots and pans set for everyday cooking.",
  },
  {
    id: "p4",
    name: "Men's Cotton Casual Shirt",
    category: "cat_fashion",
    price: 599,
    originalPrice: 1299,
    rating: 4.0,
    reviews: 2300,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "New",
    description: "Breathable pure cotton shirt, regular fit, machine washable.",
  },
  {
    id: "p5",
    name: "Vitamin C Face Serum",
    category: "cat_beauty",
    price: 449,
    originalPrice: 899,
    rating: 4.3,
    reviews: 9600,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "Deal",
    description: "Brightening serum with 10% Vitamin C for daily use.",
  },
  {
    id: "p6",
    name: "Adjustable Dumbbell Set (10 kg)",
    category: "cat_fitness",
    price: 1899,
    originalPrice: 2999,
    rating: 4.1,
    reviews: 1800,
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "",
    description: "Space-saving adjustable dumbbells for home workouts.",
  },
  {
    id: "p7",
    name: "Atomic Habits — Paperback",
    category: "cat_books",
    price: 299,
    originalPrice: 599,
    rating: 4.7,
    reviews: 45000,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "Bestseller",
    description: "The life-changing bestseller on building good habits and breaking bad ones.",
  },
  {
    id: "p8",
    name: "Bluetooth Portable Speaker",
    category: "cat_electronics",
    price: 999,
    originalPrice: 1999,
    rating: 4.3,
    reviews: 6700,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    affiliateLink: "https://www.amazon.in/",
    badge: "Deal",
    description: "Compact waterproof speaker with 12-hour battery life.",
  },
];

function seedIfEmpty() {
  if (!localStorage.getItem(STORE_KEYS.categories)) {
    localStorage.setItem(STORE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(STORE_KEYS.products)) {
    localStorage.setItem(STORE_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
  }
}

const Store = {
  getCategories() {
    seedIfEmpty();
    return JSON.parse(localStorage.getItem(STORE_KEYS.categories) || "[]");
  },
  saveCategories(list) {
    localStorage.setItem(STORE_KEYS.categories, JSON.stringify(list));
  },
  getProducts() {
    seedIfEmpty();
    return JSON.parse(localStorage.getItem(STORE_KEYS.products) || "[]");
  },
  saveProducts(list) {
    localStorage.setItem(STORE_KEYS.products, JSON.stringify(list));
  },
  addCategory(cat) {
    const list = this.getCategories();
    list.push(cat);
    this.saveCategories(list);
  },
  updateCategory(id, updates) {
    const list = this.getCategories().map((c) => (c.id === id ? { ...c, ...updates } : c));
    this.saveCategories(list);
  },
  deleteCategory(id) {
    const list = this.getCategories().filter((c) => c.id !== id);
    this.saveCategories(list);
  },
  addProduct(prod) {
    const list = this.getProducts();
    list.push(prod);
    this.saveProducts(list);
  },
  updateProduct(id, updates) {
    const list = this.getProducts().map((p) => (p.id === id ? { ...p, ...updates } : p));
    this.saveProducts(list);
  },
  deleteProduct(id) {
    const list = this.getProducts().filter((p) => p.id !== id);
    this.saveProducts(list);
  },
  resetToDefaults() {
    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveProducts(DEFAULT_PRODUCTS);
  },
  isLoggedIn() {
    return sessionStorage.getItem(STORE_KEYS.auth) === "true";
  },
  login(password) {
    // Demo-only gate. Change ADMIN_PASSWORD below before publishing.
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORE_KEYS.auth, "true");
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem(STORE_KEYS.auth);
  },
};

// Change this before you publish the site.
const ADMIN_PASSWORD = "bazaar123";

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function discountPercent(price, originalPrice) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}
