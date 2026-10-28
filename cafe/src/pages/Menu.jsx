
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getMenuProducts from "../data/getMenuProducts";

const PRODUCT_FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=Cafe+Product";

function Menu({ addToCart, cartItems = [] }) {
  const [menuProducts, setMenuProducts] = useState(() =>
    getMenuProducts()
  );

  useEffect(() => {
    function refreshProducts() {
      setMenuProducts(getMenuProducts());
    }

    // Refresh when another browser tab changes the products.
    window.addEventListener("storage", refreshProducts);

    // Refresh when the browser window regains focus.
    window.addEventListener("focus", refreshProducts);

    return () => {
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("focus", refreshProducts);
    };
  }, []);

  const validProducts = menuProducts.filter(
    (product) =>
      product &&
      typeof product === "object" &&
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
        {/* Page Heading */}
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

        {/* Product List */}
        {validProducts.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-cafe-brown">
              No products available
            </h2>

            <p className="mt-2 text-gray-600">
              Please check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    to={productUrl}
                    aria-label={`View ${product.name} details`}
                  >
                    <img
                      src={product.image || PRODUCT_FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          PRODUCT_FALLBACK_IMAGE;
                      }}
                      className={`h-52 w-full object-cover ${
                        !isAvailable ? "opacity-60" : ""
                      }`}
                    />
                  </Link>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="mb-2 text-xs uppercase tracking-wider text-cafe-caramel">
                        {product.category || "Other"}
                      </p>

                      {!isAvailable && (
                        <span className="mb-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                          Unavailable
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold text-cafe-brown">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {product.description ||
                        "A delicious café favourite."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-2">
                      <span className="text-lg font-bold text-cafe-brown">
                        ₹
                        {Number(product.price || 0).toLocaleString("en-IN")}
                      </span>

                      <button
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => handleAddToCart(product)}
                        className={`rounded-md px-4 py-2 text-sm text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown ${
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
