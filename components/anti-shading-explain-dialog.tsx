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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/components/locale-provider";
import {
  ANTI_SHADING_PCT,
  antiShadingGainBreakdown,
} from "@/lib/gain-algorithms";
import type { AntiShadingScenario } from "@/lib/pv-types";

interface AntiShadingExplainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scenario: AntiShadingScenario;
  onScenarioChange: (scenario: AntiShadingScenario) => void;
}

export function useAntiShadingScenarioLabels(): Record<
  AntiShadingScenario,
  string
> {
  const { m } = useI18n();
  return m.gain.scenarios;
}

function fmtPct(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

function Slide({ children }: { children: ReactNode }) {
  return <div className="px-6 pb-4 min-h-[360px]">{children}</div>;
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

function PrincipleContent({ scenario }: { scenario: AntiShadingScenario }) {
  if (scenario === "residential") {
    return (
      <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
        <li>
          <span className="font-semibold text-slate-900">典型遮挡：</span>
          烟囱、女儿墙、树木、空调外机、鸽粪/落叶等
          <strong>小面积、位置随机</strong>
          的遮挡；前后排间距不足时，少量阴影也可能造成较大发电损失。
        </li>
        <li>
          <span className="font-semibold text-slate-900">串联失配与热斑：</span>
          组串电流由最弱电池决定。被遮电池反向偏置后易形成热斑，整串功率骤降。
        </li>
        <li>
          <span className="font-semibold text-slate-900">旁路二极管：</span>
          导通时往往旁路<strong>整段子串</strong>（非单片）。遮挡越重、启动的二极管越多，组件有效输出越低。同等阴影下，组件
          <strong>横排</strong>通常比纵排损失更小（仅 1/3 子串受影响）。
        </li>
        <li>
          <span className="font-semibold text-slate-900">BC 组件价值点：</span>
          无正面主栅自遮；软击穿等机制可
          <strong>延缓</strong>子串旁路二极管启动，在轻度、单片级遮挡下减少功率「悬崖式」下跌。大面积、多片同串遮挡时，与 TOPCon 差异会收敛。
        </li>
      </ul>
    );
  }

  return (
    <ul className="space-y-3 text-sm text-slate-700 leading-relaxed">
      <li>
        <span className="font-semibold text-slate-900">典型遮挡：</span>
        阵列前后排互遮（冬至 9:00～15:00）、女儿墙/机房、地面电站
        <strong>行间距</strong>
        不足等。工程上应优先按 GB 50797 等规范
        <strong>从设计阶段避免遮挡</strong>，而非依赖组件「救场」。
      </li>
      <li>
        <span className="font-semibold text-slate-900">系统特征：</span>
        容量大、组串长，集中式或大功率组串式逆变器常见。设计阶段常用 PVsyst 等做阴影仿真。
      </li>
      <li>
        <span className="font-semibold text-slate-900">MPPT 与局部遮：</span>
        局部遮挡会使组串 P-V 曲线出现
        <strong>多峰</strong>，可能导致 MPPT 跟踪偏差。合理 MPPT 划分与横竖排优化仍有意义，但年发电影响通常小于户用极端误装情形。
      </li>
      <li>
        <span className="font-semibold text-slate-900">BC 组件价值点：</span>
        间距合规的工商业项目，常态发电较少依赖组件抗局部遮挡能力；残余结构性遮挡下，BC 相对 TOPCon 仍可体现
        <strong>小幅</strong>
        差异，本工具以较低场景基准值计入增益。
      </li>
    </ul>
  );
}

function CalcFootnote({ scenario }: { scenario: AntiShadingScenario }) {
  if (scenario === "residential") {
    return (
      <p className="text-xs text-slate-400 mt-4">
        户用更依赖组件对碎片化局部遮挡的容忍度；数值为对比测算占位，后续可接入阴影仿真或实测曲线。
      </p>
    );
  }
  return (
    <p className="text-xs text-slate-400 mt-4">
      工商业以设计避遮为主；数值为对比测算占位，后续可接入 PVsyst 阴影损失或分项目校准。
    </p>
  );
}

export function AntiShadingExplainDialog({
  open,
  onOpenChange,
  scenario,
  onScenarioChange,
}: AntiShadingExplainDialogProps) {
  const { m } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const slideCount = 2;

  const breakdown = antiShadingGainBreakdown(scenario);
  const scenarioLabel = m.gain.scenarios[scenario];

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
        <DialogHeader className="px-6 pt-6 pb-2 space-y-3">
          <DialogTitle className="text-xl">抗遮挡增益 — 原理与计算</DialogTitle>
          <Tabs
            value={scenario}
            onValueChange={(v) =>
              onScenarioChange(v as AntiShadingScenario)
            }
          >
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="residential">户用</TabsTrigger>
              <TabsTrigger value="commercial">工商业</TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
          <CarouselContent className="ml-0">
            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  阴影遮挡如何影响发电？（{scenarioLabel}）
                </h3>
                <PrincipleContent scenario={scenario} />
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                  部分高端户用方案采用微型逆变器或功率优化器（MLPE），可进一步降低组串级失配；本策略暂不单独建模 MLPE，仅作场景说明。
                </div>
              </Slide>
            </CarouselItem>

            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  如何定量计入增益？（{scenarioLabel}）
                </h3>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4 font-mono text-sm text-slate-800 space-y-2">
                  <p>抗遮挡增益（%） = 场景基准值</p>
                  <p className="font-semibold text-[#E40011]">
                    当前场景「{scenarioLabel}」→ +{fmtPct(breakdown.gainPct)}
                  </p>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  勾选抗遮挡策略后，隆基对比列在发电量测算中额外加上表内基准增益。户用场景基准为{" "}
                  <span className="font-semibold">
                    +{fmtPct(ANTI_SHADING_PCT.residential)}
                  </span>
                  ，工商业为{" "}
                  <span className="font-semibold">
                    +{fmtPct(ANTI_SHADING_PCT.commercial)}
                  </span>
                  （非 PVsyst 逐时仿真，便于方案对比沟通）。
                </p>

                <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="px-4 py-2 text-left text-slate-500 font-medium">
                          场景
                        </th>
                        <th className="px-4 py-2 text-left text-slate-500 font-medium">
                          适用说明
                        </th>
                        <th className="px-4 py-2 text-right text-slate-500 font-medium">
                          计入增益
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        className={`border-b ${
                          scenario === "residential" ? "bg-[#E40011]/5" : ""
                        }`}
                      >
                        <td className="px-4 py-2 font-medium">户用</td>
                        <td className="px-4 py-2 text-slate-600">
                          碎片化局部遮挡、安装间距风险
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                          +{fmtPct(ANTI_SHADING_PCT.residential)}
                        </td>
                      </tr>
                      <tr
                        className={
                          scenario === "commercial" ? "bg-[#E40011]/5" : ""
                        }
                      >
                        <td className="px-4 py-2 font-medium">工商业</td>
                        <td className="px-4 py-2 text-slate-600">
                          设计避遮为主，残余结构遮挡
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                          +{fmtPct(ANTI_SHADING_PCT.commercial)}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50">
                        <td
                          colSpan={2}
                          className="px-4 py-2 font-semibold text-emerald-800"
                        >
                          当前选中 · 隆基相对增益
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-700">
                          +{fmtPct(breakdown.gainPct)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <CalcFootnote scenario={scenario} />
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
