
import { Link, useLocation } from "react-router-dom";

function formatPrice(value) {
  const amount = Number(value);

  return `₹${(
    Number.isFinite(amount) && amount >= 0 ? amount : 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  const hasOrder =
    order &&
    typeof order === "object" &&
    order.id &&
    Array.isArray(order.items);

  if (!hasOrder) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cafe-cream px-5 py-12">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-heading text-3xl font-bold text-cafe-brown">
            Order Details Unavailable
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            We couldn't find order details for this page. Please check your
            order history or return to the menu.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/orders"
              className="rounded-md bg-cafe-brown px-6 py-3 font-medium text-white hover:bg-cafe-caramel"
            >
              My Orders
            </Link>

            <Link
              to="/menu"
              className="rounded-md border border-cafe-brown px-6 py-3 font-medium text-cafe-brown hover:bg-cafe-cream"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const items = order.items.filter(
    (item) => item && typeof item === "object"
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-cafe-cream px-5 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
          ✓
        </div>

        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold text-cafe-brown">
            Thank You!
          </h1>

          <p className="mt-4 leading-7 text-gray-600">
            Your order has been submitted successfully. Thank you for
            choosing Café!
          </p>
        </div>

        <div className="mt-6 rounded-lg bg-cafe-cream p-5">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Order ID</span>
            <span className="break-all text-right font-semibold text-cafe-brown">
              {order.id}
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-4">
            <span className="text-gray-600">Status</span>
            <span className="font-medium text-cafe-caramel">
              {order.status || "Pending"}
            </span>
          </div>

          <div className="mt-5 border-t border-cafe-brown/20 pt-4">
            <h2 className="mb-3 font-semibold text-cafe-brown">
              Order Summary
            </h2>

            {items.map((item, index) => {
              const price = Number(item.price) || 0;
              const quantity = Number(item.quantity) || 0;

              return (
                <div
                  key={`${item.id || item.name || "item"}-${index}`}
                  className="mb-3 flex justify-between gap-3 text-sm"
                >
                  <span className="text-gray-700">
                    {item.name || "Product"} × {quantity}
                  </span>

                  <span className="whitespace-nowrap text-cafe-brown">
                    {formatPrice(price * quantity)}
                  </span>
                </div>
              );
            })}

            <div className="mt-4 flex justify-between gap-4 border-t border-cafe-brown/20 pt-3 font-bold text-cafe-brown">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/menu"
            className="rounded-md bg-cafe-brown px-6 py-3 text-center font-medium text-white hover:bg-cafe-caramel"
          >
            Continue Shopping
          </Link>

          <Link
            to="/orders"
            className="rounded-md border border-cafe-brown px-6 py-3 text-center font-medium text-cafe-brown hover:bg-cafe-cream"
          >
            My Orders
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderSuccess;
