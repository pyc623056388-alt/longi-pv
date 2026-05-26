export type AppLocale = "zh" | "en";

export type ResultMetricId =
  | "moduleCount"
  | "capacity"
  | "firstYearYield"
  | "lifetimeYield"
  | "firstYearRevenue"
  | "lifetimeRevenue"
  | "moduleCost"
  | "accessoryCost"
  | "projectCost"
  | "netProfit"
  | "staticPayback"
  | "dynamicPayback";

export type ModuleSpecFieldKey =
  | "power"
  | "dimensions"
  | "tempCoef"
  | "firstYearDeg"
  | "annualDeg"
  | "price";
