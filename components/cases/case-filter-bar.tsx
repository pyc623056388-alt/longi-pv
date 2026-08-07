"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/components/locale-provider";
import {
  hasActiveCaseFilters,
  type CaseCountry,
  type CaseFilterOptions,
  type CaseFilters,
  type CaseScale,
  type CaseSector,
} from "@/lib/case-catalog";

const selectClassName =
  "h-9 w-full min-w-0 rounded-md border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none transition focus:border-[#E40011]/70 focus:ring-2 focus:ring-[#E40011]/15";

function FilterField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClassName}
      >
        {children}
      </select>
    </label>
  );
}

export function CaseFilterBar({
  filters,
  options,
  shownCount,
  totalCount,
  onChange,
  onClear,
}: {
  filters: CaseFilters;
  options: CaseFilterOptions;
  shownCount: number;
  totalCount: number;
  onChange: (next: CaseFilters) => void;
  onClear: () => void;
}) {
  const { m } = useI18n();
  const fm = m.cases.filters;
  const labels = m.cases.labels;
  const active = hasActiveCaseFilters(filters);

  const patch = (partial: Partial<CaseFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="border-b border-slate-200/80 bg-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <FilterField
            id="case-filter-country"
            label={fm.country}
            value={filters.country ?? ""}
            onChange={(value) =>
              patch({ country: value as CaseCountry | "" })
            }
          >
            <option value="">{fm.all}</option>
            {options.countries.map((code) => (
              <option key={code} value={code}>
                {labels.country[code]}
              </option>
            ))}
          </FilterField>

          <FilterField
            id="case-filter-region"
            label={fm.region}
            value={filters.region ?? ""}
            onChange={(value) => patch({ region: value })}
          >
            <option value="">{fm.all}</option>
            {options.regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </FilterField>

          <FilterField
            id="case-filter-sector"
            label={fm.sector}
            value={filters.sector ?? ""}
            onChange={(value) =>
              patch({ sector: value as CaseSector | "" })
            }
          >
            <option value="">{fm.all}</option>
            {options.sectors.map((sector) => (
              <option key={sector} value={sector}>
                {labels.sector[sector]}
              </option>
            ))}
          </FilterField>

          <FilterField
            id="case-filter-scale"
            label={fm.scale}
            value={filters.scale ?? ""}
            onChange={(value) => patch({ scale: value as CaseScale | "" })}
          >
            <option value="">{fm.all}</option>
            {options.scales.map((scale) => (
              <option key={scale} value={scale}>
                {labels.scale[scale]}
              </option>
            ))}
          </FilterField>

          <FilterField
            id="case-filter-series"
            label={fm.series}
            value={filters.seriesId ?? ""}
            onChange={(value) => patch({ seriesId: value })}
          >
            <option value="">{fm.all}</option>
            {options.seriesIds.map((seriesId) => (
              <option key={seriesId} value={seriesId}>
                {seriesId}
              </option>
            ))}
          </FilterField>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-500">
            {fm.resultCount(shownCount, totalCount)}
          </p>
          {active ? (
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-semibold text-[#E40011] transition hover:text-[#c0000f]"
            >
              {fm.clear}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
