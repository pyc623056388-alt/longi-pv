"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/components/locale-provider";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  isPpaOutsideReference,
  suggestAccessoryPerModule,
} from "@/lib/payback-audit";
import {
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  type BasicParams,
  type CurrencyCode,
} from "@/lib/pv-types";

export interface EpcHelperContext {
  moduleCount: number;
  longiPowerWp: number;
  longiPricePerW: number;
}

interface BasicParamsPanelProps {
  params: BasicParams;
  onChange: (params: BasicParams) => void;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  hoursAutoHint?: boolean;
  epcHelper?: EpcHelperContext;
}

export function BasicParamsPanel({
  params,
  onChange,
  onCurrencyChange,
  hoursAutoHint,
  epcHelper,
}: BasicParamsPanelProps) {
  const { m, formatNumber } = useI18n();
  const ppaUnit = `${params.currency}/kWh`;
  const sym = CURRENCY_SYMBOLS[params.currency];
  const ppaReferenceLabel = m.ppaReference[params.currency];
  const ppaWarn = isPpaOutsideReference(params.ppaPrice, params.currency);

  const accessoryTotalPreview =
    epcHelper && epcHelper.moduleCount > 0
      ? params.accessoryCostPerModule * epcHelper.moduleCount
      : null;

  const [targetEpcPerWp, setTargetEpcPerWp] = useState("");

  const suggestedAccessory = useMemo(() => {
    const epc = parseFloat(targetEpcPerWp);
    if (!epcHelper || !Number.isFinite(epc)) return null;
    return suggestAccessoryPerModule(
      epc,
      epcHelper.longiPricePerW,
      epcHelper.longiPowerWp
    );
  }, [targetEpcPerWp, epcHelper]);

  const applyAccessorySuggestion = () => {
    if (suggestedAccessory == null) return;
    onChange({
      ...params,
      accessoryCostPerModule: Math.round(suggestedAccessory * 100) / 100,
    });
  };

  return (
    <Accordion type="single" collapsible className="mb-12">
      <AccordionItem
        value="basic"
        className="border-0 bg-white rounded-3xl shadow-lg shadow-slate-200/50 px-6"
      >
        <AccordionTrigger className="text-lg font-bold text-slate-900 hover:no-underline py-6">
          {m.basicParams.title}
          <span className="text-sm font-normal text-slate-500 ml-2">
            {m.basicParams.titleHint}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-6">
          <p className="text-sm text-slate-500 mb-6">{m.basicParams.sharedNote}</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{m.basicParams.tilt}</Label>
              <Input
                type="number"
                value={params.tiltDeg}
                onChange={(e) =>
                  onChange({ ...params, tiltDeg: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>{m.basicParams.yearlyHours}</Label>
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
                <p className="text-xs text-slate-400">{m.basicParams.hoursAutoHint}</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{m.basicParams.accessoryCost}</Label>
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
              <p className="text-xs text-slate-400">
                {m.basicParams.accessoryCostHint(params.currency)}
              </p>
              {accessoryTotalPreview != null && epcHelper && (
                <p className="text-xs text-slate-600 font-medium">
                  {m.basicParams.accessoryTotalPreview(
                    sym,
                    formatNumber(accessoryTotalPreview, { maximumFractionDigits: 0 }),
                    formatNumber(epcHelper.moduleCount),
                    params.accessoryCostPerModule
                  )}
                </p>
              )}
            </div>

            {epcHelper && (
              <div className="space-y-2 md:col-span-2 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <Label>{m.basicParams.epcHelperTitle}</Label>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[140px] space-y-1">
                    <span className="text-xs text-slate-500">
                      {m.basicParams.targetEpc(params.currency)}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={m.basicParams.epcPlaceholder}
                      value={targetEpcPerWp}
                      onChange={(e) => setTargetEpcPerWp(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={suggestedAccessory == null}
                    onClick={applyAccessorySuggestion}
                  >
                    {m.basicParams.applyAccessory}
                  </Button>
                </div>
                {suggestedAccessory != null && (
                  <p className="text-xs text-slate-500">
                    {m.basicParams.epcSuggestion(
                      epcHelper.longiPowerWp,
                      sym,
                      epcHelper.longiPricePerW,
                      suggestedAccessory.toFixed(2)
                    )}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>{m.basicParams.operationYears}</Label>
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
              <Label>{m.basicParams.currency}</Label>
              <SearchableSelect
                value={params.currency}
                onValueChange={(v) => {
                  const code = v as CurrencyCode;
                  if (onCurrencyChange) onCurrencyChange(code);
                  else onChange({ ...params, currency: code });
                }}
                searchPlaceholder={m.basicParams.currencySearch}
                options={(Object.keys(CURRENCY_LABELS) as CurrencyCode[]).map(
                  (c) => ({
                    value: c,
                    label: CURRENCY_LABELS[c],
                    keywords: c,
                  })
                )}
              />
              <p className="text-xs text-slate-400">{m.basicParams.currencySyncHint}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{m.basicParams.ppa}</Label>
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
              <p className="text-xs text-slate-400">
                {m.basicParams.ppaReference(ppaReferenceLabel)}
              </p>
              {ppaWarn && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {m.basicParams.ppaWarning}
                </p>
              )}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
