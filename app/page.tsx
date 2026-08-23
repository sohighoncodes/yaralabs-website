import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YARA LABS | Systems, Automation, Infrastructure",
  description:
    "YARA LABS builds quiet systems, automation, and infrastructure for growing businesses.",
};

const navItems = ["Work", "Services", "About", "Contact"];
const features = [
  {
    label: "SYSTEMS",
    title: "Operating layers that stay quiet",
    body: "Clean internal structures that reduce manual follow-up, duplicate work, and scattered information.",
  },
  {
    label: "AUTOMATION",
    title: "Workflows that move without drag",
    body: "Automations built around real business steps, approvals, handoffs, and customer-facing moments.",
  },
  {
    label: "INFRASTRUCTURE",
    title: "Data foundations for growth",
    body: "Practical databases, dashboards, and integrations that make the next decision easier to see.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#171321]">
      <nav className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 md:px-8">
        <a
          href="#"
          className="font-mono text-xs font-medium uppercase text-[#171321]"
          aria-label="YARA LABS home"
        >
          YARA LABS
        </a>

        <div className="hidden items-center gap-8 text-sm font-medium text-[#171321] sm:flex">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="transition-colors duration-200 hover:text-[#7C3AED]"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      <section className="px-4 pb-0 md:px-6">
        <div className="hero-surface relative mx-auto flex min-h-[675px] w-full max-w-[calc(100vw-48px)] items-start justify-center overflow-hidden rounded-[32px] px-6 pb-40 pt-32 md:px-12">
          <div className="hero-wash" aria-hidden="true" />

          <div className="relative z-10 flex w-full max-w-[1000px] flex-col items-center text-center">
            <p className="mb-6 font-mono text-xs font-normal uppercase text-[#74717A]">
              Systems <span className="mx-4 text-[#7C3AED]">•</span>{" "}
              Automation <span className="mx-4 text-[#7C3AED]">•</span>{" "}
              Infrastructure
            </p>

            <h1 className="max-w-[980px] text-[48px] font-bold leading-[50px] tracking-normal text-[#171321] md:text-[72px] md:leading-[76px]">
              Good systems should feel almost invisible.
            </h1>

            <p className="mt-6 max-w-[850px] text-[20px] font-normal leading-[25px] tracking-normal text-[#74717A] md:text-2xl md:leading-[27px]">
              Complexity is a natural part of growth. Strong systems make sure
              it never becomes the limit.
            </p>

            <form className="mt-6 flex w-full max-w-[620px] flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="hero-email">
                Email address
              </label>
              <input
                id="hero-email"
                type="email"
                placeholder="Enter your email"
                className="h-[52px] min-w-0 flex-1 rounded-lg border border-[#D1D0D3] bg-white/85 px-4 text-base leading-6 text-[#171321] outline-none transition duration-200 placeholder:text-[#A2A1A6] focus:border-[#8B5CF6] focus:ring-4 focus:ring-[#8B5CF6]/10"
              />
              <button
                type="submit"
                className="h-[52px] rounded-lg bg-[linear-gradient(100deg,#EC4899_0%,#8B5CF6_48%,#4D6BFF_100%)] px-6 text-base font-semibold leading-5 text-white transition duration-200 hover:translate-y-[-1px] hover:brightness-105"
              >
                Free Consult
              </button>
            </form>

            <a
              href="#work"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-lg px-5 text-base font-semibold leading-5 text-[#171321] transition duration-200 hover:translate-y-[-1px] hover:text-[#7C3AED]"
            >
              Explore Our Work
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-20 mx-auto grid w-full max-w-[1000px] gap-6 px-6 pb-24 md:-mt-40 md:grid-cols-3 md:px-0">
        {features.map((feature) => (
          <article
            className="rounded-2xl bg-[#171321] p-6 transition duration-200 hover:bg-[#312E3F]"
            key={feature.label}
          >
            <p className="font-mono text-xs leading-4 text-[#A2A1A6]">
              {feature.label}
            </p>
            <h2 className="mt-4 text-xl font-semibold leading-6 text-white">
              {feature.title}
            </h2>
            <p className="mt-2 text-sm leading-5 text-[#D1D0D3]">
              {feature.body}
            </p>
            <span className="mt-6 block h-1 w-8 rounded-full bg-[#8B5CF6]" />
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-40 pt-16 md:px-8">
        <div className="max-w-[680px]">
          <p className="font-mono text-xs leading-4 text-[#A2A1A6]">
            DESIGN LANGUAGE
          </p>
          <h2 className="mt-4 text-[40px] font-bold leading-[42px] tracking-normal text-[#171321] md:text-[60px] md:leading-[63px]">
            Built around systems, not spectacle.
          </h2>
          <p className="mt-6 text-base leading-6 text-[#74717A]">
            YARA LABS uses structured whitespace, restrained contrast, and
            practical interface patterns to make complex business operations
            easier to understand.
          </p>
        </div>
      </section>
    </main>
  );
}
