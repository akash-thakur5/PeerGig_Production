"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNavBar from "@/components/TopNavBar";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  seller: string;
  badge?: string;
  emoji: string;
  inStock: boolean;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

// ─── Mock Product Data ────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Premium Spiral Notebook Set (5-Pack)",
    category: "Stationery",
    price: 299,
    originalPrice: 499,
    rating: 4.8,
    reviewCount: 1243,
    seller: "StudyMart India",
    badge: "Bestseller",
    emoji: "📓",
    inStock: true,
    description: "A5 ruled notebooks with 200 pages each. Perfect for lectures and note-taking.",
  },
  {
    id: 2,
    name: "Gel Pen Pack — 20 Colors",
    category: "Stationery",
    price: 149,
    originalPrice: 250,
    rating: 4.6,
    reviewCount: 892,
    seller: "PenZone",
    badge: "Top Rated",
    emoji: "🖊️",
    inStock: true,
    description: "Smooth-flow gel pens great for colour-coding notes and mind maps.",
  },
  {
    id: 3,
    name: "Apple iPad 10th Gen (64 GB, Wi-Fi)",
    category: "Electronics",
    price: 34900,
    originalPrice: 39900,
    rating: 4.9,
    reviewCount: 5621,
    seller: "TechHub Official",
    badge: "Deal of the Day",
    emoji: "📱",
    inStock: true,
    description: "Immersive Liquid Retina display. Ideal for e-books, video lectures and digital notes.",
  },
  {
    id: 4,
    name: "Lenovo IdeaPad 3 Laptop (i5, 16 GB RAM, 512 GB SSD)",
    category: "Electronics",
    price: 54990,
    originalPrice: 64990,
    rating: 4.7,
    reviewCount: 3210,
    seller: "LaptopKing",
    badge: "Hot Deal",
    emoji: "💻",
    inStock: true,
    description: "Thin, light and powerful — built for students who code, design and create.",
  },
  {
    id: 5,
    name: "Complete Study Kit — Ruler, Compass, Protractor & More",
    category: "Study Sets",
    price: 189,
    originalPrice: 320,
    rating: 4.5,
    reviewCount: 678,
    seller: "StudyCraft",
    emoji: "📐",
    inStock: true,
    description: "16-piece mathematical instruments set in a sturdy carrying case.",
  },
  {
    id: 6,
    name: "Professional Drawing Set — 72 Sketching Tools",
    category: "Art & Drawing",
    price: 899,
    originalPrice: 1499,
    rating: 4.8,
    reviewCount: 2134,
    seller: "ArtVibe",
    badge: "New Arrival",
    emoji: "🎨",
    inStock: true,
    description: "Charcoal, graphite, blending stumps, erasers, and more. For art students.",
  },
  {
    id: 7,
    name: "Magnetic Chess Board Set (Foldable, Travel-Friendly)",
    category: "Board Games",
    price: 549,
    originalPrice: 799,
    rating: 4.7,
    reviewCount: 1056,
    seller: "GameNest",
    emoji: "♟️",
    inStock: true,
    description: "Premium magnetic pieces, foldable board with storage compartment.",
  },
  {
    id: 8,
    name: "Scientific Calculator — CASIO FX-991EX",
    category: "Electronics",
    price: 1299,
    originalPrice: 1799,
    rating: 4.9,
    reviewCount: 8920,
    seller: "MathGear",
    badge: "Bestseller",
    emoji: "🔢",
    inStock: true,
    description: "The #1 calculator for engineering students. 552 functions, spreadsheet mode.",
  },
  {
    id: 9,
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 2999,
    originalPrice: 5999,
    rating: 4.6,
    reviewCount: 4231,
    seller: "SoundPro",
    badge: "50% Off",
    emoji: "🎧",
    inStock: true,
    description: "Focus in any environment. 30-hr battery, ANC, built-in mic for calls.",
  },
  {
    id: 10,
    name: "Sticky Notes Cube — 1000 Pages (Neon Mix)",
    category: "Stationery",
    price: 99,
    originalPrice: 150,
    rating: 4.4,
    reviewCount: 3409,
    seller: "StudyMart India",
    emoji: "🗒️",
    inStock: true,
    description: "Bright neon sticky notes for revision, reminders and mind maps.",
  },
  {
    id: 11,
    name: "Ergonomic Student Backpack (35L, Waterproof)",
    category: "Accessories",
    price: 1299,
    originalPrice: 2499,
    rating: 4.7,
    reviewCount: 2871,
    seller: "BackpackCo",
    badge: "Top Rated",
    emoji: "🎒",
    inStock: true,
    description: "Padded laptop sleeve (up to 15.6\"), USB charging port, 8 compartments.",
  },
  {
    id: 12,
    name: "Flash Card Set — 500 Blank White Cards",
    category: "Study Sets",
    price: 249,
    originalPrice: 399,
    rating: 4.6,
    reviewCount: 1192,
    seller: "StudyCraft",
    emoji: "🃏",
    inStock: false,
    description: "Premium thick-stock blank flash cards. Ideal for vocab, formulas and concepts.",
  },
];

