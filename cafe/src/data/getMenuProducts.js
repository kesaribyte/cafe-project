
import menuData from "./menuData";

const STORAGE_KEY = "cafe-menu-products";

export function getMenuProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    // Use the default menu if no admin menu has been saved.
    if (saved === null) {
      return menuData;
    }

    const products = JSON.parse(saved);

    if (!Array.isArray(products)) {
      console.error("Saved café products must be an array.");
      return menuData;
    }

    // Ignore invalid product records.
    return products
      .filter((product) => {
        if (
          !product ||
          typeof product !== "object" ||
          Array.isArray(product)
        ) {
          return false;
        }

        const price = Number(product.price);

        return (
          product.id !== undefined &&
          product.id !== null &&
          product.id !== "" &&
          typeof product.name === "string" &&
          product.name.trim() !== "" &&
          product.price !== "" &&
          product.price !== null &&
          Number.isFinite(price) &&
          price >= 0
        );
      })
      .map((product) => ({
        ...product,
        price: Number(product.price),
        available: product.available !== false,
      }));
  } catch (error) {
    console.error("Could not load café products:", error);
    return menuData;
  }
}

export default getMenuProducts;
