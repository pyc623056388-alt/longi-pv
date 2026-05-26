"use client";

import { useI18n } from "@/components/locale-provider";
import { getLegalLabels } from "@/lib/report-labels";

export function AppLegalFooter() {
  const { locale, m } = useI18n();
  const legal = getLegalLabels(locale);

  return (
    <footer
      className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs leading-relaxed text-slate-500"
      aria-label={m.report.sections.disclaimer}
    >
      <p className="mx-auto max-w-3xl">
        {m.legal.internalNotice.split(m.legal.noExternalDistribution).map(
          (part, i, arr) =>
            i < arr.length - 1 ? (
              <span key={i}>
                {part}
                <strong className="font-semibold text-slate-700">
                  {m.legal.noExternalDistribution}
                </strong>
              </span>
            ) : (
              <span key={i}>{part}</span>
            )
        )}
      </p>
      <p className="mx-auto mt-2 max-w-3xl">{legal.referenceOnly}</p>
      <p className="mx-auto mt-2 max-w-3xl">{legal.ipNotice}</p>
      <p className="mx-auto mt-3 max-w-3xl text-slate-600">{legal.attribution}</p>
      <p className="mx-auto mt-2 max-w-3xl text-slate-600">
        {m.legal.feedbackLabel}
        {"："}
        <a
          href={`mailto:${legal.feedbackEmail}`}
          className="text-[#E40011] underline-offset-2 hover:underline"
        >
          {legal.feedbackEmail}
        </a>
      </p>
    </footer>
  );
}
