
import { useState } from "react";

const SETTINGS_KEY = "cafe-settings";

const defaultSettings = {
  cafeName: "Café",
  email: "",
  phone: "",
  address: "",
  deliveryFee: "40",
  openingTime: "09:00",
  closingTime: "22:00",
};

function getSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed)
      ) {
        return {
          cafeName:
            typeof parsed.cafeName === "string"
              ? parsed.cafeName
              : defaultSettings.cafeName,
          email:
            typeof parsed.email === "string"
              ? parsed.email
              : defaultSettings.email,
          phone:
            typeof parsed.phone === "string"
              ? parsed.phone
              : defaultSettings.phone,
          address:
            typeof parsed.address === "string"
              ? parsed.address
              : defaultSettings.address,
          deliveryFee:
            (typeof parsed.deliveryFee === "string" ||
              typeof parsed.deliveryFee === "number") &&
            String(parsed.deliveryFee).trim() !== ""
              ? String(parsed.deliveryFee)
              : defaultSettings.deliveryFee,
          openingTime:
            typeof parsed.openingTime === "string"
              ? parsed.openingTime
              : defaultSettings.openingTime,
          closingTime:
            typeof parsed.closingTime === "string"
              ? parsed.closingTime
              : defaultSettings.closingTime,
        };
      }
    }
  } catch (error) {
    console.error("Could not load café settings:", error);
  }

  return { ...defaultSettings };
}

function Settings() {
  const [settings, setSettings] = useState(getSettings);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  function handleChange(event) {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  }

  function showMessage(text, type = "success") {
    setMessage(text);
    setMessageType(type);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const cafeName = settings.cafeName.trim();
    const email = settings.email.trim();
    const phone = settings.phone.trim();
    const address = settings.address.trim();
    const deliveryFee = Number(settings.deliveryFee);

    if (!cafeName || cafeName.length > 100) {
      showMessage(
        "Enter a café name containing 1–100 characters.",
        "error"
      );
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMessage("Enter a valid business email.", "error");
      return;
    }

    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      showMessage("Enter a valid business phone number.", "error");
      return;
    }

    if (address.length > 500) {
      showMessage("The address must be under 500 characters.", "error");
      return;
    }

    if (
      settings.deliveryFee.trim() === "" ||
      !Number.isFinite(deliveryFee) ||
      deliveryFee < 0 ||
      deliveryFee > 100000
    ) {
      showMessage("Enter a delivery fee between ₹0 and ₹100,000.", "error");
      return;
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (
      !timePattern.test(settings.openingTime) ||
      !timePattern.test(settings.closingTime) ||
      settings.openingTime === settings.closingTime
    ) {
      showMessage(
        "Enter valid opening and closing times. They cannot be identical.",
        "error"
      );
      return;
    }

    const updatedSettings = {
      ...settings,
      cafeName,
      email,
      phone,
      address,
      deliveryFee: String(deliveryFee),
    };

    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(updatedSettings)
      );

      setSettings(updatedSettings);
      showMessage("Settings saved successfully.");
    } catch (error) {
      console.error("Could not save café settings:", error);
      showMessage(
        "Could not save settings. Check browser storage.",
        "error"
      );
    }
  }

  function resetSettings() {
    const confirmed = window.confirm(
      "Reset all café settings to their default values?"
    );

    if (!confirmed) return;

    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(defaultSettings)
      );

      setSettings({ ...defaultSettings });
      showMessage("Settings reset to defaults.");
    } catch (error) {
      console.error("Could not reset café settings:", error);
      showMessage("Could not reset settings. Please try again.", "error");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-widest text-[#B77945]">
          Configuration
        </p>

        <h1 className="mt-2 font-serif text-3xl font-bold text-[#40291F]">
          Café Settings
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your café's business information and delivery preferences.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-xl bg-white p-5 shadow-sm md:p-8"
      >
        <section>
          <h2 className="mb-5 border-b border-gray-100 pb-3 text-lg font-bold text-[#40291F]">
            Business Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor="cafe-name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Café Name
              </label>

              <input
                id="cafe-name"
                name="cafeName"
                value={settings.cafeName}
                onChange={handleChange}
                maxLength={100}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>

            <div>
              <label
                htmlFor="cafe-email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Business Email
              </label>

              <input
                id="cafe-email"
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                maxLength={254}
                placeholder="hello@example.com"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>

            <div>
              <label
                htmlFor="cafe-phone"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>

              <input
                id="cafe-phone"
                type="tel"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter phone number"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="cafe-address"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Café Address
              </label>

              <textarea
                id="cafe-address"
                name="address"
                value={settings.address}
                onChange={handleChange}
                rows={3}
                maxLength={500}
                placeholder="Enter your café address"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-5 border-b border-gray-100 pb-3 text-lg font-bold text-[#40291F]">
            Delivery Settings
          </h2>

          <div>
            <label
              htmlFor="delivery-fee"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Delivery Fee (₹)
            </label>

            <input
              id="delivery-fee"
              type="number"
              name="deliveryFee"
              value={settings.deliveryFee}
              onChange={handleChange}
              min="0"
              max="100000"
              step="0.01"
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945] md:max-w-sm"
            />

            <p className="mt-2 text-xs text-gray-500">
              Saved in this browser. Checkout reads this setting when
              calculating the delivery fee.
            </p>
          </div>
        </section>

        <section>
          <h2 className="mb-5 border-b border-gray-100 pb-3 text-lg font-bold text-[#40291F]">
            Opening Hours
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="opening-time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Opening Time
              </label>

              <input
                id="opening-time"
                type="time"
                name="openingTime"
                value={settings.openingTime}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>

            <div>
              <label
                htmlFor="closing-time"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Closing Time
              </label>

              <input
                id="closing-time"
                type="time"
                name="closingTime"
                value={settings.closingTime}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-[#B77945]"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-6">
          <button
            type="submit"
            className="rounded-lg bg-[#40291F] px-6 py-3 font-medium text-white transition hover:bg-[#B77945]"
          >
            Save Settings
          </button>

          <button
            type="button"
            onClick={resetSettings}
            className="rounded-lg border border-gray-200 px-6 py-3 text-gray-600 hover:bg-gray-50"
          >
            Reset Defaults
          </button>
        </div>

        {message && (
          <p
            role={messageType === "error" ? "alert" : "status"}
            className={`text-sm font-medium ${
              messageType === "error"
                ? "text-red-600"
                : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default Settings;
