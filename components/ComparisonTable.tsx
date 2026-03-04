"use client";

import { ScoredShoe } from "@/lib/types";

interface ComparisonTableProps {
  results: ScoredShoe[];
}

const rankBadge = {
  best: "bg-teal text-white",
  great: "bg-navy text-white",
  good: "bg-warm-gray-600 text-white",
};

export default function ComparisonTable({ results }: ComparisonTableProps) {
  if (results.length === 0) return null;

  const rows = [
    { label: "Category", key: "category" as const, format: (v: string) => (v === "road" ? "Road" : "Trail") },
    { label: "Stack Height", key: "stack" as const },
    { label: "Drop", key: "drop" as const },
    { label: "Weight", key: "weight" as const },
    { label: "Cushion", key: "cushion" as const, format: (v: string) => v.charAt(0).toUpperCase() + v.slice(1) },
    { label: "Support", key: "support" as const, format: (v: string) => v.charAt(0).toUpperCase() + v.slice(1) },
    { label: "Best For", key: "bestFor" as const, format: (v: string) => v.charAt(0).toUpperCase() + v.slice(1) },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-label="Shoe comparison">
        <thead>
          <tr className="border-b-2 border-navy/10">
            <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-warm-gray-400">Spec</th>
            {results.map((r) => (
              <th key={r.shoe.id} className="px-5 py-4 text-left">
                <div className="flex flex-col gap-1">
                  <span className={`inline-block self-start rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rankBadge[r.rank]}`}>
                    {r.rank}
                  </span>
                  <span className="text-base font-extrabold text-navy">{r.shoe.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.key}
              className={`border-b border-warm-gray-200/50 ${i % 2 === 0 ? "bg-warm-gray-50/50" : "bg-white"}`}
            >
              <td className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-warm-gray-400">{row.label}</td>
              {results.map((r) => {
                const value = r.shoe[row.key];
                const display = row.format ? row.format(value) : value;
                return (
                  <td key={r.shoe.id} className="px-5 py-3 font-medium text-topo-black capitalize">
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
