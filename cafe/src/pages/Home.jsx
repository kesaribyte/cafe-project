
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getMenuProducts from "../data/getMenuProducts";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200";

const FALLBACK_IMAGE =
  "https://placehold.co/1200x800?text=Welcome+to+Cafe";

const PRODUCT_FALLBACK_IMAGE =
  "https://placehold.co/600x400?text=Cafe+Product";

function Home({ addToCart }) {
  const [products, setProducts] = useState(() => getMenuProducts());

  useEffect(() => {
    function refreshProducts() {
      setProducts(getMenuProducts());
    }

    // Refresh products when localStorage changes in another browser tab.
    window.addEventListener("storage", refreshProducts);

    // Refresh when returning to the homepage after navigating elsewhere.
    window.addEventListener("focus", refreshProducts);

    return () => {
      window.removeEventListener("storage", refreshProducts);
      window.removeEventListener("focus", refreshProducts);
    };
  }, []);

  const featuredProducts = products
    .filter(
      (product) =>
        product &&
        product.available !== false &&
        product.id != null &&
        typeof product.name === "string"
    )
    .slice(0, 3);

  function handleAddToCart(product) {
    if (typeof addToCart === "function") {
      addToCart(product);
    }
  }

  return (
    <main className="bg-cafe-cream">
      {/* Hero Section */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cafe-caramel">
            Welcome to कॉफी कट्टा
          </p>

          <h1 className="font-heading text-5xl font-bold leading-tight text-cafe-brown md:text-7xl">
            Good Coffee
            <br />
            Good Moments
          </h1>

          <p className="mt-6 max-w-lg leading-8 text-gray-600">
            Discover freshly prepared coffee, delicious snacks, and sweet
            treats made for your everyday moments.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="rounded-md bg-cafe-brown px-6 py-3 text-white transition-colors hover:bg-cafe-caramel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
            >
              Explore Menu
            </Link>

            <Link
              to="/about"
              className="rounded-md border border-cafe-brown px-6 py-3 text-cafe-brown transition-colors hover:bg-cafe-brown hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
            >
              Our Story
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <img
            src={HERO_IMAGE}
            alt="Freshly brewed coffee in a welcoming café"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-[350px] w-full object-cover md:h-[520px]"
          />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-cafe-caramel">
                Customer favourites
              </p>

              <h2 className="font-heading text-3xl font-bold text-cafe-brown md:text-4xl">
                Popular Favourites
              </h2>
            </div>

            <Link
              to="/menu"
              className="text-sm font-semibold text-cafe-caramel hover:underline"
            >
              View Full Menu →
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="rounded-xl bg-cafe-cream p-8 text-center">
              <p className="text-gray-600">
                Our favourites are being updated. Please check the full menu.
              </p>

              <Link
                to="/menu"
                className="mt-4 inline-block font-semibold text-cafe-caramel hover:underline"
              >
                Explore Menu →
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-xl border border-cafe-beige bg-cafe-cream"
                >
                  <Link
                    to={`/menu/${encodeURIComponent(String(product.id))}`}
                    aria-label={`View ${product.name} details`}
                  >
                    <img
                      src={product.image || PRODUCT_FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = PRODUCT_FALLBACK_IMAGE;
                      }}
                      className="h-56 w-full object-cover"
                    />
                  </Link>

                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wider text-cafe-caramel">
                      {product.category || "Other"}
                    </p>

                    <h3 className="mt-2 text-xl font-bold text-cafe-brown">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {product.description ||
                        "A delicious café favourite."}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-lg font-bold text-cafe-brown">
                        ₹
                        {Number(product.price || 0).toLocaleString("en-IN")}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="rounded-md bg-cafe-brown px-4 py-2 text-sm text-white transition-colors hover:bg-cafe-caramel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
                      >
                        Add to Cart
                      </button>
                    </div>

                    <Link
                      to={`/menu/${encodeURIComponent(String(product.id))}`}
                      className="mt-4 inline-block text-sm font-medium text-cafe-caramel hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-5 py-16 text-center md:py-20">
        <h2 className="font-heading text-3xl font-bold text-cafe-brown md:text-4xl">
          Your Favourite Treats, Delivered.
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
          Take a little Café happiness home with freshly prepared favourites.
        </p>

        <Link
          to="/menu"
          className="mt-7 inline-block rounded-md bg-cafe-brown px-6 py-3 text-white transition-colors hover:bg-cafe-caramel"
        >
          Order Now
        </Link>
      </section>
    </main>
  );
}

export default Home;
