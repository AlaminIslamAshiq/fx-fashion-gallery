import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { PackageSearch, CheckCircle2, Clock3, Truck, XCircle } from "lucide-react";
import { db } from "../firebase.js";

const steps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const trackOrder = async (event) => {
    event.preventDefault();

    const id = orderId.trim().toUpperCase();

    if (!id) {
      setNotice("Please enter your order ID.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setNotice("");
    setOrder(null);

    try {
      const snapshot = await getDoc(doc(db, "orderTracking", id));

      if (!snapshot.exists()) {
        setNotice("Order not found. Please check your order ID.");
        return;
      }

      setOrder(snapshot.data());
    } catch (error) {
      setNotice("Could not track this order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = order ? steps.indexOf(order.status) : -1;
  const isCancelled = order?.status === "Cancelled";
  const isReturned = order?.status === "Returned";

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-12 md:px-8 md:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
            <PackageSearch size={28} />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-black/50">
            FX Fashion Gallery
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">
            Track Your Order
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/60 md:text-base">
            Enter your order ID to check your latest order status.
          </p>
        </div>

        <form
          onSubmit={trackOrder}
          className="mx-auto mt-10 flex max-w-2xl flex-col gap-3 rounded-3xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row"
        >
          <input
            value={orderId}
            onChange={(event) => setOrderId(event.target.value)}
            placeholder="Enter order ID, e.g. FX-12345678"
            className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#f7f7f5] px-5 py-4 text-sm outline-none focus:border-black"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-black px-7 py-4 text-sm font-semibold text-white transition hover:bg-black/80 disabled:opacity-60"
          >
            {loading ? "Checking..." : "Track Order"}
          </button>
        </form>

        {notice && (
          <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {notice}
          </div>
        )}

        {order && (
          <section className="mt-10 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
                  Order ID
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{order.id}</h2>
              </div>

              <div className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                {order.status}
              </div>
            </div>

            {isCancelled || isReturned ? (
              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-red-50 p-5 text-red-700">
                <XCircle size={28} />
                <div>
                  <p className="font-semibold">Order {order.status}</p>
                  <p className="mt-1 text-sm">
                    Please contact FX Fashion Gallery if you need assistance.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-10 space-y-7">
                {steps.map((step, index) => {
                  const completed = currentIndex >= index;
                  const active = currentIndex === index;

                  return (
                    <div key={step} className="flex items-center gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                          completed ? "bg-black text-white" : "bg-black/5 text-black/30"
                        }`}
                      >
                        {step === "Shipped" ? (
                          <Truck size={19} />
                        ) : active ? (
                          <Clock3 size={19} />
                        ) : (
                          <CheckCircle2 size={19} />
                        )}
                      </div>

                      <div>
                        <p className={`font-semibold ${completed ? "text-black" : "text-black/30"}`}>
                          {step}
                        </p>
                        {active && (
                          <p className="mt-1 text-sm text-black/50">
                            Your order is currently here.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-10 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#f7f7f5] p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                  Payment
                </p>
                <p className="mt-2 font-semibold">{order.paymentStatus}</p>
              </div>

              <div className="rounded-2xl bg-[#f7f7f5] p-5">
                <p className="text-xs uppercase tracking-[0.15em] text-black/40">
                  Last Updated
                </p>
                <p className="mt-2 font-semibold">
                  {order.updatedAt
                    ? new Date(order.updatedAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
