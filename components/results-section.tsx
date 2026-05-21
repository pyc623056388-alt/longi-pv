"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { GainStrategyPanel } from "@/components/gain-strategy-panel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ModuleSpec, PvComparisonResult } from "@/lib/pv-calculation";
import type { GainStrategies } from "@/lib/pv-types";
import { CURRENCY_SYMBOLS, type CurrencyCode } from "@/lib/pv-types";

interface ResultsSectionProps {
  results: PvComparisonResult;
  gainStrategies: GainStrategies;
  onGainStrategiesChange: (s: GainStrategies) => void;
  longi: ModuleSpec;
  competitor: ModuleSpec;
  currency: CurrencyCode;
  onReset: () => void;
}

function useAnimatedCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!hasStarted) return;
    let startTime: number;
    let frame: number;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration, hasStarted]);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setHasStarted(true),
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return { count, ref };
}

export function ResultsSection({
  results,
  gainStrategies,
  onGainStrategiesChange,
  longi,
  competitor,
  currency,
  onReset,
}: ResultsSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  const sym = CURRENCY_SYMBOLS[currency];
  const gainDisplay =
    results.yieldGainPct >= 0
      ? `+${results.yieldGainPct}`
      : `${results.yieldGainPct}`;

  const chartData = results.chartData;
  const yieldCounter = useAnimatedCounter(Math.round(results.longiYieldMwh));

  return (
    <motion.section
      ref={ref}
      style={{ opacity }}
      className="min-h-screen py-32 bg-gradient-to-b from-white to-slate-50"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold mb-4">
            测算结果
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            计算结果（简化平均模型）
          </h2>
          <p className="text-slate-500">
            币种：{currency} · 全寿命发电量与收益对比
          </p>
        </div>

        <GainStrategyPanel
          strategies={gainStrategies}
          onChange={onGainStrategiesChange}
          longi={longi}
          competitor={competitor}
        />

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "预期发电量 (MWh)", key: "yield" as const },
            { title: `项目总成本 (${sym})`, key: "cost" as const },
            { title: "回收期 (年)", key: "payback" as const },
          ].map((chart, idx) => (
            <div
              key={chart.key}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-4">{chart.title}</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" barSize={24}>
                    <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={48}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey={chart.key} radius={12}>
                      <Cell fill="#E40011" />
                      <Cell fill="#cbd5e1" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-10">
          <span
            ref={yieldCounter.ref}
            className="text-6xl font-black text-emerald-500 tabular-nums"
          >
            {gainDisplay}
          </span>
          <span className="text-2xl font-bold text-emerald-500 ml-1">%</span>
          <p className="text-lg text-slate-600 mt-2">隆基相对竞品发电量提升</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden mb-12">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>指标</TableHead>
                <TableHead>{results.longiLabel}</TableHead>
                <TableHead>{results.compLabel}</TableHead>
                <TableHead>比对量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.rows.map((row) => (
                <TableRow key={row.metric}>
                  <TableCell className="font-medium">{row.metric}</TableCell>
                  <TableCell>{row.longi}</TableCell>
                  <TableCell>{row.competitor}</TableCell>
                  <TableCell
                    className={
                      row.delta.startsWith("+")
                        ? "text-emerald-600 font-medium"
                        : row.delta.startsWith("-")
                          ? "text-rose-600 font-medium"
                          : ""
                    }
                  >
                    {row.delta}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            className="px-8 py-4 font-semibold bg-gradient-to-r from-[#E40011] to-[#ff4d5a] text-white rounded-2xl shadow-lg flex items-center gap-2 opacity-60 cursor-not-allowed"
            title="待实现"
          >
            <Download className="w-5 h-5" />
            导出 HTML 报告
          </button>
          <button
            type="button"
            className="px-8 py-4 font-semibold bg-white text-slate-700 rounded-2xl shadow-lg flex items-center gap-2 border opacity-60 cursor-not-allowed"
            title="待实现"
          >
            <FileSpreadsheet className="w-5 h-5" />
            导出 Excel
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-8 py-4 font-semibold bg-white text-[#E40011] rounded-2xl shadow-lg flex items-center gap-2 border border-[#E40011]/30"
          >
            <RotateCcw className="w-5 h-5" />
            重新测算
          </button>
        </div>
      </div>
    </motion.section>
  );
}
