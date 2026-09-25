import { useState } from "react";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("fx_admin_auth") === "true");
  const [password, setPassword] = useState("");

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f5] px-5 text-[#111]">
        <form onSubmit={(e) => { e.preventDefault(); if (password === "FXAdmin2026") { sessionStorage.setItem("fx_admin_auth", "true"); setLoggedIn(true); } else { alert("Incorrect password."); } }} className="w-full max-w-sm border border-black/10 bg-white p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">FX Fashion Gallery</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Admin Login</h1>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin Password" className="mt-7 w-full border border-black/15 px-4 py-4 text-sm outline-none focus:border-black" />
          <button type="submit" className="mt-4 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Login</button>
        </form>
      </main>
    );
  }

  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem("fx_orders") || "[]"));

  const updateStatus = (id, status) => {
    const updatedOrders = orders.map((order) => order.id === id ? { ...order, status } : order);
    setOrders(updatedOrders);
    localStorage.setItem("fx_orders", JSON.stringify(updatedOrders));
  };

  const totalSales = orders.reduce((total, order) => total + Number(order.subtotal || 0), 0);
  const products = JSON.parse(localStorage.getItem("fx_products") || "[]");

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
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
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">Products</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-black/50">{products.length} custom product(s) saved.</p>
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
              {orders.map((order) => (
                <div key={order.id} className="grid gap-3 p-6 md:grid-cols-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Order</p>
                    <p className="mt-1 text-sm font-semibold">{order.id}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Customer</p>
                    <p className="mt-1 text-sm">{order.customer.name}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Phone</p>
                    <p className="mt-1 text-sm">{order.customer.phone}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Amount</p>
                    <p className="mt-1 text-sm font-semibold">৳{Number(order.subtotal).toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">Status</p>
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="mt-1 border border-black/15 bg-white px-2 py-1 text-xs outline-none">
                      <option>Pending</option>
                      <option>Processing</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
