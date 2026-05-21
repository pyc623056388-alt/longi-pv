import type { WeatherRecord } from "./pv-types";

/** 按 12 个月水平面辐照估算年等效发电小时（kWh/kWp） */
export function estimateYearlyHoursFromWeather(weather: WeatherRecord): number {
  if (weather.yearlyEquivalentHours && weather.yearlyEquivalentHours > 0) {
    return Math.round(weather.yearlyEquivalentHours);
  }
  const monthly = weather.monthlyIrradianceKwhM2Day;
  if (!monthly || monthly.length < 12) {
    return 1500;
  }
  const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let annualKwhPerM2 = 0;
  for (let i = 0; i < 12; i++) {
    annualKwhPerM2 += (monthly[i] ?? 0) * daysPerMonth[i];
  }
  const performanceRatio = 0.82;
  return Math.round(annualKwhPerM2 * performanceRatio);
}
