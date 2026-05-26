/** Strip lab/oklch/color() before html2canvas parses computed styles. */

const UNSUPPORTED_COLOR = /lab\(|oklch\(|color\(/i;

const COLOR_PROPS = [
  "color",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
  "text-decoration-color",
  "column-rule-color",
  "caret-color",
  "fill",
  "stroke",
] as const;

function fallbackFor(prop: string): string {
  if (prop === "color" || prop === "caret-color") return "#0f172a";
  if (prop === "background-color") return "#ffffff";
  if (prop === "fill") return "#E40011";
  if (prop === "stroke") return "none";
  return "#e2e8f0";
}

export function needsSanitizeColor(value: string): boolean {
  if (!value || value === "transparent" || value === "none") return false;
  return UNSUPPORTED_COLOR.test(value);
}

export function sanitizeNodeColors(node: Element, view: Window): void {
  const cs = view.getComputedStyle(node);

  if (node instanceof HTMLElement) {
    for (const prop of COLOR_PROPS) {
      const val = cs.getPropertyValue(prop);
      if (needsSanitizeColor(val)) {
        node.style.setProperty(prop, fallbackFor(prop), "important");
      }
    }
  }

  if (node instanceof SVGElement) {
    for (const attr of ["fill", "stroke"] as const) {
      const val = node.getAttribute(attr) ?? cs.getPropertyValue(attr);
      if (val && needsSanitizeColor(val)) {
        node.setAttribute(attr, attr === "fill" ? "#E40011" : "none");
      }
    }
  }

  for (const child of node.children) {
    sanitizeNodeColors(child, view);
  }
}

export function sanitizeClonedReportDocument(doc: Document, root: HTMLElement): void {
  doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((n) => n.remove());

  doc.documentElement.style.setProperty("background", "#ffffff", "important");
  doc.documentElement.style.setProperty("color", "#0f172a", "important");
  doc.body.style.setProperty("background", "#ffffff", "important");
  doc.body.style.setProperty("color", "#0f172a", "important");

  const view = doc.defaultView;
  if (!view) return;

  sanitizeNodeColors(root, view);
}
