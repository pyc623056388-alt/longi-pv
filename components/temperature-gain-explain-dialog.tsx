"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import type { ModuleSpec } from "@/lib/pv-calculation";
import {
  DEFAULT_DELTA_T_C,
  REF_TEMP_C,
  temperatureGainBreakdown,
} from "@/lib/gain-algorithms";

interface TemperatureGainExplainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  longi: ModuleSpec;
  competitor: ModuleSpec;
}

function fmtPct(n: number, digits = 2): string {
  return `${n.toFixed(digits)}%`;
}

function Slide({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-4 min-h-[340px]">{children}</div>;
}

function ExampleBox({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      {children}
    </div>
  );
}

function ExampleCard({
  title,
  coef,
  highlight,
  children,
}: {
  title: string;
  coef: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-lg p-3 ${
        highlight
          ? "bg-[#E40011]/5 border border-[#E40011]/20"
          : "bg-slate-50 border border-slate-100"
      }`}
    >
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">γ = {coef}</p>
      <p className="text-xs text-slate-600 mt-1">{children}</p>
    </div>
  );
}

function SlideDots({ current, count }: { current: number; count: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current ? "w-6 bg-[#E40011]" : "w-2 bg-slate-300"
          }`}
        />
      ))}
    </div>
  );
}

export function TemperatureGainExplainDialog({
  open,
  onOpenChange,
  longi,
  competitor,
}: TemperatureGainExplainDialogProps) {
  const { m } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const slideCount = 2;

  const breakdown = temperatureGainBreakdown(longi, competitor);
  const longiLabel = longi.name || m.common.longiModule;
  const compLabel = competitor.name || m.common.competitorModule;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (open) {
      setCurrent(0);
      api?.scrollTo(0);
    }
  }, [open, api]);

  const scrollPrev = useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = useCallback(() => api?.scrollNext(), [api]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">温度系数增益 — 原理与计算</DialogTitle>
        </DialogHeader>

        <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
          <CarouselContent className="ml-0">
            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Pmp 温度系数是什么？
                </h3>
                <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
                  <li>
                    <span className="font-semibold text-slate-900">
                      标准测试条件（STC）：
                    </span>
                    辐照 1000 W/m²、电池温度 25°C、大气质量 AM 1.5。Datasheet
                    上的功率、电压、电流均在此条件下标定。
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">
                      Pmp 温度系数 γ：
                    </span>
                    单位为 %/°C，通常为负值。温度每升高 1°C，组件最大输出功率约下降
                    |γ|%。
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">实际运行：</span>
                    夏季组件工作温度常达 50°C 以上，远高于 STC 的
                    25°C，实际出力明显低于铭牌功率。
                  </li>
                </ul>
                <ExampleBox>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    典型对比示意
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <ExampleCard title="TOPCon 典型" coef="-0.29 %/°C">
                      温度越高，功率损失越快
                    </ExampleCard>
                    <ExampleCard title="BC 典型" coef="-0.26 %/°C" highlight>
                      相同温升下损失更小
                    </ExampleCard>
                  </div>
                </ExampleBox>
                <p className="text-xs text-slate-400 mt-4">
                  本策略仅使用 Pmax 温度系数；Voc、Isc 温度系数不参与增益计算。
                </p>
              </Slide>
            </CarouselItem>

            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  如何定量计算增益？
                </h3>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4 font-mono text-sm text-slate-800 space-y-2">
                  <p>损失率 = |γ| × ΔT</p>
                  <p className="font-semibold text-[#E40011]">
                    增益 = (|γ<sub>竞品</sub>| − |γ<sub>隆基</sub>|) × ΔT
                  </p>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  ΔT = 组件工作温度 − {REF_TEMP_C}°C。当前取 ΔT ={" "}
                  <span className="font-semibold">{DEFAULT_DELTA_T_C}°C</span>
                  （对应 T<sub>cell</sub> ≈ {REF_TEMP_C + DEFAULT_DELTA_T_C}
                  °C；后续可接入项目气象数据自动推算）。
                </p>

                <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b bg-slate-50">
                        <td className="px-4 py-2 text-slate-500">参数</td>
                        <td className="px-4 py-2 font-medium">{longiLabel}</td>
                        <td className="px-4 py-2 font-medium">{compLabel}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2 text-slate-500">Pmp 温度系数 γ</td>
                        <td className="px-4 py-2">
                          −{breakdown.gammaLongiPct.toFixed(2)} %/°C
                        </td>
                        <td className="px-4 py-2">
                          −{breakdown.gammaCompPct.toFixed(2)} %/°C
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2 text-slate-500">
                          发电损失（|γ| × {breakdown.deltaT}°C）
                        </td>
                        <td className="px-4 py-2">{fmtPct(breakdown.longiLossPct)}</td>
                        <td className="px-4 py-2">{fmtPct(breakdown.compLossPct)}</td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td className="px-4 py-2 font-semibold text-emerald-800">
                          隆基相对增益
                        </td>
                        <td colSpan={2} className="px-4 py-2 font-bold text-emerald-700">
                          +{fmtPct(breakdown.gainPct, 1)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-xs text-slate-400 mt-4">
                  计算采用简单差值公式；未启用倾斜支架 −0.5°C 工作温差修正。
                </p>
              </Slide>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={scrollPrev}
            disabled={current === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {m.common.prevPage}
          </Button>

          <SlideDots current={current} count={slideCount} />

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 tabular-nums">
              {current + 1} / {slideCount}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={scrollNext}
              disabled={current === slideCount - 1}
            >
              {m.common.nextPage}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
