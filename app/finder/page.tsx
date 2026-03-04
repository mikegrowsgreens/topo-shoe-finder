import Link from "next/link";

export default function FinderLanding() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[calc(100vh-57px)] items-center justify-center bg-[#363A4A] overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />

        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <p className="mb-6 text-sm font-medium uppercase tracking-widest text-teal">
            Shoe Finder
          </p>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Find Your
            <span className="block text-teal">Perfect Shoe</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base text-white/50 md:text-lg">
            Answer 6 quick questions and we&apos;ll match you with the ideal Topo Athletic shoe
            for your feet and your goals.
          </p>

          <div className="mt-10">
            <Link
              href="/finder/1"
              className="group inline-flex items-center gap-2 rounded-lg bg-teal px-8 py-4 text-lg font-semibold text-white transition-all duration-200 hover:bg-teal-dark active:scale-[0.98]"
            >
              Start Shoe Finder
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/30">Takes about 60 seconds</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-navy md:text-4xl">
            How It Works
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { num: "01", title: "Answer Questions", desc: "Tell us about your activity, cushion, and fit preferences." },
              { num: "02", title: "Get Matched", desc: "Our algorithm scores every shoe against your needs." },
              { num: "03", title: "Compare & Shop", desc: "See your top 3 matches with full specs and shop links." },
            ].map((step) => (
              <div key={step.num} className="rounded-xl border border-warm-gray-200 p-6">
                <span className="text-4xl font-bold text-teal/20">
                  {step.num}
                </span>
                <h3 className="mt-2 text-lg font-bold text-navy">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-warm-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Topo */}
      <section className="bg-navy px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
            Why Topo Athletic?
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: "Anatomical Toe Box", desc: "Room for natural toe splay without excess bulk." },
              { title: "Low 5mm Drop", desc: "Promotes natural running form and foot mechanics." },
              { title: "Trail to Road", desc: "Purpose-built shoes for every surface you run on." },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-bold text-teal">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
