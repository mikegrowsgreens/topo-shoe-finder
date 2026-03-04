"use client";

import { ScoredShoe } from "@/lib/types";
import images from "@/data/images.json";

interface ResultCardProps {
  result: ScoredShoe;
}

const rankConfig = {
  best: {
    label: "Best Match",
    badgeClass: "bg-teal text-white",
    ringClass: "ring-2 ring-teal/30",
    headerBg: "bg-gradient-to-r from-teal to-teal-dark",
  },
  great: {
    label: "Great Match",
    badgeClass: "bg-navy text-white",
    ringClass: "ring-2 ring-navy/20",
    headerBg: "bg-gradient-to-r from-navy to-navy/80",
  },
  good: {
    label: "Good Match",
    badgeClass: "bg-warm-gray-600 text-white",
    ringClass: "ring-1 ring-warm-gray-200",
    headerBg: "bg-gradient-to-r from-warm-gray-600 to-warm-gray-400",
  },
};

export default function ResultCard({ result }: ResultCardProps) {
  const { shoe, rank, matchReasons } = result;
  const config = rankConfig[rank];
  const imageData = images[shoe.id as keyof typeof images];

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ${config.ringClass} transition-all hover:shadow-xl`}>
      {/* Colored header bar */}
      <div className={`${config.headerBg} px-5 py-3 flex items-center justify-between`}>
        <span className="text-sm font-bold text-white uppercase tracking-wide">
          {config.label}
        </span>
        <span className="text-xs font-medium text-white/70 uppercase tracking-wide">
          {shoe.category === "road" ? "Road" : "Trail"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Product Image */}
        <div className="relative mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-warm-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageData?.hero || "/fallback/placeholder.svg"}
            alt={imageData?.alt || `${shoe.name} shoe`}
            className="h-full w-full object-contain p-4"
            loading={rank === "best" ? "eager" : "lazy"}
          />
        </div>

        {/* Name & Description — fixed height so cards align below */}
        <h3 className="text-2xl font-extrabold tracking-tight text-navy">{shoe.name}</h3>
        <p className="mt-1 min-h-[3rem] text-sm leading-relaxed text-warm-gray-600">{shoe.description}</p>

        {/* Spec Grid — fixed height cells */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {[
            { label: "Stack", value: shoe.stack },
            { label: "Drop", value: shoe.drop },
            { label: "Weight", value: shoe.weight },
            { label: "Best For", value: shoe.bestFor },
          ].map((spec) => (
            <div key={spec.label} className="flex h-14 flex-col justify-center rounded-lg bg-warm-gray-50 px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wide text-warm-gray-400">{spec.label}</span>
              <p className="text-sm font-bold capitalize leading-tight text-topo-black">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Match Reasons — grows to push CTA down */}
        <ul className="mt-4 flex-1 space-y-2" aria-label="Why this shoe matches">
          {matchReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-warm-gray-600">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        {/* CTA Buttons — always pinned to bottom */}
        <div className="mt-5 flex gap-2">
          <a
            href={shoe.pdpMens}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl bg-teal px-4 py-3 text-center font-bold text-white transition-all hover:bg-teal-dark hover:shadow-md active:scale-[0.98]"
            aria-label={`View ${shoe.name} Men's`}
          >
            Shop Men&apos;s
          </a>
          <a
            href={shoe.pdpWomens}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-xl border-2 border-navy px-4 py-3 text-center font-bold text-navy transition-all hover:bg-navy hover:text-white hover:shadow-md active:scale-[0.98]"
            aria-label={`View ${shoe.name} Women's`}
          >
            Shop Women&apos;s
          </a>
        </div>
      </div>
    </div>
  );
}
