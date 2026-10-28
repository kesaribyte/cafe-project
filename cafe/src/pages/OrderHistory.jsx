
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const ORDERS_KEY = "cafe-orders";

function loadOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (order) =>
        order &&
        typeof order === "object" &&
        !Array.isArray(order)
    );
  } catch (error) {
    console.error("Could not load orders:", error);
    return [];
  }
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

function formatDate(value) {
  const timestamp = Date.parse(value || "");

  return Number.isFinite(timestamp)
    ? new Date(timestamp).toLocaleString("en-IN")
    : "Date unavailable";
}

function getStatusStyle(status) {
  switch ((status || "Pending").toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "ready":
      return "bg-indigo-100 text-indigo-800";
    case "confirmed":
      return "bg-teal-100 text-teal-800";
    case "out for delivery":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

function OrderHistory() {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    function refreshOrders() {
      setOrders(loadOrders());
    }

    window.addEventListener("storage", refreshOrders);
    window.addEventListener("focus", refreshOrders);

    return () => {
      window.removeEventListener("storage", refreshOrders);
      window.removeEventListener("focus", refreshOrders);
    };
  }, []);

  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = Date.parse(a.createdAt || "") || 0;
    const dateB = Date.parse(b.createdAt || "") || 0;

    return dateB - dateA;
  });

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-3 font-heading text-4xl font-bold text-cafe-brown">
          My Orders
        </h1>

        <p className="mb-8 text-gray-600">
          View your previous Café orders and their current status.
        </p>

        {sortedOrders.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-5xl">☕</div>

            <h2 className="text-xl font-bold text-cafe-brown">
              No orders yet
            </h2>

            <p className="mt-2 text-gray-600">
              Your orders will appear here after you place an order.
            </p>

            <Link
              to="/menu"
              className="mt-5 inline-block rounded-md bg-cafe-brown px-6 py-3 text-white transition hover:bg-cafe-caramel"
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedOrders.map((order, index) => (
              <article
                key={order.id || index}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cafe-beige pb-4">
                  <div className="min-w-0">
                    <h2 className="break-all font-bold text-cafe-brown">
                      Order #{order.id || "N/A"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status || "Pending"}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  {(order.customer?.name || order.customerName) && (
                    <p>
                      <span className="font-medium text-cafe-brown">
                        Customer:
                      </span>{" "}
                      {order.customer?.name || order.customerName}
                    </p>
                  )}

                  {order.customer?.phone && (
                    <p>
                      <span className="font-medium text-cafe-brown">
                        Phone:
                      </span>{" "}
                      {order.customer.phone}
                    </p>
                  )}

                  {order.customer?.address && (
                    <p>
                      <span className="font-medium text-cafe-brown">
                        Delivery Address:
                      </span>{" "}
                      {order.customer.address}
                    </p>
                  )}
                </div>

                <div className="space-y-3 py-5">
                  <h3 className="font-semibold text-cafe-brown">
                    Order Items
                  </h3>

                  {(Array.isArray(order.items) ? order.items : []).map(
                    (item, itemIndex) => {
                      const price = Number(item?.price) || 0;
                      const quantity = Number(item?.quantity) || 0;

                      return (
                        <div
                          key={`${item?.id || item?.name || "item"}-${itemIndex}`}
                          className="flex justify-between gap-4 text-sm"
                        >
                          <span className="text-gray-700">
                            {item?.name || "Product"} × {quantity}
                          </span>

                          <span className="whitespace-nowrap text-cafe-brown">
                            {formatPrice(price * quantity)}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="flex justify-between border-t border-cafe-beige pt-4 font-bold text-cafe-brown">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/menu"
            className="font-medium text-cafe-caramel hover:underline"
          >
            ← Back to Menu
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderHistory;
