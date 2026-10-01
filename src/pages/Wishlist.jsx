import { Link } from "react-router-dom";
import { Heart, Trash2, ShoppingBag } from "lucide-react";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist } = useWishlist();

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-5 py-10 text-[#111] md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-5 border-b border-black/10 pb-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/40">
              Your Saved Items
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Wishlist
            </h1>
          </div>

          <Heart className="h-7 w-7 fill-current md:h-9 md:w-9" strokeWidth={1.5} />
        </div>

        {wishlistItems.length === 0 ? (
          <div className="flex min-h-[55vh] flex-col items-center justify-center text-center">
            <Heart className="h-12 w-12 text-black/20" strokeWidth={1.2} />
            <h2 className="mt-6 text-xl font-semibold">Your wishlist is empty</h2>
            <p className="mt-2 max-w-sm text-sm leading-6 text-black/45">
              Save your favorite products here and find them easily whenever you want.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 bg-black px-7 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            >
              <ShoppingBag className="h-4 w-4" />
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-8 md:grid-cols-3 lg:grid-cols-4">
            {wishlistItems.map((product) => {
              const price = Number(
                String(product.salePrice ?? product.price ?? "").replace(/[^0-9.]/g, "")
              ) || 0;

              return (
                <article key={product.id} className="group relative">
                  <Link
                    to={`/product/${product.id}`}
                    className="block aspect-[4/5] overflow-hidden bg-[#e9e9e5]"
                  >
                    {product.imageData ? (
                      <img
                        src={product.imageData}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] font-bold uppercase tracking-[0.2em] text-black/30">
                        FX Fashion Gallery
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label={`Remove ${product.name || "product"} from wishlist`}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition hover:bg-black hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="pt-4">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-black/40">
                      {product.category || "Fashion"}
                    </p>

                    <h2 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-5">
                      {product.name || "Untitled Product"}
                    </h2>

                    <p className="mt-2 text-[15px] font-bold">
                      ৳{price.toLocaleString()}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
