import { useEffect, useState } from 'react'; import { Search, UserRound, Heart, ShoppingBag, Menu, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from './context/CartContext.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Shop from './pages/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Admin from './pages/Admin.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase.js'

const defaultSiteSettings = { storeName: "FX Fashion Gallery", tagline: "Modern fashion. Timeless style.", primaryColor: "#111111", accentColor: "#f7f7f5", phone: "01897523321", whatsapp: "01897523321", currency: "৳", dhakaDelivery: 70, outsideDelivery: 120 }; function getSiteSettings() { try { return { ...defaultSiteSettings, ...JSON.parse(localStorage.getItem("fx_site_settings") || "{}") }; } catch { return defaultSiteSettings; } } function HomePage() {
  const [siteSettings, setSiteSettings] = useState(getSiteSettings);
  const [products, setProducts] = useState([]);
  const [homepageSettings, setHomepageSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("fx_homepage_settings") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "seo"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();

        if (settings.metaTitle) {
          document.title = settings.metaTitle;
        }

        if (settings.metaDescription) {
          let description = document.querySelector('meta[name="description"]');
          if (!description) {
            description = document.createElement("meta");
            description.setAttribute("name", "description");
            document.head.appendChild(description);
          }
          description.setAttribute("content", settings.metaDescription);
        }

        if (settings.keywords) {
          let keywords = document.querySelector('meta[name="keywords"]');
          if (!keywords) {
            keywords = document.createElement("meta");
            keywords.setAttribute("name", "keywords");
            document.head.appendChild(keywords);
          }
          keywords.setAttribute("content", settings.keywords);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "theme"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();
        setSiteSettings((current) => ({ ...current, ...settings }));
        localStorage.setItem("fx_theme_settings", JSON.stringify(settings));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "store"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();
        setSiteSettings((current) => ({ ...current, ...settings }));
        localStorage.setItem("fx_site_settings", JSON.stringify(settings));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "homepage"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();
        setHomepageSettings(settings);
        localStorage.setItem("fx_homepage_settings", JSON.stringify(settings));
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const items = snapshot.docs
        .map((item) => ({ ...item.data(), id: item.id }))
        .filter((item) => item.active !== false);
      setProducts(items);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncSettings = () => setSiteSettings(getSiteSettings());
    window.addEventListener("storage", syncSettings);
    window.addEventListener("fx-settings-updated", syncSettings);
    return () => {
      window.removeEventListener("storage", syncSettings);
      window.removeEventListener("fx-settings-updated", syncSettings);
    };
  }, []);
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [addedProduct, setAddedProduct] = useState("")
  const { cartCount, addToCart } = useCart()
  return (
    <div className="min-h-screen" style={{ backgroundColor: siteSettings.accentColor, color: siteSettings.primaryColor }}>

      <div className="border-b border-white/10 bg-[#111111] px-4 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.28em] text-white">
        FX Fashion Gallery · New Collection
      </div>

      <header className="border-b border-black/10 bg-[#f7f7f5]">
        <div className="mx-auto flex h-[82px] max-w-[1500px] items-center justify-between px-5 md:px-10">

          <button onClick={() => setMenuOpen(true)} className="lg:hidden" aria-label="Open menu">
            <Menu size={24} strokeWidth={1.5} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img src="/fx-logo.png" alt="FX Fashion Gallery" className="h-11 w-auto object-contain md:h-12" />
            <div className="hidden leading-none sm:block">
              <div className="text-[18px] font-black tracking-[-0.05em] md:text-[20px]">
                FX FASHION
              </div>
              <div className="mt-1 text-[7px] font-medium tracking-[0.45em] text-black/50">
                GALLERY
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {['Home', 'Men', 'Women', 'Kids', 'New Arrivals', 'Sale'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-[11px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-40"
              >
                {item}
              </a>
            ))}
          </nav>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full z-50 border-t border-black/10 bg-white px-5 py-4 shadow-lg">
              <input autoFocus type="text" placeholder="Search products..." className="w-full border-b border-black/20 bg-transparent py-3 text-sm outline-none placeholder:text-black/40" />
            </div>
          )}

          <div className="flex items-center gap-4 md:gap-5">
            <button onClick={() => setSearchOpen(searchOpen ? false : true)} className="hidden transition-opacity hover:opacity-40 sm:block">
              <Search size={19} strokeWidth={1.5} />
            </button>

            <button className="hidden transition-opacity hover:opacity-40 sm:block">
              <UserRound size={19} strokeWidth={1.5} />
            </button>

            <button className="transition-opacity hover:opacity-40">
              <Heart size={19} strokeWidth={1.5} />
            </button>

            <Link to="/cart" className="relative transition-opacity hover:opacity-40" aria-label="Cart">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && <span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#111111] px-1 text-[8px] font-bold text-white">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/45"
            aria-label="Close menu"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[88%] max-w-[390px] flex-col bg-[#f7f7f5] shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/10 px-6 py-6">
              <Link to="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
                <img src="/fx-logo.png" alt="FX" className="h-9 w-auto" />
                <div>
                  <div className="text-[16px] font-black tracking-[-0.04em]">FX FASHION</div>
                  <div className="mt-1 text-[7px] tracking-[0.4em] text-black/45">GALLERY</div>
                </div>
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-6 py-5">
              <button
                onClick={() => { setMenuOpen(false); setSearchOpen(true); }}
                className="flex w-full items-center gap-4 border-b border-black/10 py-4 text-left text-[12px] font-bold uppercase tracking-[0.12em]"
              >
                🔍 <span>Search</span>
              </button>

              {[
                ["👤", "My Account / Login", "#"],
                ["🛍️", "Shop All", "/shop"],
                ["👔", "Men", "/shop"],
                ["👗", "Women", "/shop"],
                ["🧒", "Kids", "/shop"],
                ["✨", "New Arrivals", "/shop"],
                ["🔥", "Sale", "/shop"],
                ["❤️", "Wishlist", "#"],
                ["🛒", "Cart", "/cart"],
                ["📦", "Track Order", "#"],
                ["📞", "Contact Us", "#"],
              ].map(([icon, label, href]) => (
                <Link
                  key={label}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 border-b border-black/10 py-4 text-[12px] font-bold uppercase tracking-[0.12em] transition-opacity hover:opacity-45"
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}

              <div className="mt-6 border-t border-black/10 pt-5">
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-4 py-4 text-[12px] font-black uppercase tracking-[0.12em]"
                >
                  ⚙️ <span>Admin Login</span>
                </Link>
              </div>
            </nav>

            <div className="border-t border-black/10 px-6 py-5 text-[9px] uppercase tracking-[0.2em] text-black/45">
              FX Fashion Gallery · Modern Fashion
            </div>
          </aside>
        </div>
      )}

      <main>

          {homepageSettings.showHero !== false && (
            <section className="relative min-h-[680px] overflow-hidden bg-[#111111] md:min-h-[780px]">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=90"
                alt="FX Fashion Gallery collection"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />

              <div className="relative mx-auto flex min-h-[680px] max-w-[1500px] flex-col items-center justify-center px-5 text-center text-white md:min-h-[780px]">
                <img
                  src="/fx-logo.png"
                  alt="FX"
                  className="mb-8 h-16 w-auto brightness-0 invert md:h-20"
                />

                <p className="mb-5 text-[9px] font-semibold uppercase tracking-[0.42em] text-white/75 md:text-[10px]">
                  FX Fashion Gallery · New Collection
                </p>

                <h1 className="max-w-[1000px] text-5xl font-black uppercase leading-[0.88] tracking-[-0.07em] sm:text-7xl md:text-8xl lg:text-[108px]">
                  {homepageSettings.heroTitle}
                </h1>

                <p className="mt-7 max-w-[560px] text-sm leading-6 text-white/80 md:text-[15px]">
                  {homepageSettings.heroSubtitle}
                </p>

                <div className="mt-8 flex w-full max-w-[600px] items-center border border-white/35 bg-white/10 px-5 py-1 backdrop-blur-md">
                  <Search size={18} strokeWidth={1.5} className="shrink-0 text-white/70" />
                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/55"
                  />
                  <a
                    href="/shop"
                    className="shrink-0 bg-white px-5 py-3 text-[9px] font-bold uppercase tracking-[0.18em] text-black transition hover:bg-white/80"
                  >
                    Search
                  </a>
                </div>

                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  {["Men", "Women", "Kids", "New Arrivals", "Sale"].map((item) => (
                    <a
                      key={item}
                      href="/shop"
                      className="border border-white/30 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
                    >
                      {item}
                    </a>
                  ))}
                </div>

                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <a
                    href={homepageSettings.heroButtonLink || "/shop"}
                    className="bg-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
                  >
                    {homepageSettings.heroButtonText || "Shop Collection"}
                  </a>
                </div>
              </div>
            </section>
          )}

        {homepageSettings.showCategories !== false && (
        <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">

          <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-black/45">
                Explore the collection
              </p>

              <h2 className="text-4xl font-black uppercase tracking-[-0.055em] md:text-5xl">
                Shop by Category
              </h2>
            </div>

            <a
              href="#"
              className="w-fit border-b border-black pb-1 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              View All
            </a>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {[
              {
                name: 'Men',
                image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=90',
              },
              {
                name: 'Women',
                image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=90',
              },
              {
                name: 'Kids',
                image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=1000&q=90',
              },
            ].map((category) => (
              <a
                key={category.name}
                href="#"
                className="group relative h-[500px] overflow-hidden bg-black"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                <div className="absolute bottom-8 left-8 text-white">
                  <h3 className="text-4xl font-black uppercase tracking-[-0.05em]">
                    {category.name}
                  </h3>

                  <span className="mt-3 inline-block border-b border-white pb-1 text-[10px] font-bold uppercase tracking-[0.22em]">
                    Shop Now
                  </span>
                </div>
              </a>
            ))}

          </div>
        </section>
        )}


            {homepageSettings.showFeatured !== false && (
          <section className="border-t border-black/10 bg-white">
            <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
              <div className="mb-12 flex items-end justify-between">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                    Selected for you
                  </p>
                  <h2 className="text-4xl font-black uppercase tracking-[-0.055em] md:text-5xl">
                    Featured Products
                  </h2>
                </div>

                <a
                  href="/shop"
                  className="hidden border-b border-black pb-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:block"
                >
                  View All
                </a>
              </div>

              {products.filter((product) => product.featured === true).length === 0 ? (
                <div className="border border-black/10 px-6 py-16 text-center">
                  <p className="text-sm font-semibold">Featured products coming soon.</p>
                  <p className="mt-2 text-xs text-black/50">
                    Mark products as Featured from the Admin panel.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {products
                    .filter((product) => product.featured === true)
                    .slice(0, 4)
                    .map((product) => {
                      const basePrice = Number(String(product.price || "").replace(/[^0-9.]/g, "")) || 0;
                      const discountValue = Number(product.discountValue || 0);
                      const salePrice =
                        product.discountEnabled && discountValue > 0
                          ? product.discountType === "percentage"
                            ? Math.max(0, basePrice - (basePrice * discountValue / 100))
                            : Math.max(0, basePrice - discountValue)
                          : basePrice;

                      return (
                        <a
                          key={product.id}
                          href={"/product/" + product.id}
                          className="group block"
                        >
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f1ef]">
                            {product.imageData ? (
                              <img
                                src={product.imageData}
                                alt={product.name || "Product"}
                                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-black/30">
                                FX Fashion Gallery
                              </div>
                            )}

                            {product.discountEnabled && discountValue > 0 && (
                              <span className="absolute left-4 top-4 bg-black px-3 py-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                                Sale
                              </span>
                            )}
                          </div>

                          <div className="pt-4">
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
                              {product.category || "Fashion"}
                            </p>
                            <h3 className="mt-2 text-sm font-semibold">
                              {product.name || "Untitled Product"}
                            </h3>
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-sm font-bold">৳{salePrice}</span>
                              {salePrice < basePrice && (
                                <span className="text-xs text-black/35 line-through">
                                  ৳{basePrice}
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                </div>
              )}
            </div>
          </section>
          )}
          {homepageSettings.showNewArrivals !== false && (
        <section className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">

            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
                  Freshly selected
                </p>
                <h2 className="text-4xl font-black uppercase tracking-[-0.055em] md:text-5xl">
                  New Arrivals
                </h2>
              </div>

              <a href="#" className="hidden border-b border-black pb-1 text-[10px] font-bold uppercase tracking-[0.2em] sm:block">
                View All
              </a>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-5">

              {[
                {
                  name: 'Essential Oversized Shirt',
                  category: 'Men',
                  price: '৳1,890',
                  oldPrice: '৳2,290',
                  image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=90',
                },
                {
                  name: 'Minimal Everyday Dress',
                  category: 'Women',
                  price: '৳2,490',
                  oldPrice: '৳2,990',
                  image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=90',
                },
                {
                  name: 'Classic Street Jacket',
                  category: 'Men',
                  price: '৳2,790',
                  oldPrice: '৳3,290',
                  image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=90',
                },
                {
                  name: 'Modern Casual Look',
                  category: 'Women',
                  price: '৳2,190',
                  oldPrice: '৳2,590',
                  image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=90',
                },
              ].map((product) => (
                <article key={product.name} className="group">

                  <div className="relative aspect-[3/4] overflow-hidden bg-[#eeeeeb]">

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />

                    <span className="absolute left-3 top-3 bg-white px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em]">
                      New
                    </span>

                    <button className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white">
                      <Heart size={15} strokeWidth={1.5} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product, "M", 1)
                        setAddedProduct(product.name)
                        setTimeout(() => setAddedProduct(""), 1800)
                      }}
                      className="mt-3 w-full rounded-full bg-black py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
                    >
                      {addedProduct === product.name ? "Added to Cart ✓" : "Add to Cart"}
                    </button>

                  </div>

                  <div className="pt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/40">
                      {product.category}
                    </p>

                    <h3 className="mt-1 text-sm font-semibold leading-5 md:text-[15px]">
                      {product.name}
                    </h3>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-bold">{product.price}</span>
                      <span className="text-xs text-black/35 line-through">
                        {product.oldPrice}
                      </span>
                    </div>
                  </div>

                </article>
              ))}

            </div>
          </div>
        </section>
          )}


        <section className="bg-[#111111] px-5 py-20 text-white md:px-10 md:py-28">
          <div className="mx-auto grid max-w-[1500px] overflow-hidden bg-[#1d1d1b] md:grid-cols-2">

            <div className="relative min-h-[430px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=90"
                alt="Exclusive fashion collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/15" />
            </div>

            <div className="flex min-h-[430px] flex-col justify-center px-8 py-14 md:px-14 lg:px-20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/45">
                FX Editorial
              </p>

              <h2 className="mt-5 max-w-xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.055em] md:text-6xl">
                Everyday
                <br />
                Essentials,
                <br />
                Elevated.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-6 text-white/55">
                Timeless silhouettes, modern details and effortless pieces
                designed to become part of your everyday wardrobe.
              </p>

              <button className="mt-8 w-fit border border-white/50 px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition hover:bg-white hover:text-black">
                Explore Collection
              </button>
            </div>

          </div>
        </section>

          {homepageSettings.showBenefits !== false && (
        <section className="border-b border-black/10 bg-white">
          <div className="mx-auto grid max-w-[1500px] md:grid-cols-4">

            {[
              ['01', 'Quality First', 'Thoughtfully selected products made for everyday style.'],
              ['02', 'Fast Delivery', 'Reliable delivery service across Bangladesh.'],
              ['03', 'Secure Shopping', 'A simple and secure online shopping experience.'],
              ['04', 'Customer Care', 'Friendly support whenever you need assistance.'],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="border-t border-black/10 px-6 py-9 md:border-r md:px-8 md:py-12 last:md:border-r-0"
              >
                <span className="text-[9px] font-bold tracking-[0.2em] text-black/30">
                  {number}
                </span>

                <h3 className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em]">
                  {title}
                </h3>

                <p className="mt-3 max-w-[240px] text-xs leading-5 text-black/45">
                  {description}
                </p>
              </div>
            ))}

          </div>
        </section>
          )}

        <footer className="bg-[#111111] px-5 py-16 text-white md:px-10 md:py-20">
          <div className="mx-auto max-w-[1500px]">

            <div className="grid gap-12 md:grid-cols-4">

              <div className="md:col-span-1">
                <div className="text-2xl font-black tracking-[-0.06em]">
                  FX FASHION
                </div>

                <div className="mt-1 text-[8px] tracking-[0.52em] text-white/40">
                  GALLERY
                </div>

                <p className="mt-6 max-w-xs text-xs leading-6 text-white/45">
                  Modern fashion for men, women and kids. Discover your style
                  with FX Fashion Gallery.
                </p>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Shop
                </h3>

                <div className="mt-5 space-y-3 text-xs text-white/70">
                  <a href="#" className="block hover:text-white">Men</a>
                  <a href="#" className="block hover:text-white">Women</a>
                  <a href="#" className="block hover:text-white">Kids</a>
                  <a href="#" className="block hover:text-white">New Arrivals</a>
                  <a href="#" className="block hover:text-white">Sale</a>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Help
                </h3>

                <div className="mt-5 space-y-3 text-xs text-white/70">
                  <a href="#" className="block hover:text-white">Contact Us</a>
                  <a href="#" className="block hover:text-white">Delivery Information</a>
                  <a href="#" className="block hover:text-white">Returns & Exchange</a>
                  <a href="#" className="block hover:text-white">Track Order</a>
                  <a href="#" className="block hover:text-white">Privacy Policy</a>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Stay Connected
                </h3>

                <p className="mt-5 max-w-xs text-xs leading-5 text-white/45">
                  Follow FX Fashion Gallery for new arrivals, offers and
                  fashion updates.
                </p>

                <div className="mt-6 flex gap-3">
                  <button className="border border-white/20 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black">
                    Instagram
                  </button>

                  <button className="border border-white/20 px-4 py-3 text-[9px] font-bold uppercase tracking-[0.15em] hover:bg-white hover:text-black">
                    Facebook
                  </button>
                </div>
              </div>

            </div>

            <div className="mt-14 border-t border-white/10 pt-6 text-[9px] uppercase tracking-[0.15em] text-white/30">
              © 2026 FX Fashion Gallery. All rights reserved.
            </div>

          </div>
        </footer>

      </main>
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}
