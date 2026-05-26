"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import {
  BasicParamsPanel,
  type EpcHelperContext,
} from "@/components/basic-params-panel";
import { useI18n } from "@/components/locale-provider";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { getWeatherById } from "@/lib/data-store";
import type { BasicParams, CurrencyCode, WeatherRecord } from "@/lib/pv-types";
import { getWeatherLocation, getWeatherName } from "@/lib/weather-display";
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
  epcHelper?: EpcHelperContext;
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
  epcHelper,
}: SetupSectionProps) {
  const { m, locale } = useI18n();
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

  const comparisonModes = [
    {
      id: "sameCount" as const,
      title: m.setup.modes.sameCount.title,
      desc: m.setup.modes.sameCount.desc,
    },
    {
      id: "fixedCapacity" as const,
      title: m.setup.modes.fixedCapacity.title,
      desc: m.setup.modes.fixedCapacity.desc,
    },
  ];

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
            {m.setup.stepBadge}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            {m.setup.title}
          </h2>
          <p className="text-lg text-slate-500">{m.setup.subtitle}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              {m.setup.projectName}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={m.setup.projectNamePlaceholder}
              className="w-full px-6 py-4 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-lg focus:outline-none focus:ring-2 focus:ring-[#E40011]/30"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              {m.setup.weather}
            </label>
            <SearchableSelect
              value={selectedWeather}
              onValueChange={(id) => {
                setSelectedWeather(id);
                setHoursManualOverride(false);
              }}
              placeholder={m.setup.weatherPlaceholder}
              searchPlaceholder={m.setup.weatherSearch}
              triggerClassName="w-full h-auto px-6 py-4 bg-white/80 rounded-2xl shadow-lg shadow-slate-200/50 text-lg border-0 hover:bg-white/80"
              options={[
                { value: "", label: m.setup.weatherPlaceholder },
                ...weatherList.map((w) => ({
                  value: w.id,
                  label: getWeatherName(w, locale),
                  keywords: [
                    w.name,
                    w.nameZh,
                    w.nameEn,
                    w.location,
                    w.locationZh,
                    w.locationEn,
                  ]
                    .filter(Boolean)
                    .join(" "),
                })),
              ]}
            />
            {selectedWeatherData && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <MapPin className="w-4 h-4 text-[#E40011]" />
                <span>
                  {getWeatherLocation(selectedWeatherData, locale)}
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
          epcHelper={epcHelper}
        />

        <div className="mb-12 mt-8">
          <h3 className="text-lg font-bold text-slate-900 mb-6 text-center">
            {m.setup.comparisonModeTitle}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {comparisonModes.map((mode) => (
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
            {comparisonMode === "sameCount"
              ? m.setup.moduleCountLabel
              : m.setup.capacityLabel}
          </label>
          <div className="relative">
            <input
              type="text"
              value={moduleCount}
              onChange={(e) => setModuleCount(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-64 text-center text-6xl font-extrabold text-slate-900 bg-transparent border-0 border-b-4 border-slate-200 focus:border-[#E40011] focus:outline-none pb-2"
            />
            <span className="absolute -right-16 bottom-4 text-xl text-slate-400">
              {comparisonMode === "sameCount" ? m.common.panelUnit : "kW"}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
