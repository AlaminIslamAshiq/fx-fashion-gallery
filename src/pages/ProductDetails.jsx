import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingBag, ShoppingCart, Check } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const defaultProducts = [
  {
    id: "1",
    name: "Premium Black Shirt",
    category: "Men",
    price: "৳1,250",
    rating: 5,
    image: "photo-1521572163474-6864f9cf17ab",
    description: "Premium quality fashion shirt with a clean modern look."
  },
  {
    id: "2",
    name: "Classic Denim Jacket",
    category: "Men",
    price: "৳1,850",
    rating: 5,
    image: "photo-1551028719-00167b16eac5",
    description: "Comfortable and stylish denim jacket."
  }
];

function getImageUrl(imageData, image) {
  if (imageData) return imageData;
  if (image) {
    return `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=85`;
  }
  return "";
}

function getGallery(product) {
  if (Array.isArray(product?.images) && product.images.length) {
    return product.images
      .filter((item) => item?.imageData)
      .map((item) => ({
        imageData: item.imageData,
        color: String(item.color || "").trim()
      }));
  }

  if (product?.imageData) {
    return [{ imageData: product.imageData, color: "" }];
  }

  if (product?.image) {
    return [{ imageData: getImageUrl("", product.image), color: "" }];
  }

  return [];
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const foundDefault = defaultProducts.find((item) => String(item.id) === String(id));

        if (foundDefault) {
          if (mounted) setProduct(foundDefault);
          return;
        }

        const snap = await getDoc(doc(db, "products", id));

        if (mounted) {
          setProduct(snap.exists() ? { id: snap.id, ...snap.data() } : null);
        }
      } catch (error) {
        console.error(error);
        if (mounted) setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  const gallery = useMemo(() => getGallery(product || {}), [product]);

  const colors = useMemo(
    () => [...new Set(gallery.map((item) => item.color).filter(Boolean))],
    [gallery]
  );

  const availableSizes = useMemo(
    () =>
      String(product?.sizes || "")
        .split(",")
        .map((size) => size.trim())
        .filter(Boolean),
    [product]
  );

  const sizes = availableSizes.length
    ? availableSizes
    : ["M", "L", "XL", "XXL"];

  useEffect(() => {
    if (!product) return;

    setSelectedSize((current) =>
      current && sizes.includes(current) ? current : sizes[0]
    );

    if (colors.length) {
      const firstColor = colors[0];
      setSelectedColor(firstColor);

      const firstColorIndex = gallery.findIndex(
        (item) => item.color === firstColor
      );

      setSelectedGalleryIndex(firstColorIndex >= 0 ? firstColorIndex : 0);
    } else {
      setSelectedColor("");
      setSelectedGalleryIndex(0);
    }

    setQuantity(1);
    setAdded(false);
  }, [product?.id, colors.join("|"), sizes.join("|")]);

  const selectedGallery = gallery[selectedGalleryIndex] || gallery[0];
  const selectedImageData = selectedGallery?.imageData || "";

  const basePrice = Number(
    String(product?.price || "0").replace(/[^\d.]/g, "")
  );

  const discountEnabled = Boolean(product?.discountEnabled);
  const discountValue = Number(product?.discountValue || 0);

  const salePrice =
    discountEnabled && discountValue > 0
      ? product.discountType === "percentage"
        ? Math.max(0, basePrice - (basePrice * discountValue) / 100)
        : Math.max(0, basePrice - discountValue)
      : basePrice;

  const formatPrice = (value) => `৳${Number(value || 0).toLocaleString()}`;

  const buildCartProduct = () => ({
    ...product,
    price: formatPrice(salePrice),
    originalPrice: basePrice,
    salePrice,
    color: selectedColor || "",
    selectedImageData: selectedImageData || product.imageData || ""
  });

  const handleColorSelect = (color) => {
    setSelectedColor(color);

    const index = gallery.findIndex((item) => item.color === color);

    if (index >= 0) {
      setSelectedGalleryIndex(index);
    }
  };

  const handleAddToCart = () => {
    addToCart(buildCartProduct(), selectedSize, quantity);
    setAdded(true);

    window.setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    const productForCheckout = {
      ...buildCartProduct(),
      size: selectedSize,
      quantity
    };

    localStorage.setItem("fx_buy_now", JSON.stringify(productForCheckout));
    navigate("/checkout?buyNow=direct");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-black/50">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <Link
          to="/shop"
          className="mt-5 inline-flex rounded-xl bg-black px-5 py-3 text-white"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl bg-black/[0.03]">
            {selectedImageData && (
              <img
                src={selectedImageData}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            )}

            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md"
              aria-label="Wishlist"
            >
              <Heart
                size={21}
                fill={isWishlisted(product.id) ? "currentColor" : "none"}
              />
            </button>
          </div>

          {gallery.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {gallery.map((item, index) => (
                <button
                  type="button"
                  key={`${item.imageData.slice(-20)}-${index}`}
                  onClick={() => {
                    setSelectedGalleryIndex(index);
                    if (item.color) setSelectedColor(item.color);
                  }}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                    selectedGalleryIndex === index
                      ? "border-black"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={item.imageData}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  {item.color && (
                    <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/65 px-1 py-0.5 text-[10px] text-white">
                      {item.color}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/45">
            {product.category}
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {formatPrice(salePrice)}
            </span>

            {discountEnabled && salePrice < basePrice && (
              <span className="text-sm text-black/40 line-through">
                {formatPrice(basePrice)}
              </span>
            )}
          </div>

          <p className="mt-6 leading-7 text-black/65">
            {product.description || "Premium quality product from FX Fashion Gallery."}
          </p>

          {colors.length > 0 && (
            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">Select Color</span>
                <span className="text-sm text-black/50">{selectedColor}</span>
              </div>

              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const active = selectedColor === color;

                  return (
                    <button
                      type="button"
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        active
                          ? "border-black bg-black text-white"
                          : "border-black/15 bg-white text-black hover:border-black"
                      }`}
                    >
                      {active && <Check size={16} strokeWidth={3} />}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-7">
            <span className="mb-3 block font-semibold">Select Size</span>

            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-14 rounded-xl border px-4 py-3 text-sm font-medium ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-black/15 bg-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <span className="mb-3 block font-semibold">Quantity</span>

            <div className="inline-flex items-center overflow-hidden rounded-xl border border-black/15">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                className="p-3"
              >
                <Minus size={17} />
              </button>

              <span className="min-w-12 text-center font-medium">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() => setQuantity((value) => value + 1)}
                className="p-3"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-black px-5 py-3.5 font-medium"
            >
              {added ? <Check size={19} /> : <ShoppingCart size={19} />}
              {added ? "Added to Cart" : "Add to Cart"}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 font-medium text-white"
            >
              <ShoppingBag size={19} />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
