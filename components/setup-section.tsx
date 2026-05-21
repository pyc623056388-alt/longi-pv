"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { BasicParamsPanel } from "@/components/basic-params-panel";
import { getWeatherById } from "@/lib/data-store";
import type { BasicParams, CurrencyCode, WeatherRecord } from "@/lib/pv-types";
import { estimateYearlyHoursFromWeather } from "@/lib/weather-utils";

interface SetupSectionProps {
  projectName: string;
  setProjectName: (v: string) => void;
  selectedWeather: string;
  setSelectedWeather: (v: string) => void;
  comparisonMode: "sameCount" | "fixedCapacity";
  setComparisonMode: (v: "sameCount" | "fixedCapacity") => void;
  moduleCount: string;
  setModuleCount: (v: string) => void;
  basicParams: BasicParams;
  setBasicParams: React.Dispatch<React.SetStateAction<BasicParams>>;
  weatherList: WeatherRecord[];
  hoursManualOverride: boolean;
  setHoursManualOverride: (v: boolean) => void;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export function SetupSection({
  projectName,
  setProjectName,
  selectedWeather,
  setSelectedWeather,
  comparisonMode,
  setComparisonMode,
  moduleCount,
  setModuleCount,
  basicParams,
  setBasicParams,
  weatherList,
  hoursManualOverride,
  setHoursManualOverride,
  onCurrencyChange,
}: SetupSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [100, 0, 0, -100]);

  const selectedWeatherData =
    weatherList.find((w) => w.id === selectedWeather) ??
    (selectedWeather ? getWeatherById(selectedWeather) : undefined);

  useEffect(() => {
    if (!selectedWeather || hoursManualOverride) return;
    const wx = weatherList.find((w) => w.id === selectedWeather);
    if (!wx) return;
    const hours = estimateYearlyHoursFromWeather(wx);
    setBasicParams((prev) => ({ ...prev, yearlyEquivalentHours: hours }));
  }, [selectedWeather, weatherList, hoursManualOverride, setBasicParams]);

  return (
    <motion.section
      ref={ref}
      style={{ opacity, y }}
      className="min-h-screen flex items-center py-32 bg-gradient-to-b from-slate-50 to-white"
    >
      <div className="max-w-5xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E40011]/10 text-[#E40011] text-sm font-semibold mb-4">
            第一步
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            项目初始化
          </h2>
          <p className="text-lg text-slate-500">配置您的项目信息与测算模式</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">项目名称</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="输入项目名称..."
              className="w-full px-6 py-4 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-lg focus:outline-none focus:ring-2 focus:ring-[#E40011]/30"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">气象站选择</label>
            <select
              value={selectedWeather}
              onChange={(e) => {
                setSelectedWeather(e.target.value);
                setHoursManualOverride(false);
              }}
              className="w-full px-6 py-4 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-lg focus:outline-none focus:ring-2 focus:ring-[#E40011]/30 cursor-pointer"
            >
              <option value="">选择气象站...</option>
              {weatherList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            {selectedWeatherData && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-[#E40011]" />
                <span>
                  {selectedWeatherData.location}
                  {selectedWeatherData.lat != null &&
                    ` · ${selectedWeatherData.lat}°N, ${selectedWeatherData.lon}°E`}
                </span>
              </div>
            )}
          </div>
        </div>

        <BasicParamsPanel
          params={basicParams}
          onChange={(p) => {
            setBasicParams(p);
            setHoursManualOverride(true);
          }}
          onCurrencyChange={onCurrencyChange}
          hoursAutoHint={!hoursManualOverride && !!selectedWeather}
        />

        <div className="mb-12 mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">选择对比模式</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { id: "sameCount" as const, title: "同片数对比", desc: "以相同组件数量对比发电效率" },
              {
                id: "fixedCapacity" as const,
                title: "固定装机量对比",
                desc: "以相同装机容量对比系统成本",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setComparisonMode(mode.id)}
                className={`relative p-8 rounded-3xl text-left transition-all ${
                  comparisonMode === mode.id
                    ? "bg-white shadow-2xl ring-2 ring-[#E40011]"
                    : "bg-white/50 shadow-lg hover:shadow-xl"
                }`}
              >
                {comparisonMode === mode.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#E40011] flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <h4
                  className={`text-xl font-bold mb-2 ${
                    comparisonMode === mode.id ? "text-[#E40011]" : "text-slate-900"
                  }`}
                >
                  {mode.title}
                </h4>
                <p className="text-sm text-slate-500">{mode.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center">
          <label className="text-sm font-semibold text-slate-700 mb-4">
            {comparisonMode === "sameCount" ? "组件数量" : "装机容量 (kW)"}
          </label>
          <div className="relative">
            <input
              type="text"
              value={moduleCount}
              onChange={(e) => setModuleCount(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-64 text-center text-6xl font-extrabold text-slate-900 bg-transparent border-0 border-b-4 border-slate-200 focus:border-[#E40011] focus:outline-none pb-2"
            />
            <span className="absolute -right-16 bottom-4 text-xl text-slate-400">
              {comparisonMode === "sameCount" ? "片" : "kW"}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
