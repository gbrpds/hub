"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { formatCurrency } from "@/lib/format";

type Format = "currency" | "integer";

function render(value: number, format: Format) {
  return format === "currency"
    ? formatCurrency(value)
    : Math.round(value).toLocaleString("pt-BR");
}

// Pequena contagem animada ao carregar. Escreve direto no nó (sem re-render
// por frame) e anima só texto — respeitando prefers-reduced-motion.
export function CountUp({
  value,
  format = "integer",
}: {
  value: number;
  format?: Format;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (reduce) {
      node.textContent = render(value, format);
      return;
    }

    const controls = animate(0, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => {
        node.textContent = render(v, format);
      },
    });
    return () => controls.stop();
  }, [value, format, reduce]);

  // Valor inicial (SSR / sem JS): já mostra o número final formatado.
  return <span ref={ref}>{render(value, format)}</span>;
}
