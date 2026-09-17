import Link from "next/link";
import { Jellyfish } from "@/components/jellyfish/Jellyfish";
import { JellyfishNamePill } from "@/components/jellyfish/JellyfishNamePill";
import { Masthead, Tag } from "@/components/ui/Chrome";

const SECTIONS = [
  {
    index: "01",
    href: "/plan",
    title: "Plan My Day",
    deck: "Tasks in, deadlines weighed, hours painted. Out comes a schedule you can argue with.",
    meta: "Planner",
    ready: true,
  },
  {
    index: "02",
    href: "/boost",
    title: "Boost My Day",
    deck: "Reads how loaded you actually are, then hands you something short enough to finish.",
    meta: "Recovery",
    ready: true,
  },
  {
    index: "03",
    href: "/record",
    title: "Record My Day",
    deck: "Write it yourself, or talk it through and let the conversation become the entry.",
    meta: "Journal",
    ready: true,
  },
];

export default function Home() {
  return (
    <>
      <Masthead right={<JellyfishNamePill />} bordered={false} />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-5 sm:px-8">
        {/* Asymmetric masthead block — type left, plate right. */}
        <section className="grid grid-cols-1 gap-10 py-14 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="lg:col-span-7">
            <p className="label">Anchor: a day, handled</p>
            <h1 className="display mt-5 text-[clamp(3.25rem,9vw,5.75rem)] text-ink">
              Ready to
              <br />
              Sail?
            </h1>
          </div>

          <div className="flex items-end justify-start lg:col-span-5 lg:justify-end">
            <Jellyfish size={168} mood="idle" className="text-ink" />
          </div>
        </section>

        {/* Index — rows on rules, not a card grid. */}
        <section className="py-4">
          <ul className="border-t border-rule">
            {SECTIONS.map((s) => (
              <li key={s.href} className="border-b border-rule">
                <Link
                  href={s.href}
                  className="group grid grid-cols-12 items-baseline gap-4 py-7 transition-colors hover:bg-paper-2 sm:py-8"
                >
                  <span className="label col-span-2 sm:col-span-1">
                    {s.index}
                  </span>

                  <div className="col-span-10 sm:col-span-4">
                    <h2 className="display text-[28px] text-ink transition-colors group-hover:text-accent sm:text-[32px]">
                      {s.title}
                    </h2>
                  </div>

                  <p className="col-span-12 max-w-lg text-[15px] leading-relaxed text-ink-2 sm:col-span-5 sm:col-start-6">
                    {s.deck}
                  </p>

                  <div className="col-span-12 flex items-center gap-3 sm:col-span-2 sm:justify-end">
                    <Tag>{s.meta}</Tag>
                    <span
                      aria-hidden="true"
                      className="text-ink-3 transition-all group-hover:translate-x-1 group-hover:text-accent"
                    >
                      →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
