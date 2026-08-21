import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "String Calculator · LONGi",
  description:
    "ASHRAE weather + IEC 62548 string Voc calculator for LONGi project support",
};

export default function StringCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
