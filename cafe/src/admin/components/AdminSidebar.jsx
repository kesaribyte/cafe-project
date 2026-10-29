
import { NavLink } from "react-router-dom";

const links = [
  { name: "Dashboard", path: "/admin", end: true },
  { name: "Orders", path: "/admin/orders" },
  { name: "Products", path: "/admin/products" },
  { name: "Settings", path: "/admin/settings" },
  { name: "Profile", path: "/admin/profile" },
];

function AdminSidebar() {
  return (
    <aside className="flex w-full flex-col bg-[#2F211B] p-5 text-white md:min-h-screen md:w-64">
      <h1 className="mb-8 font-serif text-2xl font-bold">
      कॉफी कट्टा
      </h1>

      <p className="mb-3 text-xs uppercase tracking-widest text-gray-400">
        Administration
      </p>

      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end || false}
            className={({ isActive }) =>
              `rounded-lg px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-[#B77945] text-white"
                  : "text-gray-300 hover:bg-white/10"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/"
        className="mt-8 rounded-lg border border-white/20 px-4 py-3 text-sm text-gray-300 transition hover:bg-white/10"
      >
        ← View Website
      </NavLink>
    </aside>
  );
}

export default AdminSidebar;
