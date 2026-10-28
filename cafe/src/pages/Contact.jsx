
import { useState } from "react";

const MESSAGE_STORAGE_KEY = "cafe-messages";
const SETTINGS_STORAGE_KEY = "cafe-settings";

const DEFAULT_SETTINGS = {
  cafeName: "Café",
  email: "hello@yourcafe.com",
  phone: "",
  address: "",
  openingTime: "09:00",
  closingTime: "22:00",
};

function getCafeSettings() {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!savedSettings) {
      return DEFAULT_SETTINGS;
    }

    const parsedSettings = JSON.parse(savedSettings);

    if (
      !parsedSettings ||
      typeof parsedSettings !== "object" ||
      Array.isArray(parsedSettings)
    ) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };
  } catch (error) {
    console.error("Unable to load café settings:", error);
    return DEFAULT_SETTINGS;
  }
}

function formatTime(time) {
  if (
    typeof time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ) {
    return time;
  }

  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState({
    type: "",
    text: "",
  });

  const settings = getCafeSettings();

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setStatus({
      type: "",
      text: "",
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !email || !message) {
      setStatus({
        type: "error",
        text: "Please complete all fields before submitting.",
      });
      return;
    }

    if (name.length > 100) {
      setStatus({
        type: "error",
        text: "Your name must be 100 characters or fewer.",
      });
      return;
    }

    if (email.length > 254) {
      setStatus({
        type: "error",
        text: "Please enter a shorter email address.",
      });
      return;
    }

    if (message.length > 2000) {
      setStatus({
        type: "error",
        text: "Your message must be 2,000 characters or fewer.",
      });
      return;
    }

    try {
      const storedMessages = localStorage.getItem(
        MESSAGE_STORAGE_KEY
      );

      const parsedMessages = storedMessages
        ? JSON.parse(storedMessages)
        : [];

      if (!Array.isArray(parsedMessages)) {
        throw new Error("Saved messages have an invalid format.");
      }

      const newMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        email,
        message,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(
        MESSAGE_STORAGE_KEY,
        JSON.stringify([...parsedMessages, newMessage])
      );

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setStatus({
        type: "success",
        text: "Thank you! Your message has been saved in this browser.",
      });
    } catch (error) {
      console.error("Unable to save contact message:", error);

      setStatus({
        type: "error",
        text: "We couldn't save your message. Please try again.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-cafe-cream px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Page Heading */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-cafe-caramel">
            Get In Touch
          </p>

          <h1 className="font-heading text-4xl font-bold text-cafe-brown md:text-5xl">
            Contact Us
          </h1>

          <p className="mt-4 text-gray-600">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Café Contact Information */}
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-2xl font-bold text-cafe-brown">
              Let's Talk
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-cafe-brown">
                  Address
                </h3>

                <p className="mt-1 whitespace-pre-line text-gray-600">
                  {typeof settings.address === "string" &&
                  settings.address.trim()
                    ? settings.address
                    : "Visit us soon. Our address will be updated here."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-cafe-brown">
                  Opening Hours
                </h3>

                <p className="mt-1 text-gray-600">
                  Monday – Sunday
                </p>

                <p className="text-gray-600">
                  {formatTime(settings.openingTime)} –{" "}
                  {formatTime(settings.closingTime)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-cafe-brown">
                  Email
                </h3>

                {typeof settings.email === "string" &&
                settings.email.trim() ? (
                  <a
                    href={`mailto:${settings.email.trim()}`}
                    className="mt-1 inline-block break-all text-cafe-caramel hover:underline"
                  >
                    {settings.email.trim()}
                  </a>
                ) : (
                  <p className="mt-1 text-gray-600">
                    Email details will be updated soon.
                  </p>
                )}
              </div>

              {typeof settings.phone === "string" &&
                settings.phone.trim() && (
                  <div>
                    <h3 className="font-semibold text-cafe-brown">
                      Phone
                    </h3>

                    <a
                      href={`tel:${settings.phone.trim()}`}
                      className="mt-1 inline-block text-cafe-caramel hover:underline"
                    >
                      {settings.phone.trim()}
                    </a>
                  </div>
                )}
            </div>
          </section>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl bg-white p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-cafe-brown">
              Send a Message
            </h2>

            {status.text && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-lg p-3 text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {status.text}
              </p>
            )}

            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Your Name
              </label>

              <input
                id="contact-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                maxLength={100}
                required
                className="w-full rounded-md border border-cafe-beige p-3 outline-none transition focus:border-cafe-caramel focus:ring-2 focus:ring-cafe-caramel/20"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Email Address
              </label>

              <input
                id="contact-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                maxLength={254}
                required
                className="w-full rounded-md border border-cafe-beige p-3 outline-none transition focus:border-cafe-caramel focus:ring-2 focus:ring-cafe-caramel/20"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-medium text-cafe-brown"
              >
                Message
              </label>

              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                maxLength={2000}
                required
                className="w-full resize-y rounded-md border border-cafe-beige p-3 outline-none transition focus:border-cafe-caramel focus:ring-2 focus:ring-cafe-caramel/20"
                placeholder="How can we help?"
              />

              <p className="mt-1 text-right text-xs text-gray-500">
                {formData.message.length}/2000 characters
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-cafe-brown px-5 py-3 font-medium text-white transition-colors hover:bg-cafe-caramel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
            >
              Send Message
            </button>

            <p className="text-xs leading-5 text-gray-500">
              This demo saves messages only in your current browser. It
              does not send an email or notify the café owner.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Contact;
