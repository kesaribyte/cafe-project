
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import About from "./pages/About";
import OrderHistory from "./pages/OrderHistory";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetails from "./pages/ProductDetails";

import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminApp from "./admin/components/AdminApp";

const CART_KEY = "cafe-cart";
const MAX_QUANTITY = 20;

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          item.id !== undefined &&
          item.id !== null &&
          item.id !== ""
      )
      .map((item) => {
        const quantity = Number(item.quantity);

        return {
          ...item,
          quantity:
            Number.isInteger(quantity) &&
            quantity >= 1 &&
            quantity <= MAX_QUANTITY
              ? quantity
              : 1,
        };
      });
  } catch (error) {
    console.error("Could not load cart:", error);
    return [];
  }
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Could not save cart:", error);
    }
  }, [cartItems]);

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  function addToCart(product, quantity = 1) {
    const requestedQuantity = Number(quantity);

    if (
      !product ||
      product.id === undefined ||
      product.id === null ||
      product.available === false ||
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1 ||
      requestedQuantity > MAX_QUANTITY
    ) {
      return;
    }

    setCartItems((items) => {
      const existing = items.find(
        (item) => String(item.id) === String(product.id)
      );

      if (existing) {
        const nextQuantity =
          Number(existing.quantity) + requestedQuantity;

        if (nextQuantity > MAX_QUANTITY) return items;

        return items.map((item) =>
          String(item.id) === String(product.id)
            ? {
                ...item,
                ...product,
                quantity: nextQuantity,
              }
            : item
        );
      }

      return [
        ...items,
        { ...product, quantity: requestedQuantity },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    const nextQuantity = Number(quantity);

    if (
      !Number.isInteger(nextQuantity) ||
      nextQuantity < 1 ||
      nextQuantity > MAX_QUANTITY
    ) {
      return;
    }

    setCartItems((items) =>
      items.map((item) =>
        String(item.id) === String(productId)
          ? { ...item, quantity: nextQuantity }
          : item
      )
    );
  }

  function removeFromCart(productId) {
    setCartItems((items) =>
      items.filter(
        (item) => String(item.id) !== String(productId)
      )
    );
  }

  function clearCart() {
    setCartItems([]);

    try {
      localStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error("Could not clear saved cart:", error);
    }
  }

  return (
    <>
      {!isAdminRoute && <Header cartCount={cartCount} />}

      <Routes>
        <Route
          path="/"
          element={<Home addToCart={addToCart} />}
        />

        <Route
          path="/menu"
          element={
            <Menu
              addToCart={addToCart}
              cartItems={cartItems}
            />
          }
        />

        <Route
          path="/menu/:productId"
          element={
            <ProductDetails
              addToCart={addToCart}
              cartItems={cartItems}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cartItems={cartItems}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <Checkout
              cartItems={cartItems}
              clearCart={clearCart}
            />
          }
        />

        <Route
          path="/order-success"
          element={<OrderSuccess />}
        />

        <Route
          path="/orders"
          element={<OrderHistory />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/admin/*"
          element={<AdminApp />}
        />
      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
