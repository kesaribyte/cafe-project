
import { Link } from "react-router-dom";

function getCafeName() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("cafe-settings") || "{}"
    );

    return typeof settings.cafeName === "string" &&
      settings.cafeName.trim()
      ? settings.cafeName.trim()
      :"कॉफी कट्टा";
  } catch {
    return "कॉफी कट्टा";
  }
}

function Footer() {
  const cafeName = getCafeName();

  return (
    <footer className="bg-cafe-brown px-5 py-12 text-white md:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link
            to="/"
            className="font-heading text-3xl font-bold"
          >
            {cafeName}
            <span className="text-cafe-caramel">.</span>
          </Link>

          <p className="mt-4 max-w-xs text-sm leading-7 text-gray-300">
            Good coffee, delicious food, and little moments of happiness.
          </p>
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Explore</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <Link to="/" className="transition hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/menu" className="transition hover:text-white">
                Our Menu
              </Link>
            </li>
            <li>
              <Link to="/about" className="transition hover:text-white">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Your Account</h2>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>
              <Link to="/cart" className="transition hover:text-white">
                Shopping Bag
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="transition hover:text-white">
                Checkout
              </Link>
            </li>
            <li>
              <Link to="/orders" className="transition hover:text-white">
                My Orders
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-semibold">Connect With Me</h2>
          <p className="mb-4 text-sm leading-7 text-gray-300">
            Follow my journey in technology and development.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="https://www.linkedin.com/in/omraje-shitole-a6a42324a"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-gray-300 transition hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 font-bold">
                in
              </span>
              LinkedIn
            </a>

            <a
              href="https://x.com/OmrajeShitole"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-gray-300 transition hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 font-bold">
                𝕏
              </span>
              X (Twitter)
            </a>

            <a
              href="https://github.com/kesaribyte"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 text-sm text-gray-300 transition hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 font-bold">
                GH
              </span>
              GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/20 pt-6 text-center text-sm text-gray-300">
        © {new Date().getFullYear()} {cafeName}. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
