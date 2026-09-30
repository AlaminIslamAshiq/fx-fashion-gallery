import { Link, useParams } from "react-router-dom";

const content = {
  contact: {
    label: "Get in touch",
    title: "Contact Us",
    text: "We are here to help with products, orders, delivery and general questions.",
    items: [
      ["WhatsApp", "01897523321"],
      ["Phone", "01897523321"],
      ["Business", "FX Fashion Gallery"],
    ],
  },
  delivery: {
    label: "Shipping information",
    title: "Delivery Information",
    text: "We deliver fashion orders across Bangladesh with separate delivery charges for Dhaka and outside Dhaka.",
    items: [
      ["Dhaka", "৳70 delivery charge"],
      ["Outside Dhaka", "৳120 delivery charge"],
      ["Order processing", "Orders are processed after confirmation."],
    ],
  },
  returns: {
    label: "Customer care",
    title: "Returns & Exchange",
    text: "If you receive an incorrect or damaged product, please contact FX Fashion Gallery as soon as possible with your order details.",
    items: [
      ["Contact", "01897523321"],
      ["Order details", "Keep your order ID ready."],
      ["Condition", "Products should remain unused and in suitable condition for review."],
    ],
  },
  privacy: {
    label: "Your information",
    title: "Privacy Policy",
    text: "FX Fashion Gallery uses customer information only as needed to process orders, provide support and operate the website.",
    items: [
      ["Order information", "Name, phone and delivery information may be collected for order fulfillment."],
      ["Payment", "Payment details are handled according to the selected payment method."],
      ["Security", "We use reasonable technical measures to protect website and customer data."],
    ],
  },
};

export default function Info() {
  const { page } = useParams();
  const data = content[page] || content.contact;

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-12 text-[#111] md:px-10 md:py-20">
      <div className="mx-auto max-w-4xl">
        <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em]">
          ← Back Home
        </Link>

        <div className="mt-16 border-b border-black/10 pb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-black/40">
            {data.label}
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase tracking-[-0.055em] md:text-7xl">
            {data.title}
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-black/55">
            {data.text}
          </p>
        </div>

        <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
          {data.items.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-6 md:grid-cols-[180px_1fr]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                {label}
              </p>
              <p className="text-sm leading-6 text-black/70">
                {value}
              </p>
            </div>
          ))}
        </div>

        {page === "contact" && (
          <a
            href="https://wa.me/8801897523321"
            target="_blank"
            rel="noreferrer"
            className="mt-10 inline-flex bg-black px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
          >
            Contact on WhatsApp
          </a>
        )}
      </div>
    </main>
  );
}
