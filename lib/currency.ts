import type { BasicParams, CurrencyCode } from "./pv-types";

/**
 * 示意汇率：以 AUD 为 1 的相对购买力（非实时牌价，后期可接配置/API）。
 * 含义：1 AUD ≈ RATE[c] 单位的外币（用于 amount_AUD * (RATE[to]/RATE[from])）。
 */
export const EXCHANGE_RATES_FROM_AUD: Record<CurrencyCode, number> = {
  AUD: 1,
  USD: 0.66,
  CNY: 4.72,
  NZD: 1.08,
};

export type MoneyPrecision = "pricePerW" | "cost" | "ppa";

const DECIMALS: Record<MoneyPrecision, number> = {
  pricePerW: 4,
  cost: 2,
  ppa: 4,
};

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function convertMoney(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  precision: MoneyPrecision = "cost"
): number {
  if (from === to || !Number.isFinite(amount)) return amount;
  const fromRate = EXCHANGE_RATES_FROM_AUD[from];
  const toRate = EXCHANGE_RATES_FROM_AUD[to];
  const inAud = amount / fromRate;
  const converted = inAud * toRate;
  return roundTo(converted, DECIMALS[precision]);
}

export function convertBasicParams(
  params: BasicParams,
  to: CurrencyCode
): BasicParams {
  const from = params.currency;
  if (from === to) return params;
  return {
    ...params,
    currency: to,
    ppaPrice: convertMoney(params.ppaPrice, from, to, "ppa"),
    accessoryCostPerModule: convertMoney(
      params.accessoryCostPerModule,
      from,
      to,
      "cost"
    ),
  };
}

/** 换算对比页会话覆盖中的单瓦价格字符串 */
export function convertPriceOverrideValue(
  price: string,
  from: CurrencyCode,
  to: CurrencyCode
): string {
  const num = parseFloat(price);
  if (!Number.isFinite(num)) return price;
  return String(convertMoney(num, from, to, "pricePerW"));
}
