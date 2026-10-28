
import { Link } from "react-router-dom";
import getMenuProducts from "../data/getMenuProducts";

function getDeliveryFee() {
  try {
    const saved = localStorage.getItem("cafe-settings");

    if (saved) {
      const settings = JSON.parse(saved);
      const fee = Number(settings.deliveryFee);

      if (
        settings.deliveryFee !== "" &&
        settings.deliveryFee !== null &&
        Number.isFinite(fee) &&
        fee >= 0
      ) {
        return fee;
      }
    }
  } catch (error) {
    console.error("Could not load delivery fee:", error);
  }

  return 40;
}

function formatPrice(value) {
  const amount = Number(value);

  return `₹${(
    Number.isFinite(amount) ? amount : 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Cart({ cartItems = [], updateQuantity, removeFromCart }) {
  const currentProducts = getMenuProducts();
  const deliveryFee = getDeliveryFee();

  const cartWithAvailability = cartItems.map((item) => {
    const currentProduct = currentProducts.find(
      (product) => String(product.id) === String(item.id)
    );

    const price = Number(
      currentProduct ? currentProduct.price : item.price
    );

    return {
      ...item,
      currentProduct,
      available:
        currentProduct !== undefined &&
        currentProduct.available !== false,
      currentPrice:
        Number.isFinite(price) && price >= 0 ? price : 0,
      currentImage: currentProduct?.image || item.image,
    };
  });

  const totalItems = cartItems.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  const subtotal = cartWithAvailability.reduce(
    (total, item) => total + item.currentPrice * item.quantity,
    0
  );

  const hasUnavailableItems = cartWithAvailability.some(
    (item) => !item.available
  );

  const estimatedTotal =
    subtotal + (cartItems.length > 0 ? deliveryFee : 0);

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 font-heading text-4xl font-bold text-cafe-brown">
          Your Cart
        </h1>

        <p className="mb-8 text-gray-600">
          Review your favourite café treats before checkout.
        </p>

        {cartItems.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="mb-3 text-2xl font-bold text-cafe-brown">
              Your cart is empty
            </h2>

            <p className="mb-6 text-gray-600">
              Looks like you haven't added anything yet.
            </p>

            <Link
              to="/menu"
              className="inline-block rounded-md bg-cafe-brown px-6 py-3 text-white hover:bg-cafe-caramel"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              {cartWithAvailability.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                >
                  <img
                    src={
                      item.currentImage ||
                      "https://placehold.co/300x200?text=Cafe+Product"
                    }
                    alt={item.name || "Café product"}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src =
                        "https://placehold.co/300x200?text=Cafe+Product";
                    }}
                    className="h-24 w-full rounded-lg object-cover sm:w-28"
                  />

                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-cafe-brown">
                      {item.name || "Café product"}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      {formatPrice(item.currentPrice)} each
                    </p>

                    {!item.available && (
                      <p className="mt-2 text-sm font-medium text-red-600">
                        This product is unavailable or has been removed.
                        Remove it before checkout.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="mt-3 text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded border disabled:opacity-40"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>

                    <span className="font-semibold">
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= 20}
                      className="h-8 w-8 rounded border disabled:opacity-40"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>

                  <p className="font-bold text-cafe-brown">
                    {formatPrice(item.currentPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <aside className="h-fit rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-cafe-brown">
                Order Summary
              </h2>

              <div className="mb-3 flex justify-between text-gray-600">
                <span>Total items</span>
                <span>{totalItems}</span>
              </div>

              <div className="mb-3 flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="mb-5 flex justify-between border-b border-cafe-beige pb-5 text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>

              <div className="mb-6 flex justify-between gap-3 text-lg font-bold text-cafe-brown">
                <span>Estimated Total</span>
                <span className="whitespace-nowrap">
                  {formatPrice(estimatedTotal)}
                </span>
              </div>

              {hasUnavailableItems ? (
                <div>
                  <p className="mb-3 text-sm text-red-600">
                    Remove unavailable products to continue to checkout.
                  </p>

                  <button
                    type="button"
                    disabled
                    className="block w-full cursor-not-allowed rounded-md bg-gray-400 px-4 py-3 text-center text-white"
                  >
                    Checkout Unavailable
                  </button>
                </div>
              ) : (
                <Link
                  to="/checkout"
                  className="block w-full rounded-md bg-cafe-brown px-4 py-3 text-center text-white hover:bg-cafe-caramel"
                >
                  Proceed to Checkout
                </Link>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Final delivery charges and total are confirmed at checkout.
              </p>

              <Link
                to="/menu"
                className="mt-4 block text-center text-sm text-cafe-caramel hover:underline"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
