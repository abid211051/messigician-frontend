"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface NumericInputProps {
  value: number | null | undefined;
  onChange: (v: number | null | undefined) => void;
  onBlur?: () => void;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  emptyAs?: "null" | "undefined";
  placeholder?: string;
  className?: string;
}

const toDisplay = (v: number | null | undefined): string =>
  v != null ? String(v) : "";

export function NumericInput({
  value,
  onChange,
  onBlur,
  allowNegative = false,
  allowDecimal = true,
  emptyAs = "undefined",
  placeholder,
  className,
}: NumericInputProps) {
  const emptyVal = emptyAs === "null" ? null : undefined;

  const parse = (raw: string): number | null | undefined => {
    if (raw === "" || raw === "-") return emptyVal;
    const n = Number(raw);
    return isNaN(n) ? emptyVal : n;
  };

  const [raw, setRaw] = useState(() => toDisplay(value));

  useEffect(() => {
    setRaw(toDisplay(value));
  }, [value]);

  return (
    <Input
      type="number"
      inputMode={"numeric"}
      value={raw}
      onChange={(e) => {
        const next = e.target.value;
        setRaw(next);
        onChange(parse(next));
      }}
      onKeyDown={(e) => {
        if (e.key === "+") e.preventDefault();
        if (!allowNegative && e.key === "-") e.preventDefault();
        if (!allowDecimal && e.key === ".") e.preventDefault();
      }}
      onBlur={() => {
        const normalised = toDisplay(parse(raw));
        setRaw(normalised);
        onBlur?.();
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}
