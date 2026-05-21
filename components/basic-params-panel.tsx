"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CURRENCY_LABELS,
  type BasicParams,
  type CurrencyCode,
} from "@/lib/pv-types";

interface BasicParamsPanelProps {
  params: BasicParams;
  onChange: (params: BasicParams) => void;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  hoursAutoHint?: boolean;
}

export function BasicParamsPanel({
  params,
  onChange,
  onCurrencyChange,
  hoursAutoHint,
}: BasicParamsPanelProps) {
  const ppaUnit = `${params.currency}/kWh`;

  return (
    <Accordion type="single" collapsible className="mb-12">
      <AccordionItem value="basic" className="border-0 bg-white rounded-3xl shadow-lg shadow-slate-200/50 px-6">
        <AccordionTrigger className="text-lg font-bold text-slate-900 hover:no-underline py-6">
          基本参数
          <span className="text-sm font-normal text-slate-500 ml-2">
            （统一参数 · 两方共用）
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <p className="text-sm text-slate-500 mb-6">两侧共用同一套边界条件。</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>组件安装倾角 (°)</Label>
              <Input
                type="number"
                value={params.tiltDeg}
                onChange={(e) =>
                  onChange({ ...params, tiltDeg: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>年等效发电小时</Label>
              <Input
                type="number"
                value={params.yearlyEquivalentHours}
                onChange={(e) =>
                  onChange({
                    ...params,
                    yearlyEquivalentHours: parseFloat(e.target.value) || 0,
                  })
                }
              />
              {hoursAutoHint && (
                <p className="text-xs text-slate-400">
                  选择气象后按 12 个月水平面辐照自动估算；可手工修改。
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>配件成本 (每块组件)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.accessoryCostPerModule}
                onChange={(e) =>
                  onChange({
                    ...params,
                    accessoryCostPerModule: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>运行年限 (年)</Label>
              <Input
                type="number"
                value={params.operationYears}
                onChange={(e) =>
                  onChange({
                    ...params,
                    operationYears: parseInt(e.target.value, 10) || 1,
                  })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>结算单位</Label>
              <Select
                value={params.currency}
                onValueChange={(v) => {
                  const code = v as CurrencyCode;
                  if (onCurrencyChange) onCurrencyChange(code);
                  else onChange({ ...params, currency: code });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CURRENCY_LABELS) as CurrencyCode[]).map((c) => (
                    <SelectItem key={c} value={c}>
                      {CURRENCY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">
                与首页右上角币种同步；切换时将按汇率换算 PPA、配件成本及组件库单价。
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>PPA 电价 (每 kWh 数值)</Label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  step="0.01"
                  className="flex-1"
                  value={params.ppaPrice}
                  onChange={(e) =>
                    onChange({
                      ...params,
                      ppaPrice: parseFloat(e.target.value) || 0,
                    })
                  }
                />
                <span className="flex items-center px-4 rounded-xl bg-slate-100 text-slate-600 text-sm font-medium whitespace-nowrap">
                  {ppaUnit}
                </span>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
