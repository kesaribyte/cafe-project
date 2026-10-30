
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import fetchAppwriteProducts from "../data/fetchAppwriteProducts";

const PRODUCT_FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=Cafe+Product";

function Menu({ addToCart, cartItems = [] }) {
  const [menuProducts, setMenuProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const products = await fetchAppwriteProducts();

        if (!isMounted) return;

        setMenuProducts(Array.isArray(products) ? products : []);
      } catch (err) {
        console.error("Could not load Appwrite products:", err);

        if (isMounted) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const validProducts = menuProducts.filter(
    (product) =>
      product &&
      product.id != null &&
      product.id !== "" &&
      typeof product.name === "string" &&
      product.name.trim() !== ""
  );

  function handleAddToCart(product) {
    if (product.available === false) return;

    if (typeof addToCart === "function") {
      addToCart(product);
    }
  }

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cafe-caramel">
            Made with love
          </p>

          <h1 className="font-heading text-4xl font-bold text-cafe-brown md:text-5xl">
            Our Menu
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Explore our freshly prepared coffee, delicious snacks, and
            sweet treats.
          </p>
        </div>

        {loading ? (
          <p role="status" className="text-center text-gray-600">
            Loading our menu...
          </p>
        ) : error ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md bg-cafe-brown px-5 py-2 text-white"
            >
              Try Again
            </button>
          </div>
        ) : validProducts.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-cafe-brown">
              No products available
            </h2>
            <p className="mt-2 text-gray-600">
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {validProducts.map((product) => {
              const cartItem = cartItems.find(
                (item) => String(item.id) === String(product.id)
              );

              const isAvailable = product.available !== false;

              const productUrl = `/menu/${encodeURIComponent(
                String(product.id)
              )}`;

              return (
                <article
                  key={product.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={productUrl} className="block shrink-0">
                    <img
                      src={product.image || PRODUCT_FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
                      }}
                      className={`h-52 w-full object-cover ${
                        !isAvailable ? "opacity-60" : ""
                      }`}
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex min-h-7 items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-wider text-cafe-caramel">
                        {product.category || "Other"}
                      </p>

                      {!isAvailable && (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 min-h-7 text-xl font-bold text-cafe-brown">
                      {product.name}
                    </h2>

                    <p className="mt-2 min-h-[72px] line-clamp-3 text-sm leading-6 text-gray-600">
                      {product.description || "A delicious café favourite."}
                    </p>

                    <div className="mt-auto">
                      <div className="flex min-h-12 items-center justify-between gap-2 pt-3">
                        <span className="text-lg font-bold text-cafe-brown">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </span>

                        <button
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => handleAddToCart(product)}
                          className={`rounded-md px-4 py-2 text-sm text-white ${
                            !isAvailable
                              ? "cursor-not-allowed bg-gray-400"
                              : "bg-cafe-brown hover:bg-cafe-caramel"
                          }`}
                        >
                          {!isAvailable
                            ? "Unavailable"
                            : cartItem
                              ? `Added (${cartItem.quantity})`
                              : "Add to Cart"}
                        </button>
                      </div>

                      <Link
                        to={productUrl}
                        className="mt-4 inline-block text-sm font-medium text-cafe-caramel hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
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

export default Menu;
