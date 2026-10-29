
import { useState } from "react";
import { Link } from "react-router-dom";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1000";

const FALLBACK_IMAGE =
  "https://placehold.co/1000x800?text=Welcome+to+Cafe";

function About() {
  const [imageSrc, setImageSrc] = useState(ABOUT_IMAGE);

  return (
    <main className="min-h-screen bg-cafe-cream">
      {/* Our Story */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:px-10 md:py-24">
        <div>
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-cafe-caramel">
            Our Story
          </p>

          <h1 className="font-heading text-4xl font-bold leading-tight text-cafe-brown md:text-6xl">
            More Than Coffee.
            <br />
            A Little Happiness.
          </h1>

          <p className="mt-6 leading-8 text-gray-600">
            At कॉफी कट्टा, we believe the best moments often begin with a good
            cup of coffee and something delicious to share.
          </p>

          <p className="mt-4 leading-8 text-gray-600">
            From freshly brewed coffee to comforting snacks and sweet
            treats, we focus on quality ingredients, thoughtful
            preparation, and making every order special.
          </p>

          <Link
            to="/menu"
            className="mt-8 inline-block rounded-md bg-cafe-brown px-6 py-3 font-medium text-white transition-colors hover:bg-cafe-caramel focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cafe-brown"
          >
            Explore Our Menu
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <img
            src={imageSrc}
            alt="Warm and welcoming café interior"
            onError={() => {
              if (imageSrc !== FALLBACK_IMAGE) {
                setImageSrc(FALLBACK_IMAGE);
              }
            }}
            className="h-[350px] w-full object-cover md:h-[500px]"
          />
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-white px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 text-center md:grid-cols-3">
          <article className="rounded-xl p-5 transition-colors hover:bg-cafe-cream">
            <h2 className="font-heading text-2xl font-bold text-cafe-brown">
              Quality First
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Carefully selected ingredients and freshly prepared favourites.
            </p>
          </article>

          <article className="rounded-xl p-5 transition-colors hover:bg-cafe-cream">
            <h2 className="font-heading text-2xl font-bold text-cafe-brown">
              Made With Care
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Every cup and every bite deserves attention to detail.
            </p>
          </article>

          <article className="rounded-xl p-5 transition-colors hover:bg-cafe-cream">
            <h2 className="font-heading text-2xl font-bold text-cafe-brown">
              Delivered To You
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Café favourites prepared for you to enjoy at home.
            </p>
          </article>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="px-5 py-16 text-center md:py-20">
        <h2 className="font-heading text-3xl font-bold text-cafe-brown md:text-4xl">
          Your Next Favourite Awaits
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-gray-600">
          Discover your next favourite coffee, snack, or sweet treat.
        </p>

        <Link
          to="/menu"
          className="mt-7 inline-block rounded-md bg-cafe-brown px-6 py-3 font-medium text-white transition-colors hover:bg-cafe-caramel"
        >
          Discover Our Menu
        </Link>
      </section>
    </main>
  );
}

export default About;
