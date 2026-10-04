import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Menu, X, TrendingUp, Clock3, CheckCircle2 } from "lucide-react";

export default function Admin() {
  const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "XXXL", "Free Size"];

  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("fx_orders") || "[]"));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("fx_products") || "[]"));
  const [newProduct, setNewProduct] = useState({
  name: "",
  category: "Men",
  price: "",
  discountEnabled: false,
  discountType: "percentage",
  discountValue: "",
  stock: "",
  sizes: "",
  rating: "5",
  featured: false,
  newArrival: false,
  active: true,
  description: "",
  imageData: ""
});
  const [imageName, setImageName] = useState("");
const [editingProductId, setEditingProductId] = useState(null);
const [productImages, setProductImages] = useState([{ imageData: "", color: "" }]);
  const [openStatusId, setOpenStatusId] = useState(null);
  const [openPaymentId, setOpenPaymentId] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const DEFAULT_NAVIGATION = [
    { id: "home", label: "Home", path: "/", icon: "⌂", desktop: true, mobile: true, badge: "" },
    { id: "shop", label: "Shop All", path: "/shop", icon: "🛍️", desktop: false, mobile: true, badge: "" },
    { id: "men", label: "Men", path: "/shop?category=Men", icon: "👔", desktop: true, mobile: true, badge: "" },
    { id: "women", label: "Women", path: "/shop?category=Women", icon: "👗", desktop: true, mobile: true, badge: "" },
    { id: "kids", label: "Kids", path: "/shop?category=Kids", icon: "🧒", desktop: true, mobile: true, badge: "" },
    { id: "new-arrivals", label: "New Arrivals", path: "/shop?filter=new", icon: "✨", desktop: true, mobile: true, badge: "New" },
    { id: "sale", label: "Sale", path: "/shop?filter=sale", icon: "🔥", desktop: true, mobile: true, badge: "Sale" },
    { id: "account", label: "My Account / Login", path: "/account", icon: "👤", desktop: false, mobile: true, badge: "" },
    { id: "wishlist", label: "Wishlist", path: "/wishlist", icon: "❤️", desktop: false, mobile: true, badge: "" },
    { id: "cart", label: "Cart", path: "/cart", icon: "🛒", desktop: false, mobile: true, badge: "" },
    { id: "track-order", label: "Track Order", path: "/track-order", icon: "📦", desktop: false, mobile: true, badge: "" },
    { id: "contact", label: "Contact Us", path: "/info/contact", icon: "📞", desktop: false, mobile: true, badge: "" },
  ];

  const [navigationItems, setNavigationItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("fx_navigation") || "null");
      return Array.isArray(saved) && saved.length ? saved : DEFAULT_NAVIGATION;
    } catch {
      return DEFAULT_NAVIGATION;
    }
  });

  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deliverySettings, setDeliverySettings] = useState(() => {
    try {
      return {
        dhakaCharge: 70,
        outsideDhakaCharge: 120,
        ...JSON.parse(localStorage.getItem("fx_delivery_settings") || "{}"),
      };
    } catch {
      return {
        dhakaCharge: 70,
        outsideDhakaCharge: 120,
      };
    }
  });

  const [themeSettings, setThemeSettings] = useState(() => {
    try {
      return {
        primaryColor: "#111111",
        accentColor: "#f7f7f5",
        ...JSON.parse(localStorage.getItem("fx_theme_settings") || "{}"),
      };
    } catch {
      return {
        primaryColor: "#111111",
        accentColor: "#f7f7f5",
      };
    }
  });

  const [paymentSettings, setPaymentSettings] = useState(() => {
    try {
      return {
        cashOnDelivery: true,
        bkashEnabled: true,
        bkashNumber: "01897523321",
        nagadEnabled: true,
        nagadNumber: "01897523321",
        ...JSON.parse(localStorage.getItem("fx_payment_settings") || "{}"),
      };
    } catch {
      return {
        cashOnDelivery: true,
        bkashEnabled: true,
        bkashNumber: "01897523321",
        nagadEnabled: true,
        nagadNumber: "01897523321",
      };
    }
  });


  const [seoSettings, setSeoSettings] = useState(() => {
    try {
      return {
        metaTitle: "FX Fashion Gallery | Modern Fashion",
        metaDescription: "Shop modern fashion for Men, Women and Kids at FX Fashion Gallery.",
        keywords: "fashion, clothing, men, women, kids, Bangladesh",
        ...JSON.parse(localStorage.getItem("fx_seo_settings") || "{}"),
      };
    } catch {
      return {
        metaTitle: "FX Fashion Gallery | Modern Fashion",
        metaDescription: "Shop modern fashion for Men, Women and Kids at FX Fashion Gallery.",
        keywords: "fashion, clothing, men, women, kids, Bangladesh",
      };
    }
  });

  const [homepageSettings, setHomepageSettings] = useState(() => {
    try {
      return {
        heroTitle: "Modern fashion. Timeless style.",
        heroSubtitle: "Curated fashion for Men, Women and Kids.",
        heroButtonText: "Shop Collection",
        heroButtonLink: "/shop",
        showHero: true,
        showCategories: true,
        showFeatured: true,
        showNewArrivals: true,
        showBenefits: true,
        ...JSON.parse(localStorage.getItem("fx_homepage_settings") || "{}"),
      };
    } catch {
      return {
        heroTitle: "Modern fashion. Timeless style.",
        heroSubtitle: "Curated fashion for Men, Women and Kids.",
        heroButtonText: "Shop Collection",
        heroButtonLink: "/shop",
        showHero: true,
        showCategories: true,
        showFeatured: true,
        showNewArrivals: true,
        showBenefits: true,
      };
    }
  });

  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      return {
        storeName: "FX Fashion Gallery",
        tagline: "Modern fashion. Timeless style.",
        primaryColor: "#111111",
        accentColor: "#f7f7f5",
        phone: "01897523321",
        whatsapp: "01897523321",
        currency: "৳",
        dhakaDelivery: 70,
        outsideDelivery: 120,
        ...JSON.parse(localStorage.getItem("fx_site_settings") || "{}"),
      };
    } catch {
      return {
        storeName: "FX Fashion Gallery",
        tagline: "Modern fashion. Timeless style.",
        primaryColor: "#111111",
        accentColor: "#f7f7f5",
        phone: "01897523321",
        whatsapp: "01897523321",
        currency: "৳",
        dhakaDelivery: 70,
        outsideDelivery: 120,
      };
    }
  });

  const [socialLinks, setSocialLinks] = useState(() => {
    try {
      return {
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        whatsapp: "01897523321",
        ...JSON.parse(localStorage.getItem("fx_social_links") || "{}"),
      };
    } catch {
      return {
        facebook: "",
        instagram: "",
        tiktok: "",
        youtube: "",
        whatsapp: "01897523321",
      };
    }
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "social"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();
        setSocialLinks((current) => ({ ...current, ...settings }));
        localStorage.setItem("fx_social_links", JSON.stringify(settings));
      }
    });

    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "seo"), (snapshot) => {
      if (snapshot.exists()) {
        const settings = snapshot.data();
        setSeoSettings((current) => ({ ...current, ...settings }));
        localStorage.setItem("fx_seo_settings", JSON.stringify(settings));
      }
    });

    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(Boolean(user));
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loggedIn || auth.currentUser?.uid !== "JfLmcMg26BOJ7VNqyifMzHuV93E3") return;
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const firebaseOrders = snapshot.docs.map((item) => ({ ...item.data(), id: item.data().id || item.id, firestoreId: item.id }));
      firebaseOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(firebaseOrders); setNotice("");
    }, (error) => { console.error("ORDERS FIREBASE ERROR:", error);
      setNotice(error?.message || "Could not load orders from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const firebaseProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setProducts(firebaseProducts);
    }, (error) => { console.error("ORDERS FIREBASE ERROR:", error);
      setNotice(error?.message || "Could not load products from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const firebaseProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setProducts(firebaseProducts);
    }, (error) => { console.error("ORDERS FIREBASE ERROR:", error);
      setNotice(error?.message || "Could not load products from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  const saveSiteSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "store"), siteSettings, { merge: true });
      localStorage.setItem("fx_site_settings", JSON.stringify(siteSettings));
      window.dispatchEvent(new Event("fx-settings-updated"));
      setNotice("Website settings saved successfully.");
    } catch (error) {
      setNotice("Could not save Website settings to Firebase.");
    }
  };

  const saveSeoSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "seo"), seoSettings, { merge: true });
      localStorage.setItem("fx_seo_settings", JSON.stringify(seoSettings));
      setNotice("SEO settings saved successfully.");
    } catch (error) {
      setNotice("Could not save SEO settings to Firebase.");
    }
  };

  const saveSocialLinks = async () => {
    try {
      await setDoc(doc(db, "settings", "social"), socialLinks, { merge: true });
      localStorage.setItem("fx_social_links", JSON.stringify(socialLinks));
      setNotice("Social links saved successfully.");
    } catch (error) {
      setNotice("Could not save Social Links to Firebase.");
    }
  };

  const saveHomepageSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "homepage"), homepageSettings, { merge: true });
      localStorage.setItem("fx_homepage_settings", JSON.stringify(homepageSettings));
      window.dispatchEvent(new Event("fx-homepage-updated"));
      setNotice("Homepage settings saved successfully.");
    } catch (error) {
      setNotice("Could not save Homepage settings to Firebase.");
    }
  };

  if (authLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] text-sm text-black/50">Loading Admin...</main>;
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 text-[#111]">
        <form onSubmit={async (e) => { e.preventDefault(); setNotice(""); try { await signInWithEmailAndPassword(auth, email.trim(), password); } catch (error) { setNotice("Firebase login error: " + (error.code || error.message || "Unknown error")); } }} className="w-full max-w-sm border border-black/10 bg-white p-8">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin Email" autoComplete="email" className="mt-6 w-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-black" />
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin Login</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password" className="mt-7 w-full border border-black/15 px-4 py-4 text-sm outline-none focus:border-black" />
          <button type="submit" className="mt-4 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Login</button>
        </form>
      </main>
    );
  }



  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "settings", "navigation"), (snapshot) => {
      if (snapshot.exists() && Array.isArray(snapshot.data().items)) {
        const items = snapshot.data().items;
        setNavigationItems(items);
        localStorage.setItem("fx_navigation", JSON.stringify(items));
      }
    });

    return () => unsubscribe();
  }, []);

  const saveNavigationSettings = async () => {
    try {
      const cleanItems = navigationItems.map((item, index) => ({
        ...item,
        id: item.id || `nav-${Date.now()}-${index}`,
        label: String(item.label || "").trim(),
        path: String(item.path || "/").trim() || "/",
        icon: item.icon || "•",
        desktop: item.desktop !== false,
        mobile: item.mobile !== false,
        badge: item.badge || "",
        order: index,
      }));

      await setDoc(
        doc(db, "settings", "navigation"),
        { items: cleanItems, updatedAt: new Date().toISOString() },
        { merge: true }
      );

      setNavigationItems(cleanItems);
      localStorage.setItem("fx_navigation", JSON.stringify(cleanItems));
      window.dispatchEvent(new Event("fx-navigation-updated"));
      setNotice("Navigation saved successfully.");
    } catch (error) {
      console.error("Navigation save failed:", error);
      setNotice("Could not save Navigation settings to Firebase.");
    }
  };

  const addNavigationItem = () => {
    setNavigationItems((current) => [
      ...current,
      {
        id: `nav-${Date.now()}`,
        label: "New Menu",
        path: "/shop",
        icon: "•",
        desktop: true,
        mobile: true,
        badge: "",
      },
    ]);
  };

  const updateNavigationItem = (id, changes) => {
    setNavigationItems((current) =>
      current.map((item) => item.id === id ? { ...item, ...changes } : item)
    );
  };

  const deleteNavigationItem = (id) => {
    if (!window.confirm("Delete this navigation item?")) return;
    setNavigationItems((current) => current.filter((item) => item.id !== id));
  };

  const resetNavigation = () => {
    if (!window.confirm("Restore the default FX Fashion Gallery navigation?")) return;
    setNavigationItems(DEFAULT_NAVIGATION);
    localStorage.setItem("fx_navigation", JSON.stringify(DEFAULT_NAVIGATION));
    setNotice("Default navigation restored. Click Save Navigation to publish it.");
  };

  const saveDeliverySettings = async () => {
    try {
      await setDoc(doc(db, "settings", "delivery"), deliverySettings, { merge: true });
      localStorage.setItem("fx_delivery_settings", JSON.stringify(deliverySettings));
      setNotice("Delivery settings saved successfully.");
    } catch (error) {
      setNotice("Could not save Delivery settings to Firebase.");
    }
  };

  const saveThemeSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "theme"), themeSettings, { merge: true });
      localStorage.setItem("fx_theme_settings", JSON.stringify(themeSettings));
      window.dispatchEvent(new Event("fx-theme-updated"));
      setNotice("Theme settings saved successfully.");
    } catch (error) {
      setNotice("Could not save Theme settings to Firebase.");
    }
  };

  const savePaymentSettings = async () => {
    try {
      await setDoc(doc(db, "settings", "payment"), paymentSettings, { merge: true });
      localStorage.setItem("fx_payment_settings", JSON.stringify(paymentSettings));
      setNotice("Payment settings saved successfully.");
    } catch (error) {
      setNotice("Could not save Payment settings to Firebase.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });

      const order = orders.find((item) => item.firestoreId === id);

      if (order) {
        const updatedOrder = { ...order, status };

        setOrders((current) =>
          current.map((item) =>
            item.firestoreId === id ? updatedOrder : item
          )
        );

        const localOrders = JSON.parse(
          localStorage.getItem("fx_orders") || "[]"
        );

        localStorage.setItem(
          "fx_orders",
          JSON.stringify(
            localOrders.map((item) =>
              item.firestoreId === id || item.id === order.id
                ? { ...item, status }
                : item
            )
          )
        );
      }

      setNotice("Order status updated successfully.");
    } catch (error) {
      console.error("Update order status failed:", error);
      setNotice(
        `Could not update order status: ${error?.message || "Unknown error"}`
      );
    }
  };

  const deleteProduct = async (productId) => {
    if (!productId) {
      setNotice("Product delete failed: Product ID not found.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "products", productId));

      setProducts((current) =>
        current.filter((product) => product.id !== productId)
      );

      const localProducts = JSON.parse(
        localStorage.getItem("fx_products") || "[]"
      );

      localStorage.setItem(
        "fx_products",
        JSON.stringify(
          localProducts.filter((product) => product.id !== productId)
        )
      );

      setNotice("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product failed:", error);
      setNotice(
        `Product delete failed: ${error?.message || "Unknown error"}`
      );
    }
  };

  const deleteOrder = async (firestoreId, orderId) => {
    if (!firestoreId) {
      setNotice("Order delete failed: Firestore ID not found.");
      return;
    }

    const confirmed = window.confirm(
      `Delete order ${orderId || firestoreId}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "orders", firestoreId));

      setOrders((current) =>
        current.filter((item) => item.firestoreId !== firestoreId)
      );

      const localOrders = JSON.parse(
        localStorage.getItem("fx_orders") || "[]"
      );

      localStorage.setItem(
        "fx_orders",
        JSON.stringify(
          localOrders.filter(
            (item) =>
              item.firestoreId !== firestoreId &&
              item.id !== orderId
          )
        )
      );

      setNotice(
        `Order ${orderId || firestoreId} deleted successfully.`
      );
    } catch (error) {
      console.error("Delete order failed:", error);
      setNotice(
        `Order delete failed: ${error?.message || "Unknown error"}`
      );
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus });

      const order = orders.find((item) => item.firestoreId === id);

      if (order?.id) {
        await setDoc(doc(db, "orderTracking", order.id), {
          id: order.id,
          status: order.status || "Pending",
          paymentStatus,
          createdAt: order.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }
    } catch (error) {
      setNotice("Could not update payment status.");
    }
  };

  const totalSales = orders.reduce((total, order) => total + Number(order.subtotal || 0), 0);

  const customers = Object.values(
    orders.reduce((map, order) => {
      const customer = order.customer || {};
      const key = customer.phone?.trim() || customer.name?.trim() || order.id;

      if (!map[key]) {
        map[key] = {
          name: customer.name || "Unknown Customer",
          phone: customer.phone || "",
          address: customer.address || "",
          city: customer.city || "",
          area: customer.area || "",
          orders: 0,
          totalSpent: 0,
          lastOrder: order.createdAt || ""
        };
      }

      map[key].orders += 1;
      map[key].totalSpent += Number(order.total || 0);

      if (new Date(order.createdAt || 0) > new Date(map[key].lastOrder || 0)) {
        map[key].lastOrder = order.createdAt || "";
      }

      return map;
    }, {})
  ).sort((a, b) => new Date(b.lastOrder || 0) - new Date(a.lastOrder || 0));

  const saveProduct = async (e) => {
    e.preventDefault();
    setNotice("");

    const validImages = productImages.filter((item) => item.imageData);
    if (!newProduct.name.trim() || !String(newProduct.price).trim() || !validImages.length) {
      setNotice("Please add the product name, price and at least one image before saving.");
      return;
    }

    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: String(newProduct.price).trim(),
      discountEnabled: Boolean(newProduct.discountEnabled),
      discountType: newProduct.discountType,
      discountValue: String(newProduct.discountValue ?? ""),
      stock: String(newProduct.stock ?? ""),
      sizes: String(newProduct.sizes ?? ""),
      rating: String(newProduct.rating ?? "5"),
      featured: Boolean(newProduct.featured),
      newArrival: Boolean(newProduct.newArrival),
      active: newProduct.active !== false,
      description: String(newProduct.description ?? ""),
      imageData: validImages[0].imageData,
      images: validImages.slice(0, 6).map((item) => ({
        imageData: item.imageData,
        color: String(item.color || "").trim(),
      })),
    };

    try {
      if (editingProductId) {
        await updateDoc(doc(db, "products", editingProductId), payload);
        setNotice("Product updated successfully.");
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: new Date().toISOString() });
        setNotice("Product added successfully.");
      }
      resetProductForm();
      setEditingProductId(null);
    } catch (error) {
      console.error("PRODUCT SAVE ERROR:", error);
      setNotice("Could not save product to Firebase.");
    }
  };

  const editProduct = (product) => {
  setEditingProductId(product.id);

  setNewProduct({
    name: product.name || "",
    category: product.category || "Men",
    price: product.price || "",
    discountEnabled: product.discountEnabled || false,
    discountType: product.discountType || "percentage",
    discountValue: product.discountValue || "",
    stock: product.stock || "",
    sizes: product.sizes || "",
    rating: product.rating || "5",
    featured: product.featured || false,
    newArrival: product.newArrival || false,
    active: product.active !== false,
    description: product.description || "",
    imageData: product.imageData || ""
  });

  syncProductImagesFromProduct(product);
  setImageName("");
  window.scrollTo({ top: 0, behavior: "smooth" });
};


const compressProductImage = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve("");
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const maxSize = 1000;
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const handleMultipleProductImage = async (index, event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const imageData = await compressProductImage(file);
    setProductImages((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, imageData } : item
    ));
    if (index === 0) {
      setNewProduct((current) => ({ ...current, imageData }));
    }
    setImageName(file.name);
  } catch (error) {
    console.error("Product image error:", error);
    setNotice("Could not process the product image.");
  }
};

const addProductImageSlot = () => {
  setProductImages((current) =>
    current.length >= 6 ? current : [...current, { imageData: "", color: "" }]
  );
};

const removeProductImageSlot = (index) => {
  setProductImages((current) => {
    const next = current.filter((_, itemIndex) => itemIndex !== index);
    const normalized = next.length ? next : [{ imageData: "", color: "" }];
    setNewProduct((product) => ({ ...product, imageData: normalized[0].imageData || "" }));
    return normalized;
  });
};

const updateProductImageColor = (index, color) => {
  setProductImages((current) =>
    current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, color } : item
    )
  );
};

const syncProductImagesFromProduct = (product) => {
  const source = Array.isArray(product.images) && product.images.length
    ? product.images
    : [{ imageData: product.imageData || "", color: "" }];

  setProductImages(
    source.slice(0, 6).map((item) => ({
      imageData: item.imageData || "",
      color: item.color || ""
    }))
  );
};

const resetProductForm = () => {
  setNewProduct({
    name: "",
    category: "Men",
    price: "",
    discountEnabled: false,
    discountType: "percentage",
    discountValue: "",
    stock: "",
    sizes: "",
    rating: "5",
    featured: false,
    newArrival: false,
    active: true,
    description: "",
    imageData: ""
  });
  setProductImages([{ imageData: "", color: "" }]);
  setImageName("");
  setEditingProductId(null);
};

const handleImage = (e) => {
  handleMultipleProductImage(0, e);
};

  const getOrderStatusClass = (status) => {
    const classes = {
      Pending: "border-amber-200 bg-amber-50 text-amber-800 focus:border-amber-400",
      Processing: "border-blue-200 bg-blue-50 text-blue-800 focus:border-blue-400",
      Shipped: "border-purple-200 bg-purple-50 text-purple-800 focus:border-purple-400",
      Delivered: "border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-400",
    };
    return classes[status] || "border-black/15 bg-white text-black";
  };

  const getPaymentStatusClass = (status) => {
    const classes = {
      Pending: "border-amber-200 bg-amber-50 text-amber-800 focus:border-amber-400",
      Verified: "border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-400",
      Rejected: "border-red-200 bg-red-50 text-red-800 focus:border-red-400",
    };
    return classes[status] || "border-black/15 bg-white text-black";
  };

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      {notice && (
        <div className="fixed inset-x-4 top-4 z-50 mx-auto max-w-xl border border-amber-200 bg-white p-4 shadow-xl md:inset-x-auto md:right-6 md:left-auto md:w-[420px]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">
              !
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700">
                Action Required
              </p>
              <p className="mt-1 text-sm leading-6 text-black/70">{notice}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice("")}
              className="text-lg leading-none text-black/40 transition hover:text-black"
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between rounded-2xl border border-black/10 bg-[#111111] px-5 py-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl border border-white/15 p-2 transition hover:bg-white/10 lg:hidden"
              aria-label="Toggle admin navigation"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-white/40">FX Fashion Gallery</p>
              <p className="mt-1 text-sm font-semibold">Admin Control Center</p>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              await signOut(auth);
              setLoggedIn(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-white/65 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        <div className={`${sidebarOpen ? "block" : "hidden"} mb-6 grid gap-2 rounded-2xl border border-black/10 bg-white p-3 shadow-sm lg:grid lg:grid-cols-4`}>
          {[
            ["Dashboard", LayoutDashboard],
            ["Orders", ShoppingCart],
            ["Products", Package],
            ["Customers", Package],
            ["Homepage", LayoutDashboard],
            ["Theme & Appearance", Settings],
            ["Store Settings", Settings],
            ["Payment", ShoppingCart],
            ["Delivery", Package],
            ["Navigation", Menu],
            ["Social Links", Menu],
            ["SEO", Settings],
            ["Admin & Security", Settings],
          ].map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setActiveTab(name);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-xs font-semibold transition ${
                activeTab === name
                  ? "bg-black text-white"
                  : "text-black/55 hover:bg-black/5 hover:text-black"
              }`}
            >
              <Icon size={17} strokeWidth={1.7} />
              {name}
            </button>
          ))}
        </div>
        <header className="border-b border-black/10 pb-7">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">
            Control Center / {activeTab}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            FX Fashion Gallery
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            {activeTab}
          </h1>
        </header>

        {activeTab === "Dashboard" && <section className="grid gap-4 py-8 md:grid-cols-3">
          <div className="border border-black/10 bg-white p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Total Orders</p>
            <p className="mt-3 text-3xl font-semibold">{orders.length}</p>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Total Sales</p>
            <p className="mt-3 text-3xl font-semibold">৳{totalSales.toLocaleString()}</p>
          </div>

          <div className="border border-black/10 bg-white p-6">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Pending Orders</p>
            <p className="mt-3 text-3xl font-semibold">
              {orders.filter((order) => order.status === "Pending").length}
            </p>
          </div>
        </section>} 

        {activeTab === "Navigation" && (
          <section className="mt-8 space-y-6">
            <div className="border border-black/10 bg-white p-6 md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-black/40">
                    Navigation Management
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                    Website Navigation
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
                    Control the customer-facing desktop and mobile menus from one place.
                    Changes are published to the website through Firebase.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={addNavigationItem}
                    className="bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                  >
                    + Add Menu
                  </button>
                  <button
                    type="button"
                    onClick={resetNavigation}
                    className="border border-black/15 px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em]"
                  >
                    Reset Default
                  </button>
                  <button
                    type="button"
                    onClick={saveNavigationSettings}
                    className="bg-black px-5 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white"
                  >
                    Save Navigation
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {navigationItems.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-black/10 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-4 lg:grid-cols-[auto_1fr_1fr_auto] lg:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center border border-black/10 bg-black/[0.03] text-lg">
                        {item.icon || "•"}
                      </div>
                      <div className="flex h-8 min-w-8 items-center justify-center border border-black/10 text-[10px] font-bold text-black/45">
                        {index + 1}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        value={item.label}
                        onChange={(e) =>
                          updateNavigationItem(item.id, { label: e.target.value })
                        }
                        placeholder="Menu Name"
                        className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                      <input
                        value={item.icon}
                        onChange={(e) =>
                          updateNavigationItem(item.id, { icon: e.target.value })
                        }
                        placeholder="Icon / Emoji"
                        className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <input
                        value={item.path}
                        onChange={(e) =>
                          updateNavigationItem(item.id, { path: e.target.value })
                        }
                        placeholder="/shop or https://example.com"
                        className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
                      />
                      <select
                        value={item.badge || ""}
                        onChange={(e) =>
                          updateNavigationItem(item.id, { badge: e.target.value })
                        }
                        className="mt-2 w-full border border-black/10 px-4 py-3 text-xs outline-none focus:border-black"
                      >
                        <option value="">No Badge</option>
                        <option value="New">New</option>
                        <option value="Sale">Sale</option>
                        <option value="Hot">Hot</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          updateNavigationItem(item.id, { desktop: item.desktop === false })
                        }
                        className={`rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] ${
                          item.desktop !== false
                            ? "bg-black text-white"
                            : "bg-black/5 text-black/40"
                        }`}
                      >
                        Desktop
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateNavigationItem(item.id, { mobile: item.mobile === false })
                        }
                        className={`rounded-full px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] ${
                          item.mobile !== false
                            ? "bg-black text-white"
                            : "bg-black/5 text-black/40"
                        }`}
                      >
                        Mobile
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteNavigationItem(item.id)}
                        className="rounded-full bg-red-50 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-black/10 bg-black/[0.02] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Navigation Tips
              </p>
              <p className="mt-2 text-xs leading-6 text-black/50">
                Use internal paths such as <b>/shop</b> or
                <b> /shop?category=Men</b>. External URLs such as
                <b> https://example.com</b> are also supported by the navigation data.
                The order above controls the menu order.
              </p>
            </div>
          </section>
        )}

        {activeTab === "Customers" && <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Customers</h2>
            <p className="mt-2 text-xs text-black/45">
              Customer profiles are automatically created from completed orders.
            </p>
          </div>

          {customers.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-semibold">No customers yet.</p>
              <p className="mt-2 text-xs text-black/45">
                Customer information will appear here after an order is placed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-black/10 bg-black/[0.02]">
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Customer</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Phone</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Location</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Orders</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Total Spent</th>
                    <th className="px-5 py-4 text-[9px] font-bold uppercase tracking-[0.16em]">Last Order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={customer.phone || customer.name || index} className="border-b border-black/5">
                      <td className="px-5 py-5">
                        <p className="text-sm font-semibold">{customer.name}</p>
                        <p className="mt-1 text-xs text-black/40">{customer.address || "No address"}</p>
                      </td>
                      <td className="px-5 py-5 text-sm">{customer.phone || "—"}</td>
                      <td className="px-5 py-5 text-sm">
                        {[customer.area, customer.city].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-5 text-sm font-semibold">{customer.orders}</td>
                      <td className="px-5 py-5 text-sm font-semibold">
                        ৳{customer.totalSpent.toLocaleString()}
                      </td>
                      <td className="px-5 py-5 text-xs text-black/55">
                        {customer.lastOrder
                          ? new Date(customer.lastOrder).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>}

        {activeTab === "Products" && <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Add Product</h2>
          </div>
          <form onSubmit={saveProduct} className="grid gap-4 p-6 md:grid-cols-2">
            <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product Name" className="border border-black/15 px-4 py-3 text-sm outline-none" />
            <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="border border-black/15 px-4 py-3 text-sm outline-none">
              <option>Men</option><option>Women</option><option>Kids</option>
            </select>
            <input value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" inputMode="numeric" className="border border-black/15 px-4 py-3 text-sm outline-none" />

            <div className="border border-black/10 p-4 md:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Discount</p>
                  <p className="mt-1 text-xs text-black/45">Optional sale pricing for this product.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewProduct({ ...newProduct, discountEnabled: !newProduct.discountEnabled })}
                  className={"relative h-7 w-12 rounded-full transition " + (newProduct.discountEnabled ? "bg-black" : "bg-black/15")}
                >
                  <span className={"absolute top-1 h-5 w-5 rounded-full bg-white transition " + (newProduct.discountEnabled ? "left-6" : "left-1")} />
                </button>
              </div>

              {newProduct.discountEnabled && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <select
                    value={newProduct.discountType}
                    onChange={(e) => setNewProduct({ ...newProduct, discountType: e.target.value })}
                    className="border border-black/15 px-4 py-3 text-sm outline-none"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>

                  <input
                    value={newProduct.discountValue}
                    onChange={(e) => setNewProduct({ ...newProduct, discountValue: e.target.value })}
                    placeholder={newProduct.discountType === "percentage" ? "Discount %" : "Discount Amount"}
                    inputMode="decimal"
                    className="border border-black/15 px-4 py-3 text-sm outline-none"
                  />
                </div>
              )}
            </div>

            <input value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="Stock Quantity" inputMode="numeric" className="border border-black/15 px-4 py-3 text-sm outline-none" />

            <div className="border border-black/15 p-4 md:col-span-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Available Sizes</p>
              <p className="mt-1 text-xs text-black/45">Select only the sizes available for this product.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                {AVAILABLE_SIZES.map((size) => {
                  const selectedSizes = String(newProduct.sizes || "")
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);

                  const checked = selectedSizes.includes(size);

                  return (
                    <label
                      key={size}
                      className={`flex cursor-pointer items-center gap-2 border px-4 py-3 text-xs font-semibold transition ${
                        checked
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black hover:border-black/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const nextSizes = e.target.checked
                            ? [...new Set([...selectedSizes, size])]
                            : selectedSizes.filter((item) => item !== size);

                          setNewProduct({
                            ...newProduct,
                            sizes: nextSizes.join(", ")
                          });
                        }}
                        className="h-4 w-4 accent-black"
                      />
                      {size}
                    </label>
                  );
                })}
              </div>

              <p className="mt-3 text-[10px] text-black/40">
                Selected: {newProduct.sizes || "None"}
              </p>
            </div>

            <input value={newProduct.rating} onChange={(e) => setNewProduct({ ...newProduct, rating: e.target.value })} placeholder="Rating (1-5)" inputMode="decimal" className="border border-black/15 px-4 py-3 text-sm outline-none" />

            <div className="flex flex-wrap gap-3 md:col-span-2">
              <label className="flex items-center gap-2 border border-black/10 px-4 py-3 text-xs">
                <input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })} />
                Featured Product
              </label>

              <label className="flex items-center gap-2 border border-black/10 px-4 py-3 text-xs">
                <input type="checkbox" checked={newProduct.newArrival} onChange={(e) => setNewProduct({ ...newProduct, newArrival: e.target.checked })} />
                New Arrival
              </label>

              <label className="flex items-center gap-2 border border-black/10 px-4 py-3 text-xs">
                <input type="checkbox" checked={newProduct.active} onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })} />
                Product Active
              </label>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-black/10 bg-white p-4">
  <div className="flex items-center justify-between gap-3 mb-4">
    <div>
      <h3 className="font-semibold">Product Images & Colors</h3>
      <p className="text-xs text-black/50 mt-1">Add up to 6 images. Color is optional.</p>
    </div>
    <button type="button" onClick={addProductImageSlot} className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
      + Add Image
    </button>
  </div>

  <div className="space-y-4">
    {productImages.map((item, index) => (
      <div key={index} className="grid gap-3 rounded-2xl border border-black/10 p-3 md:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="mb-2 block text-xs font-medium text-black/60">Image {index + 1}</label>
          <input type="file" accept="image/*" onChange={(e) => handleMultipleProductImage(index, e)} className="w-full border border-black/15 px-3 py-2 text-sm" />
          {item.imageData && <img src={item.imageData} alt={`Product ${index + 1}`} className="mt-3 h-24 w-24 rounded-xl object-cover border border-black/10" />}
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-black/60">Color (optional)</label>
          <input type="text" value={item.color} onChange={(e) => updateProductImageColor(index, e.target.value)} placeholder="e.g. Black" className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm" />
        </div>

        <div className="flex items-end">
          <button type="button" onClick={() => removeProductImageSlot(index)} className="w-full rounded-xl border border-red-200 px-3 py-2 text-sm text-red-600">
            Remove
          </button>
        </div>
      </div>
    ))}
  </div>
</div>
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" rows="4" className="border border-black/15 px-4 py-3 text-sm outline-none md:col-span-2" />
            {imageName && <p className="text-xs text-black/50 md:col-span-2">Selected: {imageName}</p>}
            <button type="submit" className="bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white md:col-span-2">{editingProductId ? "Update Product" : "Add Product"}</button>
          </form>
          <div className="border-t border-black/10 p-6">
            <p className="mb-5 text-sm text-black/50">{products.length} custom product(s) saved.</p>
            {products.length > 0 && <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => <div key={product.id} className="flex gap-4 border border-black/10 p-4">
                <img src={product.imageData} alt={product.name} className="h-24 w-20 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-black/40">{product.category}</p>
                  <h3 className="mt-1 font-semibold">{product.name}</h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">৳{Number(product.price).toLocaleString()}</span>
                    {product.discountEnabled && Number(product.discountValue) > 0 && (
                      <span className="bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white">
                        {product.discountType === "percentage" ? product.discountValue + "% OFF" : "৳" + Number(product.discountValue).toLocaleString() + " OFF"}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-wider">
                    {product.stock !== "" && <span className="border border-black/10 px-2 py-1 text-black/50">Stock {product.stock}</span>}
                    {product.rating && <span className="border border-black/10 px-2 py-1 text-black/50">★ {product.rating}</span>}
                    {product.featured && <span className="border border-black/10 px-2 py-1">Featured</span>}
                    {product.newArrival && <span className="border border-black/10 px-2 py-1">New</span>}
                    <span className={"border px-2 py-1 " + (product.active === false ? "border-red-200 text-red-600" : "border-green-200 text-green-700")}>
                      {product.active === false ? "Hidden" : "Active"}
                    </span>
                  </div>

                  <button type="button" onClick={() => deleteProduct(product.id)} className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-700 transition hover:border-red-300 hover:bg-red-100">Delete</button>
                </div>
              </div>)}
            </div>}
          </div>
        </section>}

        {activeTab === "Orders" && <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Order Management</h2>
                <p className="mt-2 text-xs text-black/45">Search orders securely by Order ID.</p>
              </div>
              <div className="w-full md:w-80">
                <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-black/40">Search Order ID</label>
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(event) => setOrderSearch(event.target.value)}
                  placeholder="e.g. FX-60140082"
                  className="w-full border border-black/15 bg-[#fafaf8] px-4 py-3 text-sm outline-none transition focus:border-black focus:bg-white"
                />
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <p className="p-8 text-sm text-black/50">No orders yet.</p>
          ) : (
            <div className="divide-y divide-black/10">
              {orders.filter((order) => order.id?.toLowerCase().includes(orderSearch.trim().toLowerCase())).map((order) => {
                const deliveryCharge = Number(order.deliveryCharge ?? 0);
                const total = Number(order.total ?? (Number(order.subtotal || 0) + deliveryCharge));

                return (
                  <article key={order.id} className="p-6 md:p-8">
                    <div className="flex flex-col gap-5 border-b border-black/10 pb-6 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Order</p>
                        <h3 className="mt-2 text-xl font-semibold tracking-tight">{order.id}</h3>
                        <p className="mt-1 text-xs text-black/45">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Date unavailable"}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => deleteOrder(order.firestoreId, order.id)}
                          className="border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-700 transition hover:border-red-300 hover:bg-red-100"
                        >
                          🗑️ Delete
                        </button>

                        <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Status</span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenStatusId(openStatusId === order.id ? null : order.id);
                              setOpenPaymentId(null);
                            }}
                            className={`min-w-32 cursor-pointer border px-3 py-2 text-xs font-semibold outline-none transition hover:shadow-sm ${getOrderStatusClass(order.status)}`}
                          >
                            {order.status}
                            <span className="ml-3 text-[9px] opacity-60">▼</span>
                          </button>

                          {openStatusId === order.id && (
                            <div className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-lg border border-black/10 bg-white p-1 shadow-xl">
                              {["Pending", "Processing", "Shipped", "Delivered"].map((status) => (
                                <button
                                  key={status}
                                  type="button"
                                  onClick={() => {
                                    updateStatus(order.firestoreId, status);
                                    setOpenStatusId(null);
                                  }}
                                  className={`mb-1 w-full border px-3 py-2 text-left text-xs font-semibold transition last:mb-0 hover:shadow-sm ${getOrderStatusClass(status)}`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-8 py-7 lg:grid-cols-2">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Customer Information</p>
                        <div className="mt-4 space-y-3 text-sm">
                          <p><span className="font-semibold">Name:</span> {order.customer?.name || "—"}</p>
                          <p><span className="font-semibold">Phone:</span> {order.customer?.phone || "—"}</p>
                          <p><span className="font-semibold">Address:</span> {order.customer?.address || "—"}</p>
                          <p><span className="font-semibold">City:</span> {order.customer?.city || "—"}</p>
                          <p><span className="font-semibold">Area/District:</span> {order.customer?.area || "—"}</p>
                          <p><span className="font-semibold">Payment:</span> {order.paymentMethod || "—"}</p>
                    {order.paymentMethod === "Cash on Delivery" && (
                      <p><span className="font-semibold">Payment Status:</span> Not Required</p>
                    )}
                    {order.paymentMethod && order.paymentMethod !== "Cash on Delivery" && (
                      <>
                        <p><span className="font-semibold">Transaction ID:</span> {order.transactionId || "—"}</p>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">Payment Status:</span>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenPaymentId(openPaymentId === order.id ? null : order.id);
                                setOpenStatusId(null);
                              }}
                              className={`min-w-28 cursor-pointer border px-3 py-2 text-xs font-semibold outline-none transition hover:shadow-sm ${getPaymentStatusClass(order.paymentStatus || "Pending")}`}
                            >
                              {order.paymentStatus || "Pending"}
                              <span className="ml-2 text-[9px] opacity-60">▼</span>
                            </button>

                            {openPaymentId === order.id && (
                              <div className="absolute left-0 z-30 mt-2 w-36 overflow-hidden rounded-lg border border-black/10 bg-white p-1 shadow-xl">
                                {["Pending", "Verified", "Rejected"].map((paymentStatus) => (
                                  <button
                                    key={paymentStatus}
                                    type="button"
                                    onClick={() => {
                                      updatePaymentStatus(order.firestoreId, paymentStatus);
                                      setOpenPaymentId(null);
                                    }}
                                    className={`mb-1 w-full border px-3 py-2 text-left text-xs font-semibold transition last:mb-0 hover:shadow-sm ${getPaymentStatusClass(paymentStatus)}`}
                                  >
                                    {paymentStatus}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Order Items</p>
                        <div className="mt-4 space-y-4">
                          {(order.items || []).map((item, index) => (
                            <div key={`${item.name}-${index}`} className="flex gap-4 border border-black/10 p-4">
                              <img
                                src={item.imageData || item.selectedImageData || (item.image ? `https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=300&q=80` : "")}
                                alt={item.name}
                                className="h-24 w-20 shrink-0 object-cover bg-[#f0f0ed]"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">{item.category || "Product"}</p>
                                <h4 className="mt-1 font-semibold">{item.name}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-black/60">
                                  <p>Size: <span className="font-semibold text-black">{item.size || "—"}</span></p>
                                  <p>Qty: <span className="font-semibold text-black">{item.quantity || 0}</span></p>
                                  <p>Unit Price: <span className="font-semibold text-black">{item.price}</span></p>
                                  <p>Line Total: <span className="font-semibold text-black">৳{(Number(item.salePrice ?? String(item.price || "0").replace(/[^0-9.]/g, "")) * Number(item.quantity || 0)).toLocaleString()}</span></p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/10 pt-6 md:ml-auto md:max-w-sm">
                      <div className="flex justify-between py-1 text-sm">
                        <span>Subtotal</span>
                        <span>৳{Number(order.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-1 text-sm">
                        <span>Delivery Charge</span>
                        <span>৳{deliveryCharge.toLocaleString()}</span>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-base font-bold">
                        <span>Grand Total</span>
                        <span>৳{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>}

        {activeTab === "Delivery" && (
          <section className="mt-8 space-y-6">
            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Delivery Settings</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Delivery Charges</h2>
              <p className="mt-2 text-sm text-black/50">Set the delivery charge customers will see at checkout.</p>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.18em]">
                    Dhaka Delivery Charge
                  </label>
                  <div className="mt-2 flex items-center border border-black/15 bg-white">
                    <span className="px-4 text-sm text-black/50">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={deliverySettings.dhakaCharge}
                      onChange={(e) => setDeliverySettings({ ...deliverySettings, dhakaCharge: e.target.value })}
                      className="w-full px-2 py-3 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.18em]">
                    Outside Dhaka Delivery Charge
                  </label>
                  <div className="mt-2 flex items-center border border-black/15 bg-white">
                    <span className="px-4 text-sm text-black/50">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={deliverySettings.outsideDhakaCharge}
                      onChange={(e) => setDeliverySettings({ ...deliverySettings, outsideDhakaCharge: e.target.value })}
                      className="w-full px-2 py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={saveDeliverySettings}
                className="mt-6 bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
              >
                Save Delivery Settings
              </button>
            </div>
          </section>
        )}

        {activeTab === "Theme & Appearance" && (
          <section className="mt-8 space-y-6">
            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Theme & Appearance</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Brand Colors</h2>
              <p className="mt-2 text-sm text-black/50">
                Customize the main colors used across FX Fashion Gallery.
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
                    Primary Color
                  </span>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings((current) => ({
                          ...current,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="h-12 w-16 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                    />
                    <input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) =>
                        setThemeSettings((current) => ({
                          ...current,
                          primaryColor: e.target.value,
                        }))
                      }
                      className="h-12 flex-1 rounded-lg border border-black/10 px-4 text-sm outline-none focus:border-black"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-black/50">
                    Accent Color
                  </span>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="color"
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings((current) => ({
                          ...current,
                          accentColor: e.target.value,
                        }))
                      }
                      className="h-12 w-16 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                    />
                    <input
                      type="text"
                      value={themeSettings.accentColor}
                      onChange={(e) =>
                        setThemeSettings((current) => ({
                          ...current,
                          accentColor: e.target.value,
                        }))
                      }
                      className="h-12 flex-1 rounded-lg border border-black/10 px-4 text-sm outline-none focus:border-black"
                    />
                  </div>
                </label>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveThemeSettings}
                  className="rounded-lg bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-black/80"
                >
                  Save Theme Settings
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setThemeSettings({
                      primaryColor: "#111111",
                      accentColor: "#f7f7f5",
                    })
                  }
                  className="rounded-lg border border-black/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] hover:bg-black/5"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Social Links" && (<section className="mt-8 space-y-6"><div className="border border-black/10 bg-white p-6 md:p-8"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Social Presence</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Social Links</h2><p className="mt-2 text-sm text-black/50">Add your official social media and WhatsApp links.</p><div className="mt-8 grid gap-4 md:grid-cols-2"><input value={socialLinks.facebook} onChange={(e)=>setSocialLinks({...socialLinks,facebook:e.target.value})} placeholder="Facebook URL" className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"/><input value={socialLinks.instagram} onChange={(e)=>setSocialLinks({...socialLinks,instagram:e.target.value})} placeholder="Instagram URL" className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"/><input value={socialLinks.tiktok} onChange={(e)=>setSocialLinks({...socialLinks,tiktok:e.target.value})} placeholder="TikTok URL" className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"/><input value={socialLinks.youtube} onChange={(e)=>setSocialLinks({...socialLinks,youtube:e.target.value})} placeholder="YouTube URL" className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"/><input value={socialLinks.whatsapp} onChange={(e)=>setSocialLinks({...socialLinks,whatsapp:e.target.value})} placeholder="WhatsApp Number" className="border border-black/10 px-4 py-3 text-sm outline-none focus:border-black md:col-span-2"/></div><div className="mt-6 flex justify-end"><button onClick={saveSocialLinks} className="bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white">Save Social Links</button></div></div></section>)}

{activeTab === "SEO" && (
  <section className="mt-8 space-y-6">
    <div className="border border-black/10 bg-white p-6 md:p-8">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Search Visibility</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">SEO Settings</h2>
      <p className="mt-2 text-sm text-black/50">Control the main title and description used by search engines.</p>

      <div className="mt-8 space-y-4">
        <input
          value={seoSettings.metaTitle}
          onChange={(e) => setSeoSettings({ ...seoSettings, metaTitle: e.target.value })}
          placeholder="Meta Title"
          className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
        />

        <textarea
          value={seoSettings.metaDescription}
          onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
          placeholder="Meta Description"
          rows="4"
          className="w-full resize-none border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
        />

        <input
          value={seoSettings.keywords}
          onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value })}
          placeholder="Keywords separated by commas"
          className="w-full border border-black/10 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={saveSeoSettings}
          className="bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-black/80"
        >
          Save SEO Settings
        </button>
      </div>
    </div>
  </section>
)}

{activeTab === "Admin & Security" && (
  <section className="mt-8 space-y-6">
    <div className="border border-black/10 bg-white p-6 md:p-8">
      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Security Center</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">Admin & Security</h2>
      <p className="mt-2 text-sm text-black/50">Your admin access is protected by Firebase Authentication.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="border border-black/10 p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Authentication</p>
          <p className="mt-2 text-sm font-semibold text-emerald-700">Firebase Authentication Active</p>
          <p className="mt-2 text-xs leading-5 text-black/50">Only authenticated admin users can access protected dashboard operations.</p>
        </div>

        <div className="border border-black/10 p-5">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Current Admin</p>
          <p className="mt-2 break-all text-sm font-semibold">{(auth.currentUser?.email || "Authenticated Admin") + " | UID: " + (auth.currentUser?.uid || "")}</p>
        </div>
      </div>

      <div className="mt-6 border border-black/10 p-5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">Password Security</p>
        <p className="mt-2 text-sm text-black/60">Send a secure password-reset email to the current admin account.</p>

        <button
          type="button"
          onClick={async () => {
            try {
              const currentEmail = auth.currentUser?.email;
              if (!currentEmail) {
                setNotice("No authenticated admin email was found.");
                return;
              }
              await sendPasswordResetEmail(auth, currentEmail);
              setNotice("Password reset email sent successfully.");
            } catch (error) {
              setNotice("Could not send password reset email.");
            }
          }}
          className="mt-4 bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white hover:bg-black/80"
        >
          Send Password Reset Email
        </button>
      </div>
    </div>
  </section>
)}

{activeTab === "Payment" && (
          <section className="mt-8 space-y-6">
            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Payment Settings</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Payment Methods</h2>
              <p className="mt-2 text-sm text-black/50">Choose which payment methods customers can use at checkout.</p>

              <div className="mt-8 space-y-4">

                <label className="flex items-center justify-between border border-black/10 p-4">
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="mt-1 text-xs text-black/50">Allow customers to pay when the order is delivered.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={paymentSettings.cashOnDelivery}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, cashOnDelivery: e.target.checked })}
                    className="h-5 w-5"
                  />
                </label>

                <div className="border border-black/10 p-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">bKash</p>
                      <p className="mt-1 text-xs text-black/50">Accept bKash payments.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.bkashEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashEnabled: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </label>

                  {paymentSettings.bkashEnabled && (
                    <input
                      value={paymentSettings.bkashNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashNumber: e.target.value })}
                      placeholder="bKash Number"
                      className="mt-4 w-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  )}
                </div>

                <div className="border border-black/10 p-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Nagad</p>
                      <p className="mt-1 text-xs text-black/50">Accept Nagad payments.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentSettings.nagadEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, nagadEnabled: e.target.checked })}
                      className="h-5 w-5"
                    />
                  </label>

                  {paymentSettings.nagadEnabled && (
                    <input
                      value={paymentSettings.nagadNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, nagadNumber: e.target.value })}
                      placeholder="Nagad Number"
                      className="mt-4 w-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                    />
                  )}
                </div>

              </div>

              <button
                type="button"
                onClick={savePaymentSettings}
                className="mt-6 bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition hover:bg-black/80"
              >
                Save Payment Settings
              </button>
            </div>
          </section>
        )}

        {activeTab === "Homepage" && (
          <section className="mt-8 space-y-6">

            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Homepage Control Center</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Hero Section</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={homepageSettings.heroTitle}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroTitle: e.target.value })}
                  placeholder="Hero Title"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={homepageSettings.heroSubtitle}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroSubtitle: e.target.value })}
                  placeholder="Hero Subtitle"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={homepageSettings.heroButtonText}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonText: e.target.value })}
                  placeholder="Button Text"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={homepageSettings.heroButtonLink}
                  onChange={(e) => setHomepageSettings({ ...homepageSettings, heroButtonLink: e.target.value })}
                  placeholder="Button Link"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Homepage Sections</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Visibility Controls</h2>

              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[
                  ["showHero", "Hero Section"],
                  ["showCategories", "Categories"],
                  ["showFeatured", "Featured Products"],
                  ["showNewArrivals", "New Arrivals"],
                  ["showBenefits", "Benefits Section"],
                ].map(([key, label]) => (
                  <label
                    key={key}
                    className="flex cursor-pointer items-center justify-between border border-black/10 p-4"
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <input
                      type="checkbox"
                      checked={homepageSettings[key]}
                      onChange={(e) =>
                        setHomepageSettings({
                          ...homepageSettings,
                          [key]: e.target.checked
                        })
                      }
                      className="h-5 w-5 accent-black"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveHomepageSettings}
                className="rounded-xl bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
              >
                Save Homepage Settings
              </button>
            </div>

          </section>
        )}

        {activeTab === "Store Settings" && (
          <section className="mt-8 space-y-6">

            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Store Identity</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Brand & Contact</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={siteSettings.storeName}
                  onChange={(e) => setSiteSettings({ ...siteSettings, storeName: e.target.value })}
                  placeholder="Store Name"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={siteSettings.tagline}
                  onChange={(e) => setSiteSettings({ ...siteSettings, tagline: e.target.value })}
                  placeholder="Website Tagline"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={siteSettings.phone}
                  onChange={(e) => setSiteSettings({ ...siteSettings, phone: e.target.value })}
                  placeholder="Phone Number"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={siteSettings.whatsapp}
                  onChange={(e) => setSiteSettings({ ...siteSettings, whatsapp: e.target.value })}
                  placeholder="WhatsApp Number"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Appearance</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Theme Controls</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <label className="flex items-center justify-between border border-black/10 p-4">
                  <div>
                    <p className="text-sm font-semibold">Primary Color</p>
                    <p className="mt-1 text-xs text-black/45">Buttons and main accents</p>
                  </div>
                  <input
                    type="color"
                    value={siteSettings.primaryColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, primaryColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer border-0 bg-transparent"
                  />
                </label>

                <label className="flex items-center justify-between border border-black/10 p-4">
                  <div>
                    <p className="text-sm font-semibold">Background Color</p>
                    <p className="mt-1 text-xs text-black/45">Website background</p>
                  </div>
                  <input
                    type="color"
                    value={siteSettings.accentColor}
                    onChange={(e) => setSiteSettings({ ...siteSettings, accentColor: e.target.value })}
                    className="h-10 w-14 cursor-pointer border-0 bg-transparent"
                  />
                </label>
              </div>
            </div>

            <div className="border border-black/10 bg-white p-6 md:p-8">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/40">Commerce</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Delivery & Currency</h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <input
                  value={siteSettings.currency}
                  onChange={(e) => setSiteSettings({ ...siteSettings, currency: e.target.value })}
                  placeholder="Currency Symbol"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={siteSettings.dhakaDelivery}
                  onChange={(e) => setSiteSettings({ ...siteSettings, dhakaDelivery: e.target.value })}
                  placeholder="Dhaka Delivery"
                  inputMode="numeric"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <input
                  value={siteSettings.outsideDelivery}
                  onChange={(e) => setSiteSettings({ ...siteSettings, outsideDelivery: e.target.value })}
                  placeholder="Outside Dhaka Delivery"
                  inputMode="numeric"
                  className="border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveSiteSettings}
                className="rounded-xl bg-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
              >
                Save All Website Settings
              </button>
            </div>

          </section>
        )}
      </div>
    </main>
  );
}
