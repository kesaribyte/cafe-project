
import { useState } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85";

function Hero() {
  const [imageSrc, setImageSrc] = useState(HERO_IMAGE);

  return (
    <section className="bg-cafe-cream">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div className="text-center md:text-left">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-cafe-caramel">
            Your Daily Coffee Ritual
          </p>

          <h1 className="font-heading text-4xl font-semibold leading-tight text-cafe-brown sm:text-5xl md:text-6xl">
            Good Coffee.
            <br />
            Good Moments.
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-7 text-stone-600 md:mx-0 md:text-lg">
            Thoughtfully crafted coffee and fresh café favourites,
            delivered to your door.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <Link
              to="/menu"
              className="rounded-md bg-cafe-brown px-7 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-cafe-caramel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
            >
              Order Now
            </Link>

            <Link
              to="/menu"
              className="rounded-md border border-cafe-brown px-7 py-3.5 text-center text-sm font-medium text-cafe-brown transition-colors hover:bg-cafe-brown hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
            >
              Explore Menu
            </Link>
          </div>

          <p className="mt-8 text-sm text-stone-500">
            Made with care · Served with warmth
          </p>
        </div>

        <div className="relative">
          <img
            src={imageSrc}
            alt="A welcoming café setting with freshly prepared coffee"
            onError={() => {
              if (imageSrc !== FALLBACK_IMAGE) {
                setImageSrc(FALLBACK_IMAGE);
              }
            }}
            className="h-[320px] w-full rounded-2xl object-cover shadow-lg sm:h-[420px] md:h-[520px]"
          />

          <div className="absolute -bottom-4 left-4 rounded-lg bg-white/95 px-5 py-4 shadow-md sm:bottom-6 sm:left-6">
            <p className="font-heading text-lg font-semibold text-cafe-brown">
              Made for your moment
            </p>
            <p className="mt-1 text-xs text-stone-500">
              Your favourites, just a few clicks away.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
