export const SITE_TOOLBOX_ITEMS = [
  {
    id: "string-calculator",
    href: "/string-calculator",
    labelKey: "stringCalculator",
    hintKey: "stringCalculatorHint",
  },
] as const;

export type SiteToolboxItem = (typeof SITE_TOOLBOX_ITEMS)[number];

export function isToolboxPath(pathname: string): boolean {
  return SITE_TOOLBOX_ITEMS.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
}
