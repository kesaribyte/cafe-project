
import { useEffect, useState } from "react";

const ORDERS_KEY = "cafe-orders";

const statuses = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function loadOrders() {
  try {
    const saved = localStorage.getItem(ORDERS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (order) =>
        order !== null &&
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

function getCustomer(order) {
  return order.customer &&
    typeof order.customer === "object" &&
    !Array.isArray(order.customer)
    ? order.customer
    : {};
}

function getOrderDate(order) {
  const timestamp = Date.parse(order.createdAt || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function Orders() {
  const [orders, setOrders] = useState(loadOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === ORDERS_KEY || event.key === null) {
        setOrders(loadOrders());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function updateStatus(orderId, newStatus) {
    if (
      orderId === undefined ||
      orderId === null ||
      !statuses.includes(newStatus)
    ) {
      return;
    }

    try {
      const currentOrders = loadOrders();

      const orderExists = currentOrders.some(
        (order) => String(order.id) === String(orderId)
      );

      if (!orderExists) {
        setOrders(currentOrders);
        setSaveError("This order could not be found. Refresh and try again.");
        return;
      }

      const updatedOrders = currentOrders.map((order) =>
        String(order.id) === String(orderId)
          ? { ...order, status: newStatus }
          : order
      );

      localStorage.setItem(
        ORDERS_KEY,
        JSON.stringify(updatedOrders)
      );

      setOrders(updatedOrders);
      setSaveError("");
    } catch (error) {
      console.error("Could not update order:", error);
      setSaveError(
        "Could not save the status. Check browser storage and try again."
      );
    }
  }

  const searchTerm = search.trim().toLowerCase();

  const filteredOrders = [...orders]
    .sort((a, b) => getOrderDate(b) - getOrderDate(a))
    .filter((order) => {
      const customer = getCustomer(order);

      const searchableValues = [
        order.id,
        order.customerName,
        order.name,
        order.email,
        customer.name,
        customer.phone,
        customer.address,
      ];

      const matchesSearch = searchableValues.some(
        (value) =>
          value !== undefined &&
          value !== null &&
          String(value).toLowerCase().includes(searchTerm)
      );

      const orderStatus = statuses.includes(order.status)
        ? order.status
        : "Pending";

      const matchesStatus =
        statusFilter === "All" || orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-[#40291F]">
        Orders
      </h1>

      <p className="mb-6 text-gray-600">
        View customer details, manage orders, and update delivery status.
      </p>

      {saveError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {saveError}
        </p>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <input
          type="search"
          placeholder="Search order ID, customer, phone..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-lg border border-[#E8D8C4] bg-white px-4 py-3 outline-none focus:border-[#B77945]"
          aria-label="Search orders"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-[#E8D8C4] bg-white px-4 py-3 outline-none focus:border-[#B77945]"
          aria-label="Filter orders by status"
        >
          <option value="All">All statuses</option>

          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-3 text-sm text-gray-600">
        Showing {filteredOrders.length} of {orders.length} orders
      </p>

      <div className="overflow-x-auto rounded-xl border border-[#E8D8C4] bg-white">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-[#F7F1E7] text-[#40291F]">
            <tr>
              <th className="p-4">Order</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Update Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.map((order, index) => {
              const customer = getCustomer(order);
              const orderStatus = statuses.includes(order.status)
                ? order.status
                : "Pending";

              const items = Array.isArray(order.items)
                ? order.items.filter(
                    (item) =>
                      item &&
                      typeof item === "object" &&
                      !Array.isArray(item)
                  )
                : [];

              const orderId = order.id ?? `legacy-${index}`;
              const validDate = getOrderDate(order) > 0;

              return (
                <tr
                  key={orderId}
                  className="border-t border-[#E8D8C4] align-top"
                >
                  <td className="p-4">
                    <p className="font-medium text-[#40291F]">
                      #{order.id ?? index + 1}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {validDate
                        ? new Date(order.createdAt).toLocaleString("en-IN")
                        : "Date unavailable"}
                    </p>
                  </td>

                  <td className="max-w-[220px] p-4">
                    <p className="font-medium text-[#40291F]">
                      {customer.name ||
                        order.customerName ||
                        order.name ||
                        "Customer"}
                    </p>

                    {customer.phone && (
                      <p className="mt-1 text-sm text-gray-600">
                        {customer.phone}
                      </p>
                    )}

                    {customer.address && (
                      <p className="mt-1 break-words text-xs text-gray-500">
                        {customer.address}
                      </p>
                    )}

                    {order.email && (
                      <p className="mt-1 break-all text-xs text-gray-500">
                        {order.email}
                      </p>
                    )}
                  </td>

                  <td className="p-4">
                    {items.length > 0 ? (
                      <ul className="space-y-2 text-sm">
                        {items.map((item, itemIndex) => {
                          const quantity = Number(item.quantity);
                          const price = Number(item.price);

                          const lineTotal =
                            Number.isFinite(quantity) &&
                            Number.isFinite(price)
                              ? quantity * price
                              : 0;

                          return (
                            <li
                              key={`${item.id ?? item.name ?? "item"}-${itemIndex}`}
                            >
                              <span className="text-[#40291F]">
                                {item.name || "Product"} ×{" "}
                                {Number.isFinite(quantity) ? quantity : 0}
                              </span>

                              <p className="text-xs text-gray-500">
                                {formatPrice(lineTotal)}
                              </p>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className="text-sm text-gray-500">
                        No items listed
                      </span>
                    )}
                  </td>

                  <td className="p-4 font-semibold text-[#40291F]">
                    {formatPrice(order.total ?? order.totalAmount)}
                  </td>

                  <td className="p-4">
                    <span className="inline-block rounded-full bg-[#F7F1E7] px-3 py-1 text-sm text-[#40291F]">
                      {orderStatus}
                    </span>
                  </td>

                  <td className="p-4">
                    <select
                      value={orderStatus}
                      onChange={(event) =>
                        updateStatus(order.id, event.target.value)
                      }
                      disabled={order.id === undefined || order.id === null}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#B77945] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Update status for order ${order.id ?? index + 1}`}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}

            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {orders.length === 0
                    ? "No orders have been placed yet."
                    : "No orders match your search or status filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;
