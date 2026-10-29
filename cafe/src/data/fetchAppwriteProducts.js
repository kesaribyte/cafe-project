
import { tablesDB } from "../lib/appwrite";

const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = import.meta.env.VITE_APPWRITE_PRODUCTS_TABLE_ID;

export async function fetchAppwriteProducts() {
  if (!databaseId || !tableId) {
    throw new Error(
      "Missing Appwrite database ID or products table ID in .env"
    );
  }

  const response = await tablesDB.listRows({
    databaseId,
    tableId,
  });

  return response.rows
    .filter(
      (row) =>
        row &&
        typeof row.name === "string" &&
        row.name.trim() !== "" &&
        Number.isFinite(Number(row.price)) &&
        Number(row.price) >= 0
    )
    .map((row) => ({
      id: row.$id,
      name: row.name,
      description: row.description || "",
      price: Number(row.price),
      category: row.category || "Other",
      image: row.image || "",
      imageId: row.imageId || "",
      available: row.available !== false,
      featured: row.featured === true,
    }));
}

export default fetchAppwriteProducts;
