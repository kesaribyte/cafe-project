
import { useEffect, useState } from "react";
import menuData from "../../data/menuData";

const STORAGE_KEY = "cafe-menu-products";

const emptyProduct = {
  name: "",
  category: "Coffee",
  price: "",
  image: "",
  description: "",
  available: true,
};

function getProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        throw new Error("Saved products must be an array.");
      }

      return parsed
        .filter(
          (product) =>
            product &&
            typeof product === "object" &&
            !Array.isArray(product) &&
            product.id !== undefined &&
            product.id !== null &&
            typeof product.name === "string" &&
            Number.isFinite(Number(product.price)) &&
            Number(product.price) >= 0
        )
        .map((product) => ({
          ...product,
          price: Number(product.price),
          available: product.available !== false,
        }));
    }
  } catch (error) {
    console.error("Could not load products:", error);
  }

  return menuData.map((product) => ({
    ...product,
    available: product.available !== false,
  }));
}

function formatPrice(price) {
  const amount = Number(price);

  return `₹${(
    Number.isFinite(amount) ? amount : 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Products() {
  const [products, setProducts] = useState(getProducts);
  const [formData, setFormData] = useState({ ...emptyProduct });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === STORAGE_KEY) {
        setProducts(getProducts());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function saveProducts(nextProducts) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nextProducts)
      );

      setProducts(nextProducts);
      setSaveError("");
      return true;
    } catch (error) {
      console.error("Could not save products:", error);
      setSaveError(
        "Could not save products. Check browser storage and try again."
      );
      return false;
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setSaveError("");
  }

  function resetForm() {
    setFormData({ ...emptyProduct });
    setEditingId(null);
    setMessage("");
    setSaveError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSaveError("");

    const name = formData.name.trim();
    const price = Number(formData.price);
    const image = formData.image.trim();
    const description = formData.description.trim();

    if (
      !name ||
      name.length > 100 ||
      formData.price === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      price > 1000000
    ) {
      setMessage("Enter a valid product name and price.");
      return;
    }

    if (description.length > 1000) {
      setMessage("Description must be 1000 characters or fewer.");
      return;
    }

    if (image && !/^https?:\/\//i.test(image)) {
      setMessage("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }

    let nextProducts;

    if (editingId !== null) {
      nextProducts = products.map((product) =>
        String(product.id) === String(editingId)
          ? {
              ...product,
              name,
              category: formData.category,
              price,
              image: image || product.image || "",
              description,
              available: formData.available !== false,
            }
          : product
      );
    } else {
      const newProduct = {
        ...formData,
        id: `product-${Date.now()}`,
        name,
        price,
        image:
          image ||
          "https://placehold.co/600x400?text=Cafe+Product",
        description,
        available: true,
      };

      nextProducts = [...products, newProduct];
    }

    if (saveProducts(nextProducts)) {
      setMessage(
        editingId !== null
          ? "Product updated successfully."
          : "Product added successfully."
      );

      setFormData({ ...emptyProduct });
      setEditingId(null);
    }
  }

  function handleEdit(product) {
    setEditingId(product.id);

    setFormData({
      name: product.name || "",
      category: product.category || "Coffee",
      price: String(product.price ?? ""),
      image: product.image || "",
      description: product.description || "",
      available: product.available !== false,
    });

    setMessage("");
    setSaveError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    const nextProducts = products.filter(
      (product) => String(product.id) !== String(productId)
    );

    if (saveProducts(nextProducts)) {
      if (String(editingId) === String(productId)) {
        setFormData({ ...emptyProduct });
        setEditingId(null);
      }

      setMessage("Product deleted successfully.");
    }
  }

  function toggleAvailability(productId) {
    const nextProducts = products.map((product) =>
      String(product.id) === String(productId)
        ? {
            ...product,
            available: product.available === false,
          }
        : product
    );

    if (saveProducts(nextProducts)) {
      setMessage("Product availability updated.");
    }
  }

  const searchTerm = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) =>
    [product.name, product.category, product.description].some(
      (value) =>
        String(value || "").toLowerCase().includes(searchTerm)
    )
  );

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-[#B77945]">
          Menu Management
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-[#40291F]">
          Manage Products
        </h1>

        <p className="mt-2 text-gray-500">
          Add, edit, search, remove, and manage café products.
        </p>
      </div>

      {saveError && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {saveError}
        </p>
      )}

      <section className="mb-8 rounded-xl bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-bold text-[#40291F]">
          {editingId !== null ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="product-name" className="mb-2 block text-sm font-medium text-gray-700">
              Product Name *
            </label>
            <input
              id="product-name"
              name="name"
              required
              maxLength={100}
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Cappuccino"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
            />
          </div>

          <div>
            <label htmlFor="product-category" className="mb-2 block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              id="product-category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#B77945]"
            >
              <option>Coffee</option>
              <option>Tea</option>
              <option>Cold Drinks</option>
              <option>Snacks</option>
              <option>Desserts</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="product-price" className="mb-2 block text-sm font-medium text-gray-700">
              Price (₹) *
            </label>
            <input
              id="product-price"
              name="price"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              required
              value={formData.price}
              onChange={handleChange}
              placeholder="149"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
            />
          </div>

          <div>
            <label htmlFor="product-image" className="mb-2 block text-sm font-medium text-gray-700">
              Image URL
            </label>
            <input
              id="product-image"
              name="image"
              type="url"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="product-description" className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="product-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={1000}
              rows={3}
              placeholder="Describe the product..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
            />
          </div>

          {editingId !== null && (
            <label className="flex items-center gap-3 md:col-span-2">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    available: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#40291F]"
              />
              <span className="text-sm text-gray-700">
                Product is available for sale
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button type="submit" className="rounded-lg bg-[#40291F] px-6 py-3 font-medium text-white hover:bg-[#B77945]">
              {editingId !== null ? "Save Changes" : "Add Product"}
            </button>

            {editingId !== null && (
              <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            )}
          </div>

          {message && (
            <p role="status" className="text-sm text-[#80552F] md:col-span-2">
              {message}
            </p>
          )}
        </form>
      </section>

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold text-[#40291F]">
          All Products ({filteredProducts.length})
        </h2>

        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          aria-label="Search products"
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 outline-none focus:border-[#B77945]"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img
                src={product.image || "https://placehold.co/600x400?text=Cafe+Product"}
                alt={product.name || "Café product"}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "https://placehold.co/600x400?text=Cafe+Product";
                }}
                className="h-48 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-[#B77945]">
                    {product.category || "Other"}
                  </p>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    product.available === false
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}>
                    {product.available === false ? "Unavailable" : "Available"}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold text-[#40291F]">
                  {product.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                  {product.description || "No description provided."}
                </p>

                <p className="mt-4 text-xl font-bold text-[#40291F]">
                  {formatPrice(product.price)}
                </p>

                <button
                  type="button"
                  onClick={() => toggleAvailability(product.id)}
                  className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                    product.available === false
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {product.available === false ? "Mark Available" : "Mark Unavailable"}
                </button>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEdit(product)}
                    className="flex-1 rounded-lg border border-[#40291F] px-4 py-2 text-sm font-medium text-[#40291F] hover:bg-[#F7F1E7]"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;
