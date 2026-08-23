import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YARA LABS | Systems, Automation, Infrastructure",
  description:
    "YARA LABS builds quiet systems, automation, and infrastructure for growing businesses.",
};

const navItems = ["Work", "Services", "About", "Contact"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fbfbfa] text-[#15161c]">
      <nav className="mx-auto flex w-full max-w-[1720px] items-center justify-between px-6 py-8 sm:px-10 lg:px-16">
        <a
          href="#"
          className="font-mono text-[0.95rem] font-semibold uppercase tracking-[0.18em] text-[#171820]"
          aria-label="YARA LABS home"
        >
          YARA LABS
        </a>

        <div className="hidden items-center gap-11 text-sm font-medium text-[#171820] sm:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="transition-colors duration-200 hover:text-[#7546ff]"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section className="relative mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1720px] items-center justify-center px-6 pb-20 pt-16 sm:px-10 lg:px-16">
        <div className="hero-grid" aria-hidden="true">
          <span className="node node-left" />
          <span className="node node-mid" />
          <span className="node node-right" />
          <span className="orb orb-left" />
          <span className="orb orb-right" />
          <span className="vertical-line left-line" />
          <span className="vertical-line right-line" />
        </div>

        <div className="relative z-10 flex w-full max-w-[980px] flex-col items-center text-center">
          <p className="mb-10 font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8a8f9f] sm:text-sm">
            Systems <span className="mx-3 text-[#7c4dff]">•</span> Automation
            <span className="mx-3 text-[#7c4dff]">•</span> Infrastructure
          </p>

          <h1 className="max-w-[920px] font-mono text-[clamp(3rem,7vw,6.75rem)] font-normal leading-[0.98] tracking-normal text-[#15161c]">
            Good systems should feel almost invisible.
          </h1>

          <p className="mt-8 max-w-[760px] text-balance text-lg leading-8 text-[#3f4350] sm:text-[1.35rem]">
            Complexity is a natural part of growth. Strong systems make sure it
            never becomes the limit.
          </p>

          <form className="mt-11 flex w-full max-w-[660px] flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="hero-email">
              Email address
            </label>
            <input
              id="hero-email"
              type="email"
              placeholder="Enter your email"
              className="h-16 min-w-0 flex-1 rounded-md border border-[#c8ccda] bg-white/75 px-6 text-base text-[#171820] outline-none transition duration-200 placeholder:text-[#8b90a0] focus:border-[#7c4dff] focus:ring-4 focus:ring-[#7c4dff]/10"
            />
            <button
              type="submit"
              className="h-16 rounded-md bg-[linear-gradient(120deg,#e93edc_0%,#8a4bff_48%,#1468ff_100%)] px-9 text-base font-semibold text-white shadow-[0_18px_36px_rgba(91,81,255,0.22)] transition duration-200 hover:translate-y-[-1px] hover:shadow-[0_22px_42px_rgba(91,81,255,0.28)]"
            >
              Free Consult
            </button>
          </form>

          <a
            href="#work"
            className="mt-9 inline-flex items-center gap-3 border-b border-[#b9bdc9] pb-1 text-base font-medium text-[#4b5060] transition-colors duration-200 hover:text-[#171820]"
          >
            <span aria-hidden="true">-&gt;</span>
            Explore Our Work
          </a>
        </div>
      </section>
    </main>
  );
}
