"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import {
  caseCoverSrc,
  caseLinkedSeries,
  listCaseStudies,
} from "@/lib/case-catalog";

export function CaseList() {
  const { locale, m } = useI18n();
  const cases = listCaseStudies();

  if (cases.length === 0) {
    return (
      <section className="bg-slate-50 px-5 py-20 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-slate-500">
          {m.cases.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 px-5 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((item, index) => {
          const title = locale === "zh" ? item.titleZh : item.titleEn;
          const location =
            locale === "zh" ? item.locationZh : item.locationEn;
          const cover = caseCoverSrc(item);
          const series = caseLinkedSeries(item);

          return (
            <motion.div
              key={item.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
            >
              <Link
                href={`/cases/${item.slug}`}
                className="group block overflow-hidden rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">
                      {m.cases.media.coverPending}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-white/75">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{location}</span>
                    </p>
                    <h2 className="text-base font-bold leading-snug text-white sm:text-lg">
                      {title}
                    </h2>
                    {series.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {series.map((s) => (
                          <span
                            key={s.id}
                            className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm"
                          >
                            {s.modelFamily}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
