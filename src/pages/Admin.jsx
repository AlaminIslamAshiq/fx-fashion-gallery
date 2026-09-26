import { useState } from "react";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("fx_admin_auth") === "true");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("fx_orders") || "[]"));
  const [products, setProducts] = useState(() => JSON.parse(localStorage.getItem("fx_products") || "[]"));
  const [newProduct, setNewProduct] = useState({ name: "", category: "Men", price: "", description: "", imageData: "" });
  const [imageName, setImageName] = useState("");
  const [openStatusId, setOpenStatusId] = useState(null);
  const [openPaymentId, setOpenPaymentId] = useState(null);

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 text-[#111]">
        <form onSubmit={(e) => { e.preventDefault(); if (password === "FXAdmin2026") { sessionStorage.setItem("fx_admin_auth", "true"); setLoggedIn(true); } else { setNotice("Incorrect password. Please check your admin password and try again."); } }} className="w-full max-w-sm border border-black/10 bg-white p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin Login</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password" className="mt-7 w-full border border-black/15 px-4 py-4 text-sm outline-none focus:border-black" />
          <button type="submit" className="mt-4 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Login</button>
        </form>
      </main>
    );
  }



  const updateStatus = (id, status) => {
    const updatedOrders = orders.map((order) => order.id === id ? { ...order, status } : order);
    setOrders(updatedOrders);
    localStorage.setItem("fx_orders", JSON.stringify(updatedOrders));
  };

  const updatePaymentStatus = (id, paymentStatus) => {
    const updatedOrders = orders.map((order) => order.id === id ? { ...order, paymentStatus } : order);
    setOrders(updatedOrders);
    localStorage.setItem("fx_orders", JSON.stringify(updatedOrders));
  };

  const totalSales = orders.reduce((total, order) => total + Number(order.subtotal || 0), 0);
  const addProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price.trim() || !newProduct.imageData) { setNotice("Please add the product name, price and image before saving."); return; }
    const product = { ...newProduct, id: Date.now() };
    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem("fx_products", JSON.stringify(updatedProducts));
    setNewProduct({ name: "", category: "Men", price: "", description: "", imageData: "" });
    setImageName("");
  };
  const deleteProduct = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem("fx_products", JSON.stringify(updatedProducts));
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
        <header className="border-b border-black/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            FX Fashion Gallery
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Admin Dashboard
          </h1>
        </header>

        <section className="grid gap-4 py-8 md:grid-cols-3">
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
        </section>

        <section className="mt-8 border border-black/10 bg-white">
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
        </section>

        <section className="mt-8 border border-black/10 bg-white">
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
                                    updateStatus(order.id, status);
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
        </section>
      </div>
    </main>
  );
}
