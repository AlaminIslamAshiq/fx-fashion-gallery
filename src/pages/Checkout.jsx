import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase.js";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const buyNowIndex = searchParams.get("buyNow");
  const buyNowSize = searchParams.get("size") || "M";
  const buyNowQuantity = Number(searchParams.get("quantity") || 1);
  const defaultProducts = [
    { category: "Men", name: "Essential Oversized Shirt", price: "৳1,890", image: "photo-1602810318383-e386cc2a3ccf", description: "A premium everyday oversized shirt designed for effortless modern style." },
    { category: "Women", name: "Minimal Everyday Dress", price: "৳2,490", image: "photo-1595777457583-95e059d581b8", description: "A clean and elegant everyday dress made for modern comfort and style." },
    { category: "Men", name: "Classic Street Jacket", price: "৳2,790", image: "photo-1551028719-00167b16eac5", description: "A versatile street-inspired jacket that adds a refined edge to any look." },
    { category: "Women", name: "Modern Casual Look", price: "৳2,190", image: "photo-1539109136881-3be0616acf4b", description: "A modern casual fashion piece designed for everyday confidence." }
  ];
  const customProducts = JSON.parse(localStorage.getItem("fx_products") || "[]");
  const allProducts = [...defaultProducts, ...customProducts];
  const directProduct = buyNowIndex !== null ? allProducts[Number(buyNowIndex)] : null;
  const checkoutItems = directProduct ? [{ ...directProduct, size: buyNowSize, quantity: buyNowQuantity }] : cartItems;
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", city: "", area: "" });
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");

  const placeOrder = async () => {
    const missingFields = [];

    if (!customer.name.trim()) missingFields.push("Full Name");
    if (!customer.phone.trim()) missingFields.push("Phone Number");
    if (!customer.address.trim()) missingFields.push("Delivery Address");
    if (!customer.city.trim()) missingFields.push("City");
    if (!customer.area.trim()) missingFields.push("Area / District");
    if (checkoutItems.length === 0) missingFields.push("Product");

    if (paymentMethod !== "Cash on Delivery" && !transactionId.trim()) {
      missingFields.push("Transaction ID");
    }

    if (missingFields.length > 0) {
      setValidationMessage(`Please complete: ${missingFields.join(", ")}.`);
      return;
    }

    const newOrderId = `FX-${Date.now().toString().slice(-8)}`;
    const order = { id: newOrderId, customer, items: checkoutItems, subtotal, deliveryCharge, total, paymentMethod, transactionId: paymentMethod === "Cash on Delivery" ? "" : transactionId.trim(), paymentStatus: paymentMethod === "Cash on Delivery" ? "Not Required" : "Pending", status: "Pending", createdAt: new Date().toISOString() };
    try {
      await addDoc(collection(db, "orders"), order);
    } catch (error) {
      setValidationMessage("Could not place the order. Please try again.");
      return;
    }
    setOrderId(newOrderId);
    setOrderPlaced(true);
    if (!directProduct) clearCart();
  };

  const subtotal = checkoutItems.reduce((total, item) => {
    const rawPrice = item.salePrice ?? item.price ?? 0;
    const price = typeof rawPrice === "number"
      ? rawPrice
      : Number(String(rawPrice).replace(/[^0-9.]/g, "")) || 0;

    return total + price * Number(item.quantity || 0);
  }, 0);

  const deliveryCharge = customer.city.trim() ? (customer.city.trim().toLowerCase() === "dhaka" ? 70 : 120) : 0;
  const total = subtotal + deliveryCharge;

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-8 text-[#111] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link to="/cart" className="text-[10px] font-bold uppercase tracking-[0.2em]">
          ← Back to Cart
        </Link>

        <header className="mt-10 border-b border-black/10 pb-7">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">
            FX Fashion Gallery
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
            Checkout
          </h1>
        </header>

        {orderPlaced && (
          <section className="my-10 border border-black/10 bg-white p-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/40">Order Confirmed</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Thank you for your order.</h2>
            <p className="mt-3 text-sm text-black/50">Your order ID is <span className="font-semibold text-black">{orderId}</span></p>
            <Link to="/shop" className="mt-7 inline-block bg-black px-7 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white">Continue Shopping</Link>
          </section>
        )}

        {!orderPlaced && (
          <>
            {validationMessage && (
              <div className="mt-8 border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                    !
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-700">
                      Complete Your Order
                    </p>
                    <p className="mt-2 text-sm leading-6 text-amber-950">
                      {validationMessage}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationMessage("")}
                    className="text-lg leading-none text-amber-700 transition hover:text-amber-950"
                    aria-label="Close message"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <section className="grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
          <form className="space-y-7">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Customer Information
              </h2>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Delivery Address
              </h2>

              <div className="mt-5 space-y-4">
                <textarea
                  rows="4"
                  placeholder="Full Delivery Address"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full resize-none border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={customer.city}
                    onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                    className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                  />
                  <input
                    type="text"
                    placeholder="Area / District"
                    value={customer.area}
                    onChange={(e) => setCustomer({ ...customer, area: e.target.value })}
                    className="border border-black/15 bg-white px-4 py-4 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
                Payment Method
              </h2>

              <div className="mt-5 space-y-3">
                {["Cash on Delivery", "bKash", "Nagad"].map((method) => (
                  <label
                    key={method}
                    className={`flex cursor-pointer items-center gap-3 border bg-white p-5 transition ${
                      paymentMethod === method ? "border-black" : "border-black/15"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="text-sm font-medium">{method}</span>
                  </label>
                ))}
              </div>

              {paymentMethod !== "Cash on Delivery" && (
                <div className="mt-4 border border-black/10 bg-white p-5">
                  <div className="flex items-center justify-between gap-4 border border-black/10 bg-[#f7f7f5] p-4">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-black/40">
                        {paymentMethod} Send Money Number
                      </p>
                      <p className="mt-1 text-base font-semibold tracking-wide">01897523321</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText("01897523321");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1800);
                      }}
                      className="shrink-0 border border-black bg-black px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-black/80"
                    >
                      {copied ? "Copied ✓" : "Copy"}
                    </button>
                  </div>
                  <p className="mt-3 text-xs leading-6 text-black/60">
                    Send Money to this number using {paymentMethod}, then enter your Transaction ID below.
                  </p>
                  <label className="mt-4 block text-[9px] font-bold uppercase tracking-[0.18em]">
                    Transaction ID
                  </label>
                  <input
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter transaction ID"
                    className="mt-2 w-full border border-black/15 px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>
              )}
            </div>
          </form>

          <aside className="h-fit border border-black/10 bg-white p-6">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.22em]">
              Order Summary
            </h2>

            <div className="mt-6 space-y-4">
              {checkoutItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="mt-1 text-xs text-black/45">
                      {item.size} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">{item.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 border-t border-black/10 pt-5 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">৳{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-black/60">
                <span>Delivery Charge</span>
                <span>৳{deliveryCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={placeOrder}
              className="mt-7 w-full bg-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:bg-black/80"
            >
              Place Order
            </button>
          </aside>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
