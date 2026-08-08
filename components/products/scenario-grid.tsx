"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import {
  listVisibleScenarios,
  scenarioProductCount,
  type ProductScenario,
} from "@/lib/product-scenario-catalog";
import { cn } from "@/lib/utils";

function ScenarioCard({
  scenario,
  featured,
  index,
}: {
  scenario: ProductScenario;
  featured: boolean;
  index: number;
}) {
  const { locale, m } = useI18n();
  const name = locale === "zh" ? scenario.nameZh : scenario.nameEn;
  const tagline = locale === "zh" ? scenario.taglineZh : scenario.taglineEn;
  const count = scenarioProductCount(scenario);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={featured ? "sm:col-span-2 lg:col-span-3" : ""}
    >
      <Link
        href={`/products/${scenario.id}`}
        className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow-sm ring-1 ring-slate-200/80 transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-slate-800",
            featured ? "aspect-[16/9] sm:aspect-[21/9]" : "aspect-[4/3]"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={scenario.tileImage}
            alt={name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div
            className={cn(
              "absolute inset-x-0 bottom-0",
              featured ? "p-5 sm:p-7" : "p-4"
            )}
          >
            <span className="mb-1.5 inline-flex items-center rounded-md border border-white/25 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/85">
              {m.products.productCount(count)}
            </span>
            <h2
              className={cn(
                "font-extrabold leading-snug text-white",
                featured ? "text-2xl sm:text-4xl" : "text-lg sm:text-xl"
              )}
            >
              {name}
            </h2>
            <p
              className={cn(
                "mt-1 text-white/80",
                featured
                  ? "max-w-xl text-sm sm:text-base"
                  : "line-clamp-2 text-xs"
              )}
            >
              {tagline}
            </p>
            {featured && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#E40011] px-3.5 py-1.5 text-sm font-semibold text-white transition group-hover:bg-[#C4000F]">
                {m.products.viewDetail}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ScenarioGrid() {
  const { m } = useI18n();
  const scenarios = listVisibleScenarios();
  const featured = scenarios.find((s) => s.featured);
  const rest = scenarios.filter((s) => !s.featured);

  return (
    <section className="bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
        <h2 className="mb-5 text-lg font-bold text-slate-900">
          {m.products.scenariosTitle}
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured && (
            <ScenarioCard scenario={featured} featured index={0} />
          )}
          {rest.map((scenario, i) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              featured={false}
              index={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
