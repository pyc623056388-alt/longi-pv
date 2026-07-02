/** LONGi CI brand tokens — shared across login, hero, and report surfaces. */

export const LONGI_RED = "#E40011";
export const LONGI_RED_LIGHT = "#ff4d5a";
export const LONGI_RED_LIGHTER = "#ff8080";
export const LONGI_PURPLE = "#662D91";

export const longiGradient = {
  button: `linear-gradient(to right, ${LONGI_RED}, ${LONGI_RED_LIGHT})`,
  title: `linear-gradient(to right, ${LONGI_RED}, ${LONGI_RED_LIGHT}, ${LONGI_RED_LIGHTER})`,
} as const;
