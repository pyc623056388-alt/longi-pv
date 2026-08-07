"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { CaseFilterBar } from "@/components/cases/case-filter-bar";
import { useI18n } from "@/components/locale-provider";
import {
  caseCoverSrc,
  emptyCaseFilters,
  filterCaseStudies,
  getCaseFilterOptions,
  listCaseStudies,
  type CaseFilters,
  type CaseStudy,
} from "@/lib/case-catalog";

function cardTags(item: CaseStudy, labels: {
  sector: Record<CaseStudy["sector"], string>;
  scale: Record<CaseStudy["scale"], string>;
}): string[] {
  const tags = [labels.sector[item.sector]];
  if (item.scale !== "unspecified") {
    tags.push(labels.scale[item.scale]);
  }
  return tags.slice(0, 2);
}

export function CaseList() {
  const { locale, m } = useI18n();
  const allCases = useMemo(() => listCaseStudies(), []);
  const options = useMemo(() => getCaseFilterOptions(allCases), [allCases]);
  const [filters, setFilters] = useState<CaseFilters>(() => emptyCaseFilters());

  const filtered = useMemo(
    () => filterCaseStudies(allCases, filters),
    [allCases, filters]
  );

  if (allCases.length === 0) {
    return (
      <section className="bg-slate-50 px-5 py-20 sm:px-6">
        <p className="mx-auto max-w-6xl text-center text-slate-500">
          {m.cases.empty}
        </p>
      </section>
    );
  }

  return (
    <section className="bg-slate-50">
      <CaseFilterBar
        filters={filters}
        options={options}
        shownCount={filtered.length}
        totalCount={allCases.length}
        onChange={setFilters}
        onClear={() => setFilters(emptyCaseFilters())}
      />

      {filtered.length === 0 ? (
        <div className="px-5 py-16 sm:px-6">
          <p className="mx-auto max-w-6xl text-center text-slate-500">
            {m.cases.noMatch}
          </p>
        </div>
      ) : (
        <div className="px-5 py-10 sm:px-6 sm:py-12">
          <div className="mx-auto grid w-full max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item, index) => {
              const title = locale === "zh" ? item.titleZh : item.titleEn;
              const location =
                locale === "zh" ? item.locationZh : item.locationEn;
              const cover = caseCoverSrc(item);
              const tags = cardTags(item, m.cases.labels);

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
                        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/85"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-white/75">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{location}</span>
                        </p>
                        <h2 className="text-base font-bold leading-snug text-white sm:text-lg">
                          {title}
                        </h2>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
