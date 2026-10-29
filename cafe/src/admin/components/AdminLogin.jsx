
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (isSubmitting) return;

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      setError("Admin credentials are not configured in your .env file.");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const configuredEmail = adminEmail.trim().toLowerCase();

    if (
      normalizedEmail !== configuredEmail ||
      password !== adminPassword
    ) {
      setError("Invalid email or password.");
      setPassword("");
      return;
    }

    try {
      setIsSubmitting(true);
      sessionStorage.setItem("cafe-admin-session", "true");
      navigate("/admin", { replace: true });
    } catch (err) {
      console.error("Could not create admin session:", err);
      setError("Could not start your session. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F1E7] px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#40291F] font-serif text-3xl font-bold text-white">
            C
          </div>

          <h1 className="font-serif text-3xl font-bold text-[#40291F]">
          कॉफी कट्टा Admin
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your café.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium text-[#40291F]"
            >
              Email Address
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="admin@example.com"
              autoComplete="username"
              maxLength={254}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-[#B77945] focus:ring-2 focus:ring-[#B77945]/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium text-[#40291F]"
            >
              Password
            </label>

            <div className="flex rounded-lg border border-gray-200 focus-within:border-[#B77945] focus-within:ring-2 focus-within:ring-[#B77945]/20">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="min-w-0 flex-1 rounded-l-lg px-4 py-3 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                className="px-4 text-sm font-medium text-[#B77945]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-[#40291F] py-3 font-semibold text-white transition hover:bg-[#B77945] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="mt-6 w-full text-center text-sm text-gray-500 hover:text-[#B77945]"
        >
          ← Back to Website
        </button>

        <p className="mt-6 text-center text-xs text-gray-400">
          Café Management System
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;
