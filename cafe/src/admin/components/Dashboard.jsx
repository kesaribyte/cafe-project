
import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "./StatCard";

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

function getStatusStyle(status) {
  switch (String(status || "Pending").toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "preparing":
      return "bg-blue-100 text-blue-800";
    case "ready":
      return "bg-purple-100 text-purple-800";
    case "out for delivery":
      return "bg-indigo-100 text-indigo-800";
    case "confirmed":
      return "bg-teal-100 text-teal-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

function getOrderDate(order) {
  const date = Date.parse(order.createdAt || "");
  return Number.isFinite(date) ? date : 0;
}

function getOrderTotal(order) {
  const amount = Number(order.total ?? order.totalAmount ?? 0);

  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

function Dashboard() {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    function refreshOrders() {
      setOrders(loadOrders());
    }

    window.addEventListener("focus", refreshOrders);
    window.addEventListener("storage", refreshOrders);

    return () => {
      window.removeEventListener("focus", refreshOrders);
      window.removeEventListener("storage", refreshOrders);
    };
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => (order.status || "Pending") === "Pending"
    ).length;

    const deliveredOrders = orders.filter(
      (order) => order.status === "Delivered"
    ).length;

    // This is delivered order value, not verified payment revenue.
    const deliveredValue = orders
      .filter((order) => order.status === "Delivered")
      .reduce((total, order) => total + getOrderTotal(order), 0);

    return {
      totalOrders,
      pendingOrders,
      deliveredOrders,
      deliveredValue,
    };
  }, [orders]);

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort((a, b) => getOrderDate(b) - getOrderDate(a))
        .slice(0, 5),
    [orders]
  );

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-[#40291F]">
        Dashboard
      </h1>

      <p className="mb-8 text-gray-600">
        Welcome to your Café admin dashboard.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          description="All orders"
        />

        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          description="Awaiting confirmation"
        />

        <StatCard
          title="Delivered Orders"
          value={stats.deliveredOrders}
          description="Successfully delivered"
        />

        <StatCard
          title="Delivered Order Value"
          value={formatPrice(stats.deliveredValue)}
          description="Delivered orders; payment not verified"
        />
      </div>

      <section className="mt-10 overflow-hidden rounded-xl border border-[#E8D8C4] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div>
            <h2 className="text-xl font-bold text-[#40291F]">
              Recent Orders
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest customer orders
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="rounded-lg bg-[#40291F] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#B77945]"
          >
            Manage Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="px-6 pb-8 text-center">
            <p className="text-gray-500">
              No orders yet. New customer orders will appear here.
            </p>

            <Link
              to="/menu"
              className="mt-4 inline-block text-sm font-medium text-[#B77945] hover:underline"
            >
              View Customer Menu
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead className="bg-[#F7F1E7] text-sm text-[#40291F]">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentOrders.map((order, index) => {
                  const customer =
                    order.customer &&
                    typeof order.customer === "object" &&
                    !Array.isArray(order.customer)
                      ? order.customer
                      : {};

                  const customerName =
                    customer.name ||
                    order.customerName ||
                    order.name ||
                    order.email ||
                    "Customer";

                  const status = order.status || "Pending";
                  const date = getOrderDate(order);

                  return (
                    <tr
                      key={order.id ?? `order-${index}`}
                      className="border-t border-[#E8D8C4] text-sm"
                    >
                      <td className="px-6 py-4 font-medium text-[#40291F]">
                        #{order.id ?? index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {customerName}
                        </p>

                        {customer.phone && (
                          <p className="mt-1 text-xs text-gray-500">
                            {customer.phone}
                          </p>
                        )}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {date
                          ? new Date(date).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4 font-medium text-[#40291F]">
                        {formatPrice(getOrderTotal(order))}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
