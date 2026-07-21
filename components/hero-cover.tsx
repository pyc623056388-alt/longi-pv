"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ChevronDown,
  Database,
  Thermometer,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CurrencySwitcher } from "@/components/currency-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteToolNav } from "@/components/site-tool-nav";
import { useI18n } from "@/components/locale-provider";
import type { AppLocale } from "@/lib/i18n";
import type { CurrencyCode } from "@/lib/pv-types";

interface HeroCoverProps {
  onOpenDatabase: () => void;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  locale: AppLocale;
  onLocaleChange: (locale: AppLocale) => void;
}

export function HeroCover({
  onOpenDatabase,
  currency,
  onCurrencyChange,
  locale,
  onLocaleChange,
}: HeroCoverProps) {
  const { m } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const advantages = useMemo(
    () => [
      {
        id: "temperature",
        icon: Thermometer,
        title: m.hero.advantages.temperature.title,
        description: m.hero.advantages.temperature.description,
        image: "/hero/advantage-temperature.png",
        alt: m.hero.advantages.temperature.alt,
        imageObjectPosition: "center 18%",
        imageScale: 1.08,
      },
      {
        id: "anti-shading",
        icon: Shield,
        title: m.hero.advantages.antiShading.title,
        description: m.hero.advantages.antiShading.description,
        image: "/hero/advantage-anti-shading.png",
        alt: m.hero.advantages.antiShading.alt,
        imageObjectPosition: "center 20%",
        imageScale: 1.08,
      },
      {
        id: "low-light",
        icon: Zap,
        title: m.hero.advantages.lowLight.title,
        description: m.hero.advantages.lowLight.description,
        image: "/hero/advantage-low-light.png",
        alt: m.hero.advantages.lowLight.alt,
      },
    ],
    [m]
  );

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y, scale }}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
    >
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-[#E40011]/20 via-[#E40011]/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#E40011]/10 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="absolute top-6 left-6 z-20 flex flex-wrap items-center gap-3">
        <Image
          src="/longi-logo.svg"
          alt="LONGi"
          width={86}
          height={40}
          priority
          className="h-8 w-auto md:h-10"
        />
        <SiteToolNav />
      </div>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <CurrencySwitcher
          currency={currency}
          onCurrencyChange={onCurrencyChange}
          variant="hero"
        />
        <LanguageSwitcher
          locale={locale}
          onLocaleChange={onLocaleChange}
          variant="hero"
        />
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
          onClick={onOpenDatabase}
        >
          <Database className="w-4 h-4 mr-2" />
          {m.common.database}
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-[min(96rem,94vw)] mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4"
        >
          <span className="block">{m.hero.titleLine1}</span>
          <span className="block bg-gradient-to-r from-[#E40011] via-[#ff4d5a] to-[#ff8080] bg-clip-text text-transparent">
            {m.hero.titleLine2}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {m.hero.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16"
        >
          {advantages.map((item, idx) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-5 hover:bg-white/10 transition-all"
            >
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-white/5 border border-white/10">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority={idx === 0}
                  className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
                  style={{
                    objectPosition: item.imageObjectPosition ?? "center",
                    transform: item.imageScale
                      ? `scale(${item.imageScale})`
                      : undefined,
                  }}
                />
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E40011] to-[#ff4d5a] flex items-center justify-center mb-3">
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/40">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-sm text-white/40">{m.hero.scrollHint}</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6 text-white/40" />
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
