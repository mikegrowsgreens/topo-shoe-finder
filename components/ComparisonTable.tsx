"use client";

import { ScoredShoe } from "@/lib/types";
import { useCaseLabel } from "@/lib/labels";

interface ComparisonTableProps {
  results: ScoredShoe[];
}

const rankBadge = {
  best: "bg-teal text-white",
  great: "bg-navy text-white",
  good: "bg-warm-gray-600 text-white",
};

function yesNo(v: boolean): string {
  return v ? "Yes" : "No";
}

export default function ComparisonTable({ results }: ComparisonTableProps) {
  if (results.length === 0) return null;

  const rows: { label: string; value: (r: ScoredShoe) => string }[] = [
    { label: "Category", value: (r) => (r.shoe.category === "road" ? "Road" : "Trail") },
    { label: "Best For", value: (r) => useCaseLabel[r.shoe.useCases[0]] ?? "—" },
    { label: "Stack Height", value: (r) => r.shoe.stack },
    { label: "Drop", value: (r) => `${r.shoe.dropMm}mm` },
    { label: "Weight", value: (r) => `${(r.selectedVariant ?? r.shoe).weightOz} oz` },
    { label: "Cushion", value: (r) => r.shoe.cushion },
    { label: "Support", value: (r) => r.shoe.support },
    { label: "Rock Plate", value: (r) => yesNo(r.shoe.features.rockPlate) },
    { label: "Vibram Outsole", value: (r) => yesNo(r.shoe.features.vibram) },
    {
      label: "Waterproof",
      value: (r) =>
        r.selectedVariant || r.shoe.features.waterproof
          ? "Yes"
          : (r.shoe.variants ?? []).some((v) => v.type === "waterproof")
            ? "Available"
            : "No",
    },
    { label: "Wide Available", value: (r) => yesNo(r.shoe.features.wideAvailable) },
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
                    {r.crossSell ? "bonus" : r.rank}
                  </span>
                  <span className="text-base font-extrabold text-navy">
                    {r.selectedVariant ? r.selectedVariant.name : r.shoe.name}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.label}
              className={`border-b border-warm-gray-200/50 ${i % 2 === 0 ? "bg-warm-gray-50/50" : "bg-white"}`}
            >
              <td className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-warm-gray-400">{row.label}</td>
              {results.map((r) => (
                <td key={r.shoe.id} className="px-5 py-3 font-medium text-topo-black capitalize">
                  {row.value(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
