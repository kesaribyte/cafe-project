
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import getMenuProducts from "../data/getMenuProducts";

const PRODUCT_FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=Cafe+Product";

function ProductDetails({ addToCart, cartItems = [] }) {
  const { productId } = useParams();

  const [products, setProducts] = useState(() => getMenuProducts());
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    function refreshProducts() {
      setProducts(getMenuProducts());
    }

    window.addEventListener("storage", refreshProducts);
    window.addEventListener("focus", refreshProducts);

    return () => {
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("focus", refreshProducts);
    };
  }, []);

  const product = products.find(
    (item) => String(item.id) === String(productId)
  );

  useEffect(() => {
    setImageSrc(product?.image || PRODUCT_FALLBACK_IMAGE);
    setQuantity(1);
    setMessage("");
  }, [product?.id, product?.image]);

  const cartItem = product
    ? cartItems.find(
        (item) => String(item.id) === String(product.id)
      )
    : null;

  const isAvailable = product ? product.available !== false : false;

  function handleAddToCart() {
    if (!product) {
      setMessage("This product could not be found.");
      return;
    }

    if (!isAvailable) {
      setMessage("Sorry, this product is currently unavailable.");
      return;
    }

    if (typeof addToCart !== "function") {
      setMessage("Unable to add this product to your bag. Please try again.");
      return;
    }

    try {
      addToCart(product, quantity);
      setMessage(
        `${quantity} × ${product.name} added to your bag.`
      );
    } catch (error) {
      console.error("Could not add product to cart:", error);
      setMessage("Something went wrong. Please try again.");
    }
  }

  if (!product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-cafe-cream px-5 text-center">
        <h1 className="text-3xl font-bold text-cafe-brown">
          Product Not Found
        </h1>

        <p className="mt-3 max-w-md text-gray-600">
          This product may have been removed from our menu.
        </p>

        <Link
          to="/menu"
          className="mt-5 text-cafe-caramel hover:underline"
        >
          ← Back to Menu
        </Link>
      </main>
    );
  }

  const price = Number(product.price || 0);
  const total = price * quantity;

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/menu"
          className="mb-8 inline-block text-sm text-cafe-caramel hover:underline"
        >
          ← Back to Menu
        </Link>

        <div className="grid overflow-hidden rounded-2xl bg-white shadow-lg md:grid-cols-2">
          <img
            src={imageSrc || PRODUCT_FALLBACK_IMAGE}
            alt={product.name}
            onError={() => {
              if (imageSrc !== PRODUCT_FALLBACK_IMAGE) {
                setImageSrc(PRODUCT_FALLBACK_IMAGE);
              }
            }}
            className={`h-80 w-full object-cover md:h-full md:min-h-[450px] ${
              !isAvailable ? "opacity-60" : ""
            }`}
          />

          <div className="flex flex-col justify-center p-7 md:p-12">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-cafe-caramel">
              {product.category || "Other"}
            </p>

            <h1 className="font-heading text-4xl font-bold text-cafe-brown md:text-5xl">
              {product.name}
            </h1>

            <p className="mt-5 leading-7 text-gray-600">
              {product.description || "A delicious café favourite."}
            </p>

            <p className="mt-6 text-3xl font-bold text-cafe-brown">
              ₹{price.toLocaleString("en-IN")}
            </p>

            {!isAvailable && (
              <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm font-medium text-red-700">
                This product is currently unavailable.
              </p>
            )}

            <div className="mt-7">
              <p className="mb-3 text-sm font-medium text-cafe-brown">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-md border border-cafe-brown">
                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.max(1, current - 1));
                    setMessage("");
                  }}
                  disabled={quantity <= 1 || !isAvailable}
                  className="px-5 py-3 text-lg text-cafe-brown hover:bg-cafe-cream disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  −
                </button>

                <span
                  className="min-w-12 text-center font-semibold text-cafe-brown"
                  aria-live="polite"
                >
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setQuantity((current) => Math.min(20, current + 1));
                    setMessage("");
                  }}
                  disabled={quantity >= 20 || !isAvailable}
                  className="px-5 py-3 text-lg text-cafe-brown hover:bg-cafe-cream disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                You can select up to 20 items at a time.
              </p>
            </div>

            <p className="mt-5 text-lg text-cafe-brown">
              Total:{" "}
              <span className="font-bold">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </p>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`mt-6 w-full rounded-md px-6 py-3 font-medium text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown ${
                !isAvailable
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-cafe-brown hover:bg-cafe-caramel"
              }`}
            >
              {!isAvailable
                ? "Currently Unavailable"
                : `Add ${quantity} to Cart`}
            </button>

            {message && (
              <p
                role="status"
                className="mt-3 text-sm text-green-700"
              >
                {message}
              </p>
            )}

            {cartItem && (
              <p className="mt-3 text-sm text-gray-600">
                {cartItem.quantity} already in your bag
              </p>
            )}

            <Link
              to="/cart"
              className="mt-4 text-center text-sm font-medium text-cafe-caramel hover:underline"
            >
              Go to Shopping Bag →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ProductDetails;
