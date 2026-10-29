
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PROFILE_KEY = "cafe-admin-profile";

function getProfile() {
  const fallback = {
    name: "Cafe Admin",
    email: "admin@example.com",
  };

  try {
    const saved = localStorage.getItem(PROFILE_KEY);

    if (!saved) return fallback;

    const parsed = JSON.parse(saved);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      typeof parsed.name !== "string" ||
      typeof parsed.email !== "string"
    ) {
      return fallback;
    }

    return {
      name: parsed.name,
      email: parsed.email,
    };
  } catch (error) {
    console.error("Could not load admin profile:", error);
    return fallback;
  }
}

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSave(event) {
    event.preventDefault();
    setMessage("");

    const name = profile.name.trim();
    const email = profile.email.trim();

    if (name.length < 2 || name.length > 100) {
      setMessageType("error");
      setMessage("Name must be between 2 and 100 characters.");
      return;
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    try {
      const updatedProfile = { name, email };

      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(updatedProfile)
      );

      setProfile(updatedProfile);
      setMessageType("success");
      setMessage("Profile saved successfully.");
    } catch (error) {
      console.error("Could not save admin profile:", error);
      setMessageType("error");
      setMessage(
        "Could not save your profile. Please check browser storage and try again."
      );
    }
  }

  function handleLogout() {
    try {
      sessionStorage.removeItem("cafe-admin-session");
      navigate("/admin/login", { replace: true });
    } catch (error) {
      console.error("Could not log out:", error);
      setMessageType("error");
      setMessage("Could not log out. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-[#40291F]">
        Admin Profile
      </h1>

      <p className="mb-8 text-gray-600">
        Manage your administrator details.
      </p>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-2xl border border-[#E8D8C4] bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="admin-profile-name"
            className="mb-2 block font-medium text-[#40291F]"
          >
            Admin Name
          </label>

          <input
            id="admin-profile-name"
            name="name"
            type="text"
            value={profile.name}
            onChange={handleChange}
            maxLength={100}
            autoComplete="name"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#B77945]"
          />
        </div>

        <div>
          <label
            htmlFor="admin-profile-email"
            className="mb-2 block font-medium text-[#40291F]"
          >
            Email Address
          </label>

          <input
            id="admin-profile-email"
            name="email"
            type="email"
            value={profile.email}
            onChange={handleChange}
            maxLength={254}
            autoComplete="email"
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#B77945]"
          />
        </div>

        {message && (
          <p
            role={messageType === "error" ? "alert" : "status"}
            className={`text-sm ${
              messageType === "error"
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-[#40291F] px-6 py-3 font-semibold text-white transition hover:bg-[#5A3B2D]"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </form>

      <p className="mt-4 text-sm text-gray-500">
        Note: profile details are currently saved in this browser.
        Changing this email does not change your login credentials.
      </p>
    </div>
  );
}

export default Profile;
