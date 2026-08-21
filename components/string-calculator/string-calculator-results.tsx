"use client";

import { useI18n } from "@/components/locale-provider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { MethodBreakdown, ModuleStringResult } from "@/lib/string-calculator";

function VoltageBar({
  value,
  limit,
  label,
}: {
  value: number;
  limit: number;
  label: string;
}) {
  const pct = limit > 0 ? Math.min(120, (value / limit) * 100) : 0;
  const over = value > limit + 1e-9;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={cn("font-semibold tabular-nums", over ? "text-[#E40011]" : "text-emerald-700")}>
          {Math.round(value)} V
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            over ? "bg-[#E40011]" : "bg-emerald-500"
          )}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
        {pct > 100 ? (
          <div
            className="absolute inset-y-0 right-0 bg-[#E40011]/30"
            style={{ width: `${Math.min(20, pct - 100)}%` }}
          />
        ) : null}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {limit} V
      </p>
    </div>
  );
}

function MethodCard({
  title,
  method,
  limit,
}: {
  title: string;
  method: MethodBreakdown;
  limit: number;
}) {
  const { m } = useI18n();
  const t = m.stringCalc;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h4 className="font-semibold text-slate-900">{title}</h4>
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            method.withinLimit
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-[#E40011]"
          )}
        >
          {method.withinLimit ? t.pass : t.fail}
        </span>
      </div>
      <VoltageBar value={method.stringVocV} limit={limit} label={t.vocString} />
      <p className="mt-3 font-mono text-[11px] leading-relaxed text-slate-400">
        {method.ku != null
          ? `U_OC MAX = K_U × M × Voc = ${method.stringVocV.toFixed(2)} V`
          : `Voc(T) × M = ${method.vocModuleV.toFixed(3)} × n = ${method.stringVocV.toFixed(2)} V`}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-slate-500">{t.tUsed}</dt>
        <dd className="tabular-nums text-slate-800">{method.tUsedC.toFixed(1)} °C</dd>
        <dt className="text-slate-500">{t.vocModule}</dt>
        <dd className="tabular-nums text-slate-800">{method.vocModuleV.toFixed(3)} V</dd>
        {method.ku != null ? (
          <>
            <dt className="text-slate-500">{t.ku}</dt>
            <dd className="tabular-nums text-slate-800">{method.ku.toFixed(4)}</dd>
          </>
        ) : null}
        {method.uOcArrayV != null ? (
          <>
            <dt className="text-slate-500">{t.uOcArray}</dt>
            <dd className="tabular-nums text-slate-800">
              {method.uOcArrayV.toFixed(2)} V
            </dd>
          </>
        ) : null}
        <dt className="text-slate-500">{t.maxM}</dt>
        <dd className="tabular-nums text-slate-800">{method.maxModules}</dd>
        <dt className="text-slate-500">{t.margin}</dt>
        <dd
          className={cn(
            "tabular-nums font-medium",
            method.marginV >= 0 ? "text-emerald-700" : "text-[#E40011]"
          )}
        >
          {method.marginV >= 0 ? "+" : ""}
          {method.marginV.toFixed(1)} V
        </dd>
      </dl>
    </div>
  );
}

export function StringCalculatorResults({
  rows,
  voltageLimitV,
}: {
  rows: ModuleStringResult[];
  voltageLimitV: number;
}) {
  const { m } = useI18n();
  const t = m.stringCalc;

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-10 text-center text-slate-500">
        {t.noModules}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <div key={row.module.id} className="space-y-4">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight text-slate-900">
              {row.module.model}
            </h3>
            <p className="text-sm text-slate-500">
              {row.module.powerWp} W · Voc {row.module.vocStc.toFixed(2)} V · M ={" "}
              {row.module.modulesPerString}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <MethodCard
              title={t.methodGeneral}
              method={row.general}
              limit={voltageLimitV}
            />
            <MethodCard title={t.methodIec} method={row.iec} limit={voltageLimitV} />
          </div>
        </div>
      ))}

      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-900">{t.summary}</h3>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.model}</TableHead>
                <TableHead>{t.methodGeneral}</TableHead>
                <TableHead>{t.methodIec}</TableHead>
                <TableHead>{t.maxM}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.module.id}>
                  <TableCell className="font-medium">
                    {row.module.model}
                    <span className="ml-2 text-slate-400">{row.module.powerWp} W</span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.general.stringVocRoundedV} V
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.iec.stringVocRoundedV} V
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {row.general.maxModules} / {row.iec.maxModules}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
