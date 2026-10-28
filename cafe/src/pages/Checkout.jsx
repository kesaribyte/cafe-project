
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getMenuProducts from "../data/getMenuProducts";

const ORDERS_KEY = "cafe-orders";
const SETTINGS_KEY = "cafe-settings";

function getDeliveryFee() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

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
    Number.isFinite(amount) && amount >= 0 ? amount : 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Checkout({ cartItems = [], clearCart }) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = getDeliveryFee();
  const currentProducts = getMenuProducts();

  const checkoutItems = cartItems.map((item) => {
    const product = currentProducts.find(
      (current) => String(current.id) === String(item.id)
    );

    const price = Number(product?.price);
    const quantity = Number(item.quantity);

    return {
      ...item,
      currentProduct: product,
      currentPrice:
        Number.isFinite(price) && price >= 0 ? price : 0,
      quantity:
        Number.isInteger(quantity) && quantity >= 1 && quantity <= 20
          ? quantity
          : 0,
      isAvailable:
        Boolean(product) &&
        product.available !== false &&
        Number.isFinite(price) &&
        price >= 0,
    };
  });

  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.currentPrice * item.quantity,
    0
  );

  const totalPrice = subtotal + deliveryFee;

  const hasUnavailableItems = checkoutItems.some(
    (item) => !item.isAvailable || item.quantity < 1
  );

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedAddress = address.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      setError("Please enter a valid full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (
      trimmedAddress.length < 10 ||
      trimmedAddress.length > 500
    ) {
      setError("Please enter a complete delivery address.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty. Please add products first.");
      return;
    }

    if (hasUnavailableItems) {
      setError(
        "Some products are unavailable or have invalid quantities. Please update your cart."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Recheck products and prices immediately before saving.
      const latestProducts = getMenuProducts();

      const orderItems = cartItems.map((item) => {
        const product = latestProducts.find(
          (current) => String(current.id) === String(item.id)
        );

        const price = Number(product?.price);
        const quantity = Number(item.quantity);

        if (
          !product ||
          product.available === false ||
          !Number.isFinite(price) ||
          price < 0 ||
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 20
        ) {
          throw new Error(
            "A product is unavailable or has invalid details. Please review your cart."
          );
        }

        return {
          id: product.id,
          name: product.name,
          price,
          quantity,
        };
      });

      const orderSubtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const currentDeliveryFee = getDeliveryFee();
      const orderTotal = orderSubtotal + currentDeliveryFee;

      const savedOrders = localStorage.getItem(ORDERS_KEY);
      const parsedOrders = savedOrders
        ? JSON.parse(savedOrders)
        : [];

      if (!Array.isArray(parsedOrders)) {
        throw new Error(
          "Saved order data is invalid. Please contact the café owner."
        );
      }

      const order = {
        id: `CAF-${Date.now()}-${Math.floor(
          1000 + Math.random() * 9000
        )}`,
        customer: {
          name: trimmedName,
          phone: trimmedPhone,
          address: trimmedAddress,
          instructions: instructions.trim(),
        },
        customerName: trimmedName,
        items: orderItems,
        subtotal: orderSubtotal,
        deliveryFee: currentDeliveryFee,
        total: orderTotal,
        status: "Pending",
        paymentMethod: "Cash on Delivery",
        createdAt: new Date().toISOString(),
      };

      // Save the order before clearing the cart.
      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify([order, ...parsedOrders])
      );

      if (typeof clearCart === "function") {
        clearCart();
      }

      navigate("/order-success", {
        replace: true,
        state: { order },
      });
    } catch (err) {
      console.error("Could not place order:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Could not place your order. Please try again."
      );

      setIsSubmitting(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cafe-cream px-5 py-12">
        <div className="w-full max-w-lg rounded-xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl font-bold text-cafe-brown">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-600">
            Add something delicious before checking out.
          </p>

          <Link
            to="/menu"
            className="mt-6 inline-block rounded-md bg-cafe-brown px-6 py-3 text-white hover:bg-cafe-caramel"
          >
            Explore Menu
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-4xl font-bold text-cafe-brown">
          Checkout
        </h1>

        <p className="mb-8 mt-2 text-gray-600">
          Enter your delivery details to complete your order.
        </p>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {hasUnavailableItems && (
          <div className="mb-6 rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
            Some items are unavailable or have invalid quantities. Please
            review your cart before placing your order.
            <Link to="/cart" className="ml-2 font-semibold underline">
              Edit cart
            </Link>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-8 md:grid-cols-3"
        >
          <section className="space-y-5 rounded-xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-xl font-bold text-cafe-brown">
              Delivery Details
            </h2>

            <div>
              <label
                htmlFor="customer-name"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Full Name *
              </label>

              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                maxLength={100}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                className="w-full rounded-md border border-cafe-beige px-4 py-3 outline-none focus:border-cafe-caramel"
              />
            </div>

            <div>
              <label
                htmlFor="customer-phone"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Mobile Number *
              </label>

              <input
                id="customer-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                required
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="10-digit mobile number"
                className="w-full rounded-md border border-cafe-beige px-4 py-3 outline-none focus:border-cafe-caramel"
              />
            </div>

            <div>
              <label
                htmlFor="customer-address"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Delivery Address *
              </label>

              <textarea
                id="customer-address"
                autoComplete="street-address"
                rows={4}
                maxLength={500}
                required
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                placeholder="House number, street, area and city"
                className="w-full resize-y rounded-md border border-cafe-beige px-4 py-3 outline-none focus:border-cafe-caramel"
              />
            </div>

            <div>
              <label
                htmlFor="delivery-instructions"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Delivery Instructions (Optional)
              </label>

              <textarea
                id="delivery-instructions"
                rows={2}
                maxLength={300}
                value={instructions}
                onChange={(event) =>
                  setInstructions(event.target.value)
                }
                placeholder="Landmark or instructions for delivery"
                className="w-full resize-y rounded-md border border-cafe-beige px-4 py-3 outline-none focus:border-cafe-caramel"
              />
            </div>

            <div className="rounded-lg bg-cafe-cream p-4 text-sm text-gray-700">
              <p className="font-semibold text-cafe-brown">
                Payment Method
              </p>
              <p className="mt-1">Cash on Delivery (COD)</p>
            </div>
          </section>

          <aside className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold text-cafe-brown">
              Order Summary
            </h2>

            <div className="space-y-4">
              {checkoutItems.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex justify-between gap-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-cafe-brown">
                      {item.name}
                    </p>
                    <p className="mt-1 text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <span className="whitespace-nowrap text-gray-700">
                    {formatPrice(item.currentPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-cafe-beige pt-4 text-sm">
              <div className="flex justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between gap-3 text-gray-600">
                <span>Delivery Fee</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>

              <div className="flex justify-between gap-3 border-t border-cafe-beige pt-3 text-lg font-bold text-cafe-brown">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || hasUnavailableItems}
              className="mt-6 w-full rounded-md bg-cafe-brown px-4 py-3 font-semibold text-white transition hover:bg-cafe-caramel disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>

            <Link
              to="/cart"
              className="mt-4 block text-center text-sm text-cafe-caramel hover:underline"
            >
              ← Back to Cart
            </Link>

            <p className="mt-4 text-xs leading-5 text-gray-500">
              Your order will be saved with Pending status until the café
              processes it.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default Checkout;
