"use client";

import { Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ModuleSpec } from "@/lib/pv-calculation";
import { strategyGainPct } from "@/lib/gain-algorithms";
import type { GainStrategies } from "@/lib/pv-types";

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

const cards = [
  {
    key: "temperature" as const,
    title: "温度系数增益",
    description: "基于两侧 Pmp 温度系数与平均工况估算发电差异。",
  },
  {
    key: "antiShading" as const,
    title: "抗遮挡增益",
    description: "标准规则：对比列额外 +1.2% 发电（占位，可后续接入详细规则）。",
  },
  {
    key: "lowLight" as const,
    title: "弱光增益",
    description: "标准规则：对比列额外 +0.8% 发电（占位，可后续接入详细规则）。",
  },
];

export function GainStrategyPanel({
  strategies,
  onChange,
  longi,
  competitor,
}: GainStrategyPanelProps) {
  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold text-slate-900 mb-2">发电增益策略</h3>
      <p className="text-sm text-slate-500 mb-6">勾选后参与最终发电量与收益计算。</p>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const state = strategies[card.key];
          return (
            <div
              key={card.key}
              className={`relative rounded-2xl border p-5 transition-all ${
                state.enabled
                  ? "border-[#E40011]/40 bg-[#E40011]/5 shadow-md"
                  : "border-slate-200 bg-white"
              }`}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                    aria-label="规则设置"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <p className="text-sm font-semibold mb-1">当前规则：标准</p>
                  <p className="text-xs text-slate-500 mb-2">{card.description}</p>
                  <p className="text-xs text-slate-400 italic">
                    规则内容待接入（占位）
                  </p>
                </PopoverContent>
              </Popover>

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
                  <span className="font-semibold text-slate-900 block">{card.title}</span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {state.enabled ? "已参与计算" : "未参与计算"}
                  </span>
                  {state.enabled && (
                    <span className="text-xs text-emerald-600 font-medium mt-1 block">
                      发电量增益{" "}
                      {formatGainPct(
                        strategyGainPct(card.key, longi, competitor, strategies)
                      )}
                    </span>
                  )}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
