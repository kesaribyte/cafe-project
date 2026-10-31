
import { useEffect, useState } from "react";
import { ID } from "appwrite";
import { tablesDB, storage } from "../../lib/appwrite";
import { fetchAppwriteProducts } from "../../data/fetchAppwriteProducts";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = import.meta.env.VITE_APPWRITE_PRODUCTS_TABLE_ID;
const bucketId = import.meta.env.VITE_APPWRITE_BUCKET_ID;

const emptyProduct = {
  name: "",
  category: "Coffee",
  price: "",
  image: "",
  description: "",
  available: true,
};

const placeholder = "https://placehold.co/600x400?text=Cafe+Product";

function formatPrice(price) {
  const amount = Number(price);

  return `₹${(Number.isFinite(amount) ? amount : 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getStorageImageUrl(fileId) {
  if (!fileId || !bucketId) return "";

  return storage
    .getFileView({ bucketId, fileId })
    .toString();
}

function Products() {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ ...emptyProduct });
  const [selectedImage, setSelectedImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(selectedImage);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedImage]);

  async function loadProducts() {
    try {
      setSaveError("");
      const data = await fetchAppwriteProducts();
      setProducts(data);
    } catch (error) {
      console.error("Could not load products:", error);
      setSaveError(error.message || "Could not load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
    setSaveError("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setSaveError("Please select a JPG, JPEG, PNG or WebP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setMessage("");
    setSaveError("");
  }

  function resetForm() {
    setFormData({ ...emptyProduct });
    setSelectedImage(null);
    setEditingId(null);
    setMessage("");
    setSaveError("");

    const input = document.getElementById("product-image-file");
    if (input) input.value = "";
  }

  async function handleSubmit(event) {
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

    if (!databaseId || !tableId) {
      setSaveError("Appwrite database or products table ID is missing.");
      return;
    }

    if (selectedImage && !bucketId) {
      setSaveError("Appwrite Storage bucket ID is missing from .env.");
      return;
    }

    const existingProduct = products.find(
      (product) => String(product.id) === String(editingId)
    );

    let newUploadedFileId = "";

    try {
      setSaving(true);

      let imageId = existingProduct?.imageId || "";
      let imageUrl = image;

      // Upload a new image when the admin selects a file.
      if (selectedImage) {
        const uploadedFile = await storage.createFile({
          bucketId,
          fileId: ID.unique(),
          file: selectedImage,
        });

        newUploadedFileId = uploadedFile.$id;
        imageId = uploadedFile.$id;
        imageUrl = getStorageImageUrl(imageId);
      }

      const productData = {
        name,
        category: formData.category,
        price,
        image: imageUrl,
        imageId,
        description,
        available:
          editingId !== null
            ? formData.available !== false
            : true,
        featured: existingProduct?.featured === true,
      };

      if (editingId !== null) {
        await tablesDB.updateRow({
          databaseId,
          tableId,
          rowId: editingId,
          data: productData,
        });
      } else {
        await tablesDB.createRow({
          databaseId,
          tableId,
          rowId: ID.unique(),
          data: productData,
        });
      }

      // Delete the previous Storage image only after the database
      // successfully saves the replacement.
      if (
        newUploadedFileId &&
        existingProduct?.imageId &&
        existingProduct.imageId !== newUploadedFileId
      ) {
        try {
          await storage.deleteFile({
            bucketId,
            fileId: existingProduct.imageId,
          });
        } catch (deleteError) {
          console.error("Could not delete previous image:", deleteError);
        }
      }

      setMessage(
        editingId !== null
          ? "Product updated successfully."
          : "Product added successfully."
      );

      resetForm();
      await loadProducts();
    } catch (error) {
      console.error("Could not save product:", error);

      // Remove an uploaded file if saving the product row failed.
      if (newUploadedFileId) {
        try {
          await storage.deleteFile({
            bucketId,
            fileId: newUploadedFileId,
          });
        } catch (cleanupError) {
          console.error("Could not clean up uploaded image:", cleanupError);
        }
      }

      setSaveError(error.message || "Could not save product.");
    } finally {
      setSaving(false);
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

    setSelectedImage(null);
    setMessage("");
    setSaveError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(product) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setSaveError("");
      setMessage("");

      await tablesDB.deleteRow({
        databaseId,
        tableId,
        rowId: product.id,
      });

      if (product.imageId && bucketId) {
        try {
          await storage.deleteFile({
            bucketId,
            fileId: product.imageId,
          });
        } catch (imageError) {
          console.error("Product deleted, but image cleanup failed:", imageError);
          setMessage(
            "Product deleted, but its Storage image could not be deleted."
          );
        }
      }

      if (String(editingId) === String(product.id)) {
        resetForm();
      }

      if (!product.imageId || !bucketId) {
        setMessage("Product deleted successfully.");
      }

      await loadProducts();
    } catch (error) {
      console.error("Could not delete product:", error);
      setSaveError(error.message || "Could not delete product.");
    }
  }

  async function toggleAvailability(product) {
    try {
      setSaveError("");
      setMessage("");

      await tablesDB.updateRow({
        databaseId,
        tableId,
        rowId: product.id,
        data: {
          available: product.available === false,
        },
      });

      setMessage("Product availability updated.");
      await loadProducts();
    } catch (error) {
      console.error("Could not update availability:", error);
      setSaveError(error.message || "Could not update availability.");
    }
  }

  const searchTerm = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) =>
    [product.name, product.category, product.description].some(
      (value) => String(value || "").toLowerCase().includes(searchTerm)
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
        <p
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700"
        >
          {saveError}
        </p>
      )}

      <section className="mb-8 rounded-xl bg-white p-5 shadow-sm md:p-7">
        <h2 className="mb-5 text-xl font-bold text-[#40291F]">
          {editingId !== null ? "Edit Product" : "Add New Product"}
        </h2>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="product-name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="product-category"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="product-price"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="product-image"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Image URL (optional)
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
            <label
              htmlFor="product-image-file"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Upload Product Image (JPG, PNG, WebP — max 5 MB)
            </label>
            <input
              id="product-image-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
            />

            {selectedImage && (
              <p className="mt-2 text-sm text-gray-500">
                Selected: {selectedImage.name}
              </p>
            )}

            {(previewUrl || (editingId !== null && formData.image)) && (
              <img
                src={previewUrl || formData.image}
                alt="Product preview"
                className="mt-4 h-40 w-40 rounded-lg border object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = placeholder;
                }}
              />
            )}
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="product-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
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
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#40291F] px-6 py-3 font-medium text-white hover:bg-[#B77945] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Save Changes"
                  : "Add Product"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>

          {message && (
            <p
              role="status"
              className="text-sm text-[#80552F] md:col-span-2"
            >
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

      {loading ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          Loading products from Appwrite...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-xl bg-white p-10 text-center text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
            >
              <img
                src={product.image || placeholder}
                alt={product.name || "Café product"}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = placeholder;
                }}
                className="h-48 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wider text-[#B77945]">
                    {product.category || "Other"}
                  </p>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      product.available === false
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {product.available === false
                      ? "Unavailable"
                      : "Available"}
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
                  onClick={() => toggleAvailability(product)}
                  className={`mt-4 w-full rounded-lg px-4 py-2 text-sm font-medium ${
                    product.available === false
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {product.available === false
                    ? "Mark Available"
                    : "Mark Unavailable"}
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
                    onClick={() => handleDelete(product)}
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