const CATEGORIES = ["All", "Stationery", "Electronics", "Study Sets", "Art & Drawing", "Board Games", "Accessories"];

const PEERGIG_CUT = 0.05; // 5% commission

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="material-symbols-outlined text-sm"
          style={{
            fontVariationSettings: `'FILL' ${rating >= star ? 1 : rating >= star - 0.5 ? 0.5 : 0}`,
            color: rating >= star - 0.5 ? "#ff8c00" : "#d1d5db",
          }}
        >
          star
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");

  const filtered = PRODUCTS
    .filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return b.reviewCount - a.reviewCount; // popular
    });

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const peergigFee = Math.round(cartTotal * PEERGIG_CUT);
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="bg-background text-on-surface font-body min-h-screen">
      <TopNavBar />

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-[200] flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          {/* Panel */}
          <div className="w-full max-w-md bg-surface-container-lowest shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold font-headline text-on-surface">Your Cart</h2>
                <p className="text-xs text-secondary">{cartItemCount} item{cartItemCount !== 1 && "s"}</p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-secondary">close</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20">
                  <span className="text-6xl block mb-4">🛒</span>
                  <p className="font-headline font-bold text-on-surface">Your cart is empty</p>
                  <p className="text-secondary text-sm mt-1">Add some student essentials!</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-surface-container-low rounded-2xl border border-outline-variant/10"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm border border-outline-variant/10 shrink-0">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface font-headline leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-secondary mt-0.5">{item.seller}</p>
                      <p className="text-primary font-extrabold font-headline mt-1">
                        {formatINR(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          −
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface font-bold hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-outline-variant/10 space-y-4">
                {/* PeerGig Commission Notice */}
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">info</span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    PeerGig earns a <strong className="text-primary">5% platform fee</strong>{" "}
                    ({formatINR(peergigFee)}) on your order. Sellers keep the rest.
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-secondary">
                    <span>Subtotal</span>
                    <span>{formatINR(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-secondary">
                    <span>Platform fee (5%)</span>
                    <span>{formatINR(peergigFee)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-on-surface font-headline text-base pt-2 border-t border-outline-variant/10">
                    <span>Total</span>
                    <span>{formatINR(cartTotal + peergigFee)}</span>
                  </div>
                </div>

                <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold font-headline uppercase tracking-widest rounded-xl shadow-lg hover:translate-y-[-2px] transition-all text-sm">
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full py-3 border-2 border-outline-variant/30 text-secondary font-bold font-headline uppercase tracking-widest rounded-xl hover:bg-surface-container-low transition-all text-sm"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex pt-16 min-h-screen">
        <Sidebar />

        <main className="flex-1 lg:ml-64 p-6 md:p-10 min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto space-y-8">

            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-3">
                  <span className="material-symbols-outlined text-sm text-primary">storefront</span>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest font-headline">PeerGig Store</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tight leading-tight">
                  Student <span className="text-primary italic">Essentials</span>
                </h1>
                <p className="text-secondary mt-2 text-sm md:text-base">
                  Everything you need to study smarter — curated by students, for students.
                </p>
              </div>

              {/* Cart Button */}
              <button
                id="open-cart-btn"
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold font-headline uppercase tracking-widest rounded-xl shadow-lg hover:translate-y-[-2px] transition-all text-sm shrink-0"
              >
                <span className="material-symbols-outlined">shopping_cart</span>
                My Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white text-primary text-xs font-extrabold flex items-center justify-center shadow-md border-2 border-primary">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>

            {/* ── How It Works Banner ── */}
            <div className="bg-gradient-to-r from-[#1b1b1e] to-[#2c2c2f] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-white relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute right-20 -top-6 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
              <div className="relative z-10 flex-1">
                <h2 className="text-xl font-headline font-bold mb-1">How PeerGig Store Works</h2>
                <p className="text-white/60 text-sm">Like Amazon — but built for students</p>
              </div>
              <div className="relative z-10 grid grid-cols-3 gap-4 w-full md:w-auto">
                {[
                  { icon: "person_add", label: "Sellers List Products" },
                  { icon: "shopping_bag", label: "Students Buy" },
                  { icon: "percent", label: "PeerGig Earns 5%" },
                ].map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-lg">{step.icon}</span>
                    </div>
                    <p className="text-xs text-white/80 font-medium leading-tight">{step.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Search & Controls ── */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="relative flex-1 group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-primary transition-colors">
                  search
                </span>
                <input
                  id="store-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for notebooks, laptops, drawing sets..."
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 text-on-surface placeholder:text-secondary/60 transition-all outline-none text-sm shadow-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary font-bold uppercase tracking-widest">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl text-sm font-bold text-on-surface outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* ── Category Pills ── */}
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold font-headline uppercase tracking-widest transition-all duration-200 border ${
                    activeCategory === cat
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                      : "bg-surface-container-lowest text-secondary border-outline-variant/20 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* ── Results Count ── */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-secondary">
                Showing <span className="font-bold text-on-surface">{filtered.length}</span> products
                {activeCategory !== "All" && (
                  <> in <span className="font-bold text-primary">{activeCategory}</span></>
                )}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-secondary hover:text-primary font-bold transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                  Clear search
                </button>
              )}
            </div>

            {/* ── Product Grid ── */}
            {filtered.length === 0 ? (
              <div className="text-center py-24">
                <span className="text-6xl block mb-4">🔍</span>
                <p className="font-headline font-bold text-xl text-on-surface">No products found</p>
                <p className="text-secondary text-sm mt-2">Try a different category or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((product) => {
                  const discount = Math.round(
                    ((product.originalPrice - product.price) / product.originalPrice) * 100
                  );
                  const isAdded = addedId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden"
                    >
                      {/* Product Image Area */}
                      <div className="relative bg-gradient-to-br from-surface-container-low to-surface-container h-44 flex items-center justify-center">
                        <span className="text-7xl group-hover:scale-110 transition-transform duration-300">
                          {product.emoji}
                        </span>
                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                          {product.badge && (
                            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              {product.badge}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              {discount}% off
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="p-5 flex flex-col flex-1 gap-3">
                        {/* Category tag */}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded-full w-fit">
                          {product.category}
                        </span>

                        {/* Name */}
                        <h3 className="font-headline font-bold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Seller */}
                        <div className="flex items-center gap-1.5 text-xs text-secondary">
                          <span className="material-symbols-outlined text-sm text-on-surface-variant">storefront</span>
                          <span>by <span className="font-bold text-on-surface-variant">{product.seller}</span></span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <StarRating rating={product.rating} />
                          <span className="text-xs font-bold text-on-surface">{product.rating}</span>
                          <span className="text-xs text-secondary">({product.reviewCount.toLocaleString("en-IN")})</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-auto">
                          <span className="text-xl font-extrabold font-headline text-primary">
                            {formatINR(product.price)}
                          </span>
                          <span className="text-xs text-secondary line-through">
                            {formatINR(product.originalPrice)}
                          </span>
                        </div>

                        {/* Add to Cart */}
                        <button
                          id={`add-to-cart-${product.id}`}
                          onClick={() => product.inStock && addToCart(product)}
                          disabled={!product.inStock}
                          className={`w-full py-3 rounded-xl text-xs font-bold font-headline uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-2 ${
                            isAdded
                              ? "bg-green-500 text-white scale-95"
                              : product.inStock
                              ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-md shadow-primary/20 hover:translate-y-[-2px] hover:shadow-lg"
                              : "bg-surface-container text-secondary cursor-not-allowed"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isAdded ? "check_circle" : product.inStock ? "add_shopping_cart" : "remove_shopping_cart"}
                          </span>
                          {isAdded ? "Added!" : product.inStock ? "Add to Cart" : "Out of Stock"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Seller CTA ── */}
            <div className="bg-surface-container rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-primary mt-4">
              <div>
                <h3 className="text-xl font-headline font-bold text-on-surface mb-1">
                  Want to sell on PeerGig Store?
                </h3>
                <p className="text-secondary text-sm max-w-lg">
                  List your educational products and reach thousands of students. We handle payments,
                  and you keep <strong>95%</strong> of every sale — PeerGig takes just a 5% platform fee.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="shrink-0 px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-white font-bold font-headline uppercase tracking-widest rounded-xl shadow-lg hover:translate-y-[-2px] transition-all text-sm whitespace-nowrap"
              >
                Become a Seller
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 w-full lg:hidden bg-white/95 backdrop-blur-md border-t border-outline-variant/10 flex justify-around p-3 z-40">
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/dashboard">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">Dash</span>
        </Link>
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/student">
          <span className="material-symbols-outlined">school</span>
          <span className="text-[10px] font-bold">Learn</span>
        </Link>
        <button onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-1 text-primary relative">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
          {cartItemCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 bg-primary text-white text-[8px] font-extrabold rounded-full flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
          <span className="text-[10px] font-bold">Store</span>
        </button>
        <Link className="flex flex-col items-center gap-1 text-secondary hover:text-primary transition-colors" href="/wallet">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-[10px] font-bold">Wallet</span>
        </Link>
      </nav>
    </div>
  );
}
