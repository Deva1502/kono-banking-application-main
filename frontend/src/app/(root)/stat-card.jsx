"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function StatCard({
  title,
  value,
  href,
  icon,
  accent = "from-gray-100 to-white",
  chip,
  isCurrency = true,
}) {
  const [reveal, setReveal] = useState(false);

  const formatted = useMemo(() => {
    if (!isCurrency) return String(value ?? 0);
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(
        Number(value || 0)
      );
    } catch {
      return `₹${value ?? 0}`;
    }
  }, [value, isCurrency]);

  const masked = useMemo(() => {
    const s = String(formatted);
    if (!isCurrency) return s; // no mask for non-currency stat
    // Keep currency symbol visible, mask numerals
    const symbol = s.match(/^[^\d]+/)?.[0] ?? "";
    const digits = s.slice(symbol.length);
    return symbol + "x".repeat(digits.length || 4);
  }, [formatted, isCurrency]);

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-lg border bg-gradient-to-br ${accent} p-5 shadow-sm transition hover:shadow-md`}
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/50 blur-2xl" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-white shadow-sm">{icon}</div>
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="mt-1 flex items-center gap-2">
              <h3 className="text-3xl font-semibold tracking-tight">
                {reveal ? formatted : masked}
              </h3>
              {isCurrency && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setReveal((v) => !v);
                  }}
                  className="rounded p-1 text-gray-600 hover:bg-white/70"
                  aria-label={reveal ? "Hide amount" : "Show amount"}
                  title={reveal ? "Hide amount" : "Show amount"}
                >
                  {reveal ? <FaEyeSlash /> : <FaEye />}
                </button>
              )}
            </div>
          </div>
        </div>

        {chip && (
          <span className="rounded-full border bg-white/70 px-2 py-0.5 text-xs text-gray-600 backdrop-blur">
            {chip}
          </span>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 transition group-hover:text-gray-700">
        Tap to view details
      </div>
    </Link>
  );
}
