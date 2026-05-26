"use client";

import Image from "next/image";
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
  LOW_LIGHT_GAIN_PAN_MAX_PCT,
  LOW_LIGHT_IRRADIANCE_WEIGHTS,
  STANDARD_LOW_LIGHT_PCT,
  hasCompleteLowLightProfile,
  lowLightGainBreakdown,
} from "@/lib/gain-algorithms";
import type { GainRuleId } from "@/lib/pv-types";
import { LOW_LIGHT_IRRADIANCE_LEVELS } from "@/lib/pv-types";

interface LowLightGainExplainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  longi: ModuleSpec;
  competitor: ModuleSpec;
  ruleId: GainRuleId;
}

function fmtPct(n: number, digits = 2): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(digits)}%`;
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

/** 讲解页固定标签，不展示具体厂商/型号 */
const LOW_LIGHT_BC_LABEL = "BC";
const LOW_LIGHT_TOPCON_LABEL = "TOPCon";

const REFERENCE_PAN_ROWS: {
  g: number;
  longi: number;
  comp: number;
}[] = [
  { g: 800, longi: 0.74, comp: 0.62 },
  { g: 600, longi: 0.95, comp: 0.91 },
  { g: 400, longi: 0.55, comp: 0.54 },
  { g: 200, longi: -1.19, comp: -1.12 },
];

export function LowLightGainExplainDialog({
  open,
  onOpenChange,
  longi,
  competitor,
  ruleId,
}: LowLightGainExplainDialogProps) {
  const { m } = useI18n();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const slideCount = 3;

  const breakdown = lowLightGainBreakdown(longi, competitor, ruleId);
  const hasPan =
    hasCompleteLowLightProfile(longi) && hasCompleteLowLightProfile(competitor);

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
      <DialogContent className="sm:max-w-3xl p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl">弱光增益 — 原理与计算</DialogTitle>
        </DialogHeader>

        <Carousel setApi={setApi} opts={{ loop: false }} className="w-full">
          <CarouselContent className="ml-0">
            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-3">
                  为什么 BC 在弱光下更有优势？
                </h3>
                <ul className="space-y-2.5 text-sm text-slate-700 leading-relaxed mb-4">
                  <li>
                    <span className="font-semibold text-slate-900">
                      正面无栅线遮光：
                    </span>
                    电极在背面，更多光子进入硅体；低电流密度下光学与钝化优势更易体现。
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">
                      无正面扩散结寄生吸收：
                    </span>
                    弱光下仍利于维持电压与填充因子。
                  </li>
                  <li>
                    <span className="font-semibold text-slate-900">
                      PVsyst 单二极管模型：
                    </span>
                    低光相对效率由 R<sub>serie</sub>、R<sub>shunt</sub>
                    随辐照变化共同决定；STC 下 Rshunt 数值本身影响有限。
                  </li>
                </ul>

                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  PVsyst 弱光实测（25°C，相对 STC 效率）
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <figure className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <Image
                      src="/gain/low-light/longi-lr8-pvsyst.png"
                      alt="BC 组件 PVsyst 弱光曲线"
                      width={394}
                      height={281}
                      className="w-full h-auto"
                    />
                    <figcaption className="text-xs text-slate-500 px-2 py-1.5 border-t">
                      {LOW_LIGHT_BC_LABEL}（隆基）
                    </figcaption>
                  </figure>
                  <figure className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                    <Image
                      src="/gain/low-light/topcon-pvsyst.png"
                      alt="TOPCon 组件 PVsyst 弱光曲线"
                      width={394}
                      height={281}
                      className="w-full h-auto"
                    />
                    <figcaption className="text-xs text-slate-500 px-2 py-1.5 border-t">
                      {LOW_LIGHT_TOPCON_LABEL}
                    </figcaption>
                  </figure>
                </div>
              </Slide>
            </CarouselItem>

            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  如何定量计算增益？
                </h3>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4 font-mono text-sm text-slate-800 space-y-2">
                  <p>
                    Δη(G) = RelEffic<sub>{LOW_LIGHT_BC_LABEL}</sub>(G) −
                    RelEffic<sub>{LOW_LIGHT_TOPCON_LABEL}</sub>(G)
                  </p>
                  <p className="font-semibold text-[#E40011]">
                    增益 = Σ w(G) · max(0, Δη(G))，上限{" "}
                    {LOW_LIGHT_GAIN_PAN_MAX_PCT}%
                  </p>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  辐照档 G ∈ {LOW_LIGHT_IRRADIANCE_LEVELS.join("、")} W/m²；权重
                  w(200)={LOW_LIGHT_IRRADIANCE_WEIGHTS[200]}、w(400)=
                  {LOW_LIGHT_IRRADIANCE_WEIGHTS[400]}、w(600)=
                  {LOW_LIGHT_IRRADIANCE_WEIGHTS[600]}、w(800)=
                  {LOW_LIGHT_IRRADIANCE_WEIGHTS[800]}。无完整 PAN 时采用标准规则{" "}
                  {STANDARD_LOW_LIGHT_PCT}%。
                </p>

                {hasPan && breakdown.points.length > 0 ? (
                  <div className="rounded-xl border border-slate-200 overflow-hidden text-sm mb-3">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50 text-left">
                          <th className="px-3 py-2 text-slate-500 font-medium">
                            G (W/m²)
                          </th>
                          <th className="px-3 py-2 font-medium">
                            {LOW_LIGHT_BC_LABEL}
                          </th>
                          <th className="px-3 py-2 font-medium">
                            {LOW_LIGHT_TOPCON_LABEL}
                          </th>
                          <th className="px-3 py-2 text-slate-500">Δη</th>
                          <th className="px-3 py-2 text-slate-500">计入</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakdown.points.map((p) => (
                          <tr key={p.irradianceWm2} className="border-b">
                            <td className="px-3 py-2">{p.irradianceWm2}</td>
                            <td className="px-3 py-2">
                              {fmtPct(p.longiRelEfficPct)}
                            </td>
                            <td className="px-3 py-2">
                              {fmtPct(p.compRelEfficPct)}
                            </td>
                            <td className="px-3 py-2">{fmtPct(p.deltaPct)}</td>
                            <td className="px-3 py-2">
                              {fmtPct(p.weightedContributionPct, 3)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-emerald-50">
                          <td
                            colSpan={4}
                            className="px-3 py-2 font-semibold text-emerald-800"
                          >
                            BC 相对 TOPCon 增益（来源：
                            {breakdown.source === "pan" ? "PAN" : "标准"}）
                          </td>
                          <td className="px-3 py-2 font-bold text-emerald-700">
                            +{breakdown.gainPct.toFixed(2)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-2">
                      当前选型缺少完整 PAN 弱光四点，下表为 BC vs TOPCon
                      参考曲线；测算使用标准 {STANDARD_LOW_LIGHT_PCT}%。
                    </p>
                    <div className="rounded-xl border border-slate-200 overflow-hidden text-sm mb-3">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-slate-50 text-left">
                            <th className="px-3 py-2 text-slate-500">G</th>
                            <th className="px-3 py-2">{LOW_LIGHT_BC_LABEL}</th>
                            <th className="px-3 py-2">
                              {LOW_LIGHT_TOPCON_LABEL}
                            </th>
                            <th className="px-3 py-2">Δη</th>
                          </tr>
                        </thead>
                        <tbody>
                          {REFERENCE_PAN_ROWS.map((r) => (
                            <tr key={r.g} className="border-b">
                              <td className="px-3 py-2">{r.g}</td>
                              <td className="px-3 py-2">{fmtPct(r.longi)}</td>
                              <td className="px-3 py-2">{fmtPct(r.comp)}</td>
                              <td className="px-3 py-2">
                                {fmtPct(r.longi - r.comp)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium">
                      当前计入：+{breakdown.gainPct.toFixed(1)}%（
                      {breakdown.source === "standard" ? "标准规则" : "PAN"}）
                    </p>
                  </>
                )}
              </Slide>
            </CarouselItem>

            <CarouselItem className="pl-0">
              <Slide>
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  数据口径分层（请勿混用）
                </h3>
                <div className="rounded-xl border border-slate-200 overflow-hidden text-sm">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50 text-left">
                        <th className="px-4 py-2 text-slate-500 font-medium">
                          层级
                        </th>
                        <th className="px-4 py-2 text-slate-500 font-medium">
                          含义
                        </th>
                        <th className="px-4 py-2 text-slate-500 font-medium">
                          典型值
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      <tr className="border-b">
                        <td className="px-4 py-2 font-medium">A. 单组件曲线</td>
                        <td className="px-4 py-2">相对 STC 的 RelEffic @ G</td>
                        <td className="px-4 py-2">400 W/m² 约 +0.5%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-2 font-medium">B. PAN 差值</td>
                        <td className="px-4 py-2">本计算器加权 Δη</td>
                        <td className="px-4 py-2">0.05–1.0%</td>
                      </tr>
                      <tr className="border-b bg-[#E40011]/5">
                        <td className="px-4 py-2 font-medium text-[#E40011]">
                          C. 标准规则
                        </td>
                        <td className="px-4 py-2">无 PAN 时缺省</td>
                        <td className="px-4 py-2 font-semibold">
                          {STANDARD_LOW_LIGHT_PCT}%
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 font-medium">D. 系统实证</td>
                        <td className="px-4 py-2">
                          气象、IAM、发电时长等综合
                        </td>
                        <td className="px-4 py-2">1.2–3%（讲解引用）</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 leading-relaxed">
                  <li>
                    青海户用对比（2025-04）：BC 月均等效约 +2.95%，阴天日约
                    +3.16%（HPBC 2.0 vs TOPCon）。
                  </li>
                  <li>
                    隆基 BC 白皮书：相对 TOPCon 在温度系数、IAM、弱光、工作温度等综合发电优势 &gt;1.2%。
                  </li>
                  <li>
                    本策略默认乘子采用 B 或 C，不把 D 直接写入年发电量公式。
                  </li>
                </ul>
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
