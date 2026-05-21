"use client";

import { useRef } from "react";
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
import {
  LanguageSwitcher,
  type AppLocale,
} from "@/components/language-switcher";
import type { CurrencyCode } from "@/lib/pv-types";

const advantages = [
  {
    icon: Thermometer,
    title: "温度系数",
    description: "高温工况下功率输出更稳定，衰减更可控",
    image: "/placeholders/advantage-1.svg",
  },
  {
    icon: Shield,
    title: "强大的抗阴影遮挡能力",
    description: "局部遮挡场景下仍能保持较高发电效率",
    image: "/placeholders/advantage-2.svg",
  },
  {
    icon: Zap,
    title: "弱光发电能力",
    description: "清晨、傍晚及多云条件下发电表现更优",
    image: "/placeholders/advantage-3.svg",
  },
];

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
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

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

      <div className="absolute top-6 left-6 z-20">
        <Image
          src="/longi-logo.svg"
          alt="LONGi"
          width={86}
          height={40}
          priority
          className="h-8 w-auto md:h-10"
        />
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
          数据库
        </Button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center pt-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6"
        >
          <span className="block">隆基智能光伏</span>
          <span className="block bg-gradient-to-r from-[#E40011] via-[#ff4d5a] to-[#ff8080] bg-clip-text text-transparent">
            全生命周期增益测算
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed"
        >
          基于实际项目参数与气象数据的 ROI 评估
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {advantages.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03, y: -5 }}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-white/5 border border-white/10">
                <Image
                  src={item.image}
                  alt={`${item.title}（待替换）`}
                  fill
                  className="object-cover opacity-60"
                />
                <span className="absolute bottom-2 right-2 text-[10px] text-white/40 bg-black/40 px-2 py-0.5 rounded">
                  图片占位
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E40011] to-[#ff4d5a] flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-white" />
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
          <span className="text-sm text-white/40">向下滚动开始测算</span>
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
