"use client";

import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { AntiShadingExplainDialog } from "@/components/anti-shading-explain-dialog";
import { LowLightGainExplainDialog } from "@/components/low-light-gain-explain-dialog";
import { useI18n } from "@/components/locale-provider";
import { TemperatureGainExplainDialog } from "@/components/temperature-gain-explain-dialog";
import type { ModuleSpec } from "@/lib/pv-calculation";
import { strategyGainPct } from "@/lib/gain-algorithms";
import type { AntiShadingScenario, GainStrategies } from "@/lib/pv-types";

function formatGainPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

interface GainStrategyPanelProps {
  strategies: GainStrategies;
  onChange: (s: GainStrategies) => void;
  longi: ModuleSpec;
  competitor: ModuleSpec;
}

export function GainStrategyPanel({
  strategies,
  onChange,
  longi,
  competitor,
}: GainStrategyPanelProps) {
  const { m } = useI18n();
  const [tempExplainOpen, setTempExplainOpen] = useState(false);
  const [antiShadingExplainOpen, setAntiShadingExplainOpen] = useState(false);
  const [lowLightExplainOpen, setLowLightExplainOpen] = useState(false);

  const antiScenario = strategies.antiShading.scenario;

  const cards = useMemo(
    () => [
      { key: "temperature" as const, ...m.gain.cards.temperature },
      { key: "antiShading" as const, ...m.gain.cards.antiShading },
      { key: "lowLight" as const, ...m.gain.cards.lowLight },
    ],
    [m]
  );

  const handleAntiShadingScenarioChange = (scenario: AntiShadingScenario) => {
    onChange({
      ...strategies,
      antiShading: { ...strategies.antiShading, scenario },
    });
  };

  return (
    <>
      <div className="mb-12">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{m.gain.title}</h3>
        <p className="text-sm text-slate-500 mb-6">{m.gain.subtitle}</p>
        <div className="grid md:grid-cols-3 gap-4">
          {cards.map((card) => {
            const state = strategies[card.key];
            const isAntiShading = card.key === "antiShading";
            const subtitle =
              isAntiShading && state.enabled
                ? `${m.gain.scenarios[antiScenario]} · ${formatGainPct(
                    strategyGainPct(card.key, longi, competitor, strategies)
                  )}`
                : state.enabled
                  ? `${m.gain.gainLabel} ${formatGainPct(
                      strategyGainPct(card.key, longi, competitor, strategies)
                    )}`
                  : null;

            return (
              <div
                key={card.key}
                className={`relative rounded-2xl border p-5 transition-all ${
                  state.enabled
                    ? "border-[#E40011]/40 bg-[#E40011]/5 shadow-md"
                    : "border-slate-200 bg-white"
                }`}
              >
                {card.key === "temperature" ? (
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={m.gain.explainAria.temperature}
                    onClick={() => setTempExplainOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : isAntiShading ? (
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={m.gain.explainAria.antiShading}
                    onClick={() => setAntiShadingExplainOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : card.key === "lowLight" ? (
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    aria-label={m.gain.explainAria.lowLight}
                    onClick={() => setLowLightExplainOpen(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                ) : null}

                <div className="flex items-start gap-3 pr-8">
                  <Checkbox
                    id={card.key}
                    checked={state.enabled}
                    onCheckedChange={(checked) =>
                      onChange({
                        ...strategies,
                        [card.key]: { ...state, enabled: checked === true },
                      })
                    }
                  />
                  <label htmlFor={card.key} className="cursor-pointer">
                    <span className="font-semibold text-slate-900 block">
                      {card.title}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      {state.enabled ? m.gain.enabled : m.gain.disabled}
                    </span>
                    {isAntiShading && (
                      <span className="text-xs text-slate-500 mt-0.5 block">
                        {m.gain.scenario}：{m.gain.scenarios[antiScenario]}
                      </span>
                    )}
                    {subtitle && (
                      <span className="text-xs text-emerald-600 font-medium mt-1 block">
                        {isAntiShading ? `${m.gain.counted} ` : ""}
                        {subtitle}
                      </span>
                    )}
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TemperatureGainExplainDialog
        open={tempExplainOpen}
        onOpenChange={setTempExplainOpen}
        longi={longi}
        competitor={competitor}
      />

      <AntiShadingExplainDialog
        open={antiShadingExplainOpen}
        onOpenChange={setAntiShadingExplainOpen}
        scenario={antiScenario}
        onScenarioChange={handleAntiShadingScenarioChange}
      />

      <LowLightGainExplainDialog
        open={lowLightExplainOpen}
        onOpenChange={setLowLightExplainOpen}
        longi={longi}
        competitor={competitor}
        ruleId={strategies.lowLight.ruleId}
      />
    </>
  );
}
