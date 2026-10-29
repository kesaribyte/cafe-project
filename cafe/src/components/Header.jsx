
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

function getCafeName() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("cafe-settings") || "{}"
    );

    return typeof settings.cafeName === "string" &&
      settings.cafeName.trim()
      ? settings.cafeName.trim()
      : "कॉफी कट्टा";
  } catch {
    return  "कॉफी कट्टा";
  }
}

function Header({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cafeName = getCafeName();

  const navClass = ({ isActive }) =>
    `block py-2 text-sm transition hover:text-cafe-caramel ${
      isActive
        ? "font-semibold text-cafe-caramel"
        : "text-cafe-brown"
    }`;

  function closeMenu() {
    setMenuOpen(false);
  }

  const navigationLinks = [
    { name: "Home", path: "/", end: true },
    { name: "Menu", path: "/menu" },
    { name: "Our Story", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "My Orders", path: "/orders" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-cafe-beige bg-cafe-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-10">
        <Link
          to="/"
          onClick={closeMenu}
          className="font-heading text-2xl font-bold text-cafe-brown"
        >
          {cafeName}
          <span className="text-cafe-caramel">   </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={navClass}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            onClick={closeMenu}
            className="rounded-md border border-cafe-beige px-3 py-2 text-sm text-cafe-brown transition hover:bg-cafe-brown hover:text-white"
          >
            Bag ({cartCount})
          </Link>

          <button
            type="button"
            aria-label={
              menuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-cafe-beige text-xl text-cafe-brown md:hidden"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-cafe-beige px-5 py-3 md:hidden">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={navClass}
              onClick={closeMenu}
            >
              {link.name}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}

export default Header;
