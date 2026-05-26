import type { AntiShadingScenario, GainRuleId } from "@/lib/pv-types";
import { getMessages, type AppLocale } from "./i18n";
import {
  LEGAL_DEVELOPER,
  LEGAL_FEEDBACK_EMAIL,
  LEGAL_SUPPORT,
} from "./legal-meta";

/** @deprecated Use getReportLabels(locale) */
export const REPORT_TITLE = "隆基智能光伏 · 对比测算报告";
/** @deprecated Use getReportLabels(locale) */
export const REPORT_SUBTITLE = "全生命周期增益测算（简化平均模型）";
/** @deprecated Use getReportLabels(locale) */
export const REPORT_DISCLAIMER =
  "【内部专用·严禁外发】本报告由隆基智能光伏测算工具自动生成，仅供内部销售与技术沟通参考；结果仅供参考，不构成投资建议、正式工程承诺或合同依据。测算基于用户输入参数、所选气象站及组件库数据，采用简化平均模型；全站投资回收期为组件与按块分摊的系统成本之和，按运行年限内逐年售电收入（含衰减）动态累计至回本，未含运维 OPEX 与税费。PPA 与组件单价须与所选结算单位一致，回收期对电价高度敏感（勿将人民币电价填在美元单位下）。竞品参数来源于公开资料、PAN 文件或用户导入，请以最新官方规格为准。";
/** @deprecated Use getReportLabels(locale) */
export const REPORT_WATERMARK = "内部资料 · 严禁外发 · 仅供参考";

export function getLegalLabels(locale: AppLocale) {
  const m = getMessages(locale);
  return {
    attribution: m.legal.attribution(LEGAL_DEVELOPER, LEGAL_SUPPORT),
    feedback: m.legal.feedback(LEGAL_FEEDBACK_EMAIL),
    feedbackEmail: LEGAL_FEEDBACK_EMAIL,
    internalNotice: m.legal.internalNotice,
    referenceOnly: m.legal.referenceOnly,
    ipNotice: m.legal.ipNotice(LEGAL_DEVELOPER),
    combinedFooter: m.legal.combinedFooter(LEGAL_DEVELOPER),
    noExternalDistribution: m.legal.noExternalDistribution,
  };
}

export function getReportLabels(locale: AppLocale) {
  const m = getMessages(locale);
  const legal = getLegalLabels(locale);
  return {
    title: m.report.title,
    subtitle: m.report.subtitle,
    disclaimer: m.report.disclaimer,
    watermark: m.report.watermark,
    ...legal,
    comparisonModeLabels: m.report.comparisonModes,
    gainRuleLabels: m.gain.rules,
    antiShadingScenarioLabels: m.gain.scenarios,
    gainStrategyTitles: {
      temperature: m.gain.cards.temperature.title,
      antiShading: m.gain.cards.antiShading.title,
      lowLight: m.gain.cards.lowLight.title,
    } as const,
  };
}

/** @deprecated Use getReportLabels(locale).comparisonModeLabels */
export const COMPARISON_MODE_LABELS = {
  sameCount: "同片数对比",
  fixedCapacity: "固定装机量对比",
} as const;

/** @deprecated Use getReportLabels(locale).gainRuleLabels */
export const GAIN_RULE_LABELS: Record<GainRuleId, string> = {
  standard: "标准",
  conservative: "保守",
  pan: "PAN 数据",
};

/** @deprecated Use getReportLabels(locale).antiShadingScenarioLabels */
export const ANTI_SHADING_SCENARIO_LABELS: Record<AntiShadingScenario, string> = {
  residential: "户用碎片化遮挡",
  commercial: "工商业设计型遮挡",
};

/** @deprecated Use getReportLabels(locale).gainStrategyTitles */
export const GAIN_STRATEGY_TITLES = {
  temperature: "温度系数增益",
  antiShading: "抗遮挡增益",
  lowLight: "弱光增益",
} as const;
