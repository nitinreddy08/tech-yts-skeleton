"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Slider from "@radix-ui/react-slider";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Smartphone, Laptop, Headphones, Tablet, Search } from "lucide-react";

const CATEGORIES = [
  { slug: "smartphones", label: "Phones", icon: Smartphone, maxPrice: 200000 },
  { slug: "laptops", label: "Laptops", icon: Laptop, maxPrice: 300000 },
  {
    slug: "headphones",
    label: "Headphones",
    icon: Headphones,
    maxPrice: 50000,
  },
  { slug: "tablets", label: "Tablets", icon: Tablet, maxPrice: 150000 },
] as const;

const PRICE_PRESETS = [
  { label: "Under ₹15K", min: 0, max: 15000 },
  { label: "₹15K–30K", min: 15000, max: 30000 },
  { label: "₹30K–60K", min: 30000, max: 60000 },
  { label: "₹60K–1L", min: 60000, max: 100000 },
  { label: "Over ₹1L", min: 100000, max: 999999 },
];

const POPULAR_FEATURES = [
  { label: "5G", href: "/search?q=5g&category=smartphones" },
  { label: "8GB+ RAM", href: "/search?q=8gb&category=smartphones" },
  { label: "120Hz display", href: "/search?q=120hz&category=smartphones" },
  { label: "AI phones", href: "/search?q=ai&category=smartphones" },
  { label: "Top rated 9+", href: "/search?minRating=9&sort=rating_desc" },
];

const MIN_PRICE = 0;
const STEP = 1000;

function fmt(v: number) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(v % 100000 === 0 ? 0 : 1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

export function HeroFinder() {
  const [category, setCategory] =
    useState<(typeof CATEGORIES)[number]["slug"]>("smartphones");
  const catConfig = CATEGORIES.find((c) => c.slug === category)!;
  const MAX_PRICE = catConfig.maxPrice;

  const [range, setRange] = useState([MIN_PRICE, MAX_PRICE]);
  const [resultCount, setResultCount] = useState<number | null>(null);
  const router = useRouter();

  const [min, max] = range;

  useEffect(() => {
    setRange([MIN_PRICE, MAX_PRICE]);
    setResultCount(null);
  }, [category, MAX_PRICE]);

  const fetchCount = useCallback(
    async (minP: number, maxP: number) => {
      const params = new URLSearchParams();
      params.set("category", category);
      params.set("limit", "50");
      if (minP > MIN_PRICE) params.set("minPrice", String(minP));
      if (maxP < MAX_PRICE) params.set("maxPrice", String(maxP));
      try {
        const res = await fetch(`/api/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setResultCount(Array.isArray(data) ? data.length : 0);
        }
      } catch {
        setResultCount(null);
      }
    },
    [category, MAX_PRICE],
  );

  useEffect(() => {
    const timer = setTimeout(() => fetchCount(min, max), 400);
    return () => clearTimeout(timer);
  }, [min, max, fetchCount]);

  function applyPreset(minP: number, maxP: number) {
    const cappedMax = Math.min(maxP, MAX_PRICE);
    setRange([minP, Math.max(minP + STEP, cappedMax)]);
  }

  function handleFind() {
    const params = new URLSearchParams();
    params.set("category", category);
    if (min > MIN_PRICE) params.set("minPrice", String(min));
    if (max < MAX_PRICE) params.set("maxPrice", String(max));
    router.push(`/search?${params.toString()}`);
  }

  const activePreset = PRICE_PRESETS.find(
    (p) => p.min === min && p.max === max,
  );
  // The count comes from a capped (50) search, so say "50+" rather than imply an exact total.
  const countLabel =
    resultCount != null && resultCount >= 50
      ? "50+"
      : String(resultCount ?? "");
  const noMatches = resultCount === 0;

  return (
    <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-h3 font-heading text-primary">
            Find your perfect gadget
          </h2>
          {resultCount != null && (
            <p className="shrink-0 text-xs text-muted" aria-live="polite">
              <span className="font-semibold text-primary">{countLabel}</span>{" "}
              {resultCount === 1 ? "match" : "matches"}
            </p>
          )}
        </div>

        <div
          role="group"
          aria-label="Category"
          className="flex flex-wrap gap-1.5"
        >
          {CATEGORIES.map(({ slug, label, icon: Icon }) => (
            <Chip
              key={slug}
              onClick={() => setCategory(slug)}
              active={category === slug}
              aria-pressed={category === slug}
            >
              <Icon size={14} aria-hidden />
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-primary" id="budget-label">
          Budget
        </p>
        <div
          role="group"
          aria-labelledby="budget-label"
          className="flex flex-wrap gap-1.5"
        >
          {PRICE_PRESETS.filter((p) => p.min < MAX_PRICE).map((preset) => (
            <Chip
              key={preset.label}
              onClick={() =>
                applyPreset(preset.min, Math.min(preset.max, MAX_PRICE))
              }
              active={activePreset?.label === preset.label}
              aria-pressed={activePreset?.label === preset.label}
            >
              {preset.label}
            </Chip>
          ))}
        </div>

        <Slider.Root
          className="relative mt-1 mb-0.5 flex h-9 w-full touch-none select-none items-center"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={range}
          onValueChange={setRange}
          minStepsBetweenThumbs={1}
        >
          <Slider.Track className="relative h-2 grow rounded-full bg-border">
            <Slider.Range className="absolute h-full rounded-full bg-accent" />
          </Slider.Track>
          <Slider.Thumb
            className="block h-6 w-6 cursor-grab rounded-full border-2 border-white bg-accent shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:cursor-grabbing after:absolute after:-inset-2 after:content-['']"
            aria-label="Minimum price"
          />
          <Slider.Thumb
            className="block h-6 w-6 cursor-grab rounded-full border-2 border-white bg-accent shadow-md transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:cursor-grabbing after:absolute after:-inset-2 after:content-['']"
            aria-label="Maximum price"
          />
        </Slider.Root>
        <p className="text-center text-xs font-semibold text-primary">
          {fmt(min)} – {max >= MAX_PRICE ? `${fmt(MAX_PRICE)}+` : fmt(max)}
        </p>
      </div>

      <Button onClick={handleFind} disabled={noMatches} className="w-full">
        <Search size={16} aria-hidden />
        {noMatches
          ? "Nothing in this range — widen it"
          : resultCount != null
            ? `Show ${countLabel} ${catConfig.label}`
            : `Find ${catConfig.label}`}
      </Button>

      {category === "smartphones" && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted">Popular:</span>
          {POPULAR_FEATURES.map(({ label, href }) => (
            <Chip key={href} href={href}>
              {label}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}
