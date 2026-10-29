
import { Link } from "react-router-dom";

function AdminHeader() {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-5 md:px-8">
      <div>
        <p className="text-sm text-gray-500">कॉफी कट्टा</p>

        <h2 className="text-xl font-semibold text-[#40291F]">
          Admin Panel
        </h2>
      </div>

      <Link
        to="/"
        className="rounded-lg bg-[#40291F] px-4 py-2 text-sm text-white transition hover:bg-[#B77945]"
      >
        Visit Store
      </Link>
    </header>
  );
}

export default AdminHeader;
