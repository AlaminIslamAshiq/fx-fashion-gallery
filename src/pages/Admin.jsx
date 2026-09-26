import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.js";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, Menu, X, TrendingUp, Clock3, CheckCircle2 } from "lucide-react";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("fx_orders") || "[]"));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("fx_products") || "[]"));
  const [newProduct, setNewProduct] = useState({ name: "", category: "Men", price: "", description: "", imageData: "" });
  const [imageName, setImageName] = useState("");
  const [openStatusId, setOpenStatusId] = useState(null);
  const [openPaymentId, setOpenPaymentId] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedIn(Boolean(user));
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const firebaseOrders = snapshot.docs.map((item) => ({ ...item.data(), id: item.data().id || item.id, firestoreId: item.id }));
      firebaseOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(firebaseOrders);
    }, () => {
      setNotice("Could not load orders from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const firebaseProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setProducts(firebaseProducts);
    }, () => {
      setNotice("Could not load products from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const firebaseProducts = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setProducts(firebaseProducts);
    }, () => {
      setNotice("Could not load products from Firebase.");
    });
    return () => unsubscribe();
  }, [loggedIn]);

  const saveSiteSettings = () => {
    localStorage.setItem("fx_site_settings", JSON.stringify(siteSettings));
    window.dispatchEvent(new Event("fx-settings-updated"));
    setNotice("Website settings saved successfully.");
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



  const updateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, "orders", id), { status });
    } catch (error) {
      setNotice("Firebase error: " + (error.code || error.message || "Unknown error"));
    }
  };

  const updatePaymentStatus = async (id, paymentStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus });
    } catch (error) {
      setNotice("Could not update payment status.");
    }
  };

  const totalSales = orders.reduce((total, order) => total + Number(order.subtotal || 0), 0);
  const addProduct = async (e) => {
    e.preventDefault();
    if (newProduct.name.trim() == "" || newProduct.price.trim() == "" || newProduct.imageData == "") {
      setNotice("Please add the product name, price and image before saving.");
      return;
    }
    try {
      await addDoc(collection(db, "products"), {
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: newProduct.price,
        description: newProduct.description,
        imageData: newProduct.imageData,
        createdAt: new Date().toISOString(),
      });
      setNewProduct({ name: "", category: "Men", price: "", description: "", imageData: "" });
      setImageName("");
      setNotice("Product added successfully.");
    } catch (error) {
      setNotice("Could not save product to Firebase.");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, "products", id));
      setNotice("Product deleted successfully.");
    } catch (error) {
      setNotice("Could not delete product from Firebase.");
    }
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setNotice("The selected image is larger than 2MB. Please choose a smaller image."); return; }
    const reader = new FileReader();
    reader.onload = () => setNewProduct((current) => ({ ...current, imageData: reader.result }));
    reader.readAsDataURL(file);
    setImageName(file.name);
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
            ["Settings", Settings],
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

        {activeTab === "Products" && <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Add Product</h2>
          </div>
          <form onSubmit={addProduct} className="grid gap-4 p-6 md:grid-cols-2">
            <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product Name" className="border border-black/15 px-4 py-3 text-sm outline-none" />
            <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="border border-black/15 px-4 py-3 text-sm outline-none">
              <option>Men</option><option>Women</option><option>Kids</option>
            </select>
            <input value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Price" inputMode="numeric" className="border border-black/15 px-4 py-3 text-sm outline-none" />
            <input type="file" accept="image/*" onChange={handleImage} className="border border-black/15 px-4 py-3 text-sm" />
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Description" rows="4" className="border border-black/15 px-4 py-3 text-sm outline-none md:col-span-2" />
            {imageName && <p className="text-xs text-black/50 md:col-span-2">Selected: {imageName}</p>}
            <button type="submit" className="bg-black px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white md:col-span-2">Add Product</button>
          </form>
          <div className="border-t border-black/10 p-6">
            <p className="mb-5 text-sm text-black/50">{products.length} custom product(s) saved.</p>
            {products.length > 0 && <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => <div key={product.id} className="flex gap-4 border border-black/10 p-4">
                <img src={product.imageData} alt={product.name} className="h-24 w-20 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-black/40">{product.category}</p>
                  <h3 className="mt-1 font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm">৳{Number(product.price).toLocaleString()}</p>
                  <button type="button" onClick={() => deleteProduct(product.id)} className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-red-700 transition hover:border-red-300 hover:bg-red-100">Delete</button>
                </div>
              </div>)}
            </div>}
          </div>
        </section>}

        {activeTab === "Orders" && <section className="mt-8 border border-black/10 bg-white">
          <div className="border-b border-black/10 p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Recent Orders</h2>
          </div>

          {orders.length === 0 ? (
            <p className="p-8 text-sm text-black/50">No orders yet.</p>
          ) : (
            <div className="divide-y divide-black/10">
              {orders.map((order) => {
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

                      <div className="flex items-center gap-3">
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
                                      updatePaymentStatus(order.id, paymentStatus);
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
                                src={item.imageData || (item.image ? `https://images.unsplash.com/${item.image}?auto=format&fit=crop&w=300&q=80` : "")}
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
                                  <p>Line Total: <span className="font-semibold text-black">৳{(Number(String(item.price).replace(/[^0-9]/g, "")) * Number(item.quantity || 0)).toLocaleString()}</span></p>
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

        {activeTab === "Settings" && (
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
