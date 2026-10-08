export type Product = {
  id: string;
  name: string;
  priceCents: number;
  blurb: string;
  detail: string;
  swatch: string;
};

export const products: Product[] = [
  {
    id: "market-tote",
    name: "Market tote",
    priceCents: 240_000,
    blurb: "Heavy cotton, one deep pocket.",
    detail:
      "A sturdy everyday tote in undyed cotton. The base is double-stitched and the shoulder straps sit flat.",
    swatch: "#c4a484",
  },
  {
    id: "aa-coffee",
    name: "AA coffee, 250g",
    priceCents: 115_000,
    blurb: "Whole bean, medium roast.",
    detail:
      "A small-lot coffee with cocoa and citrus notes. Packed as whole beans so it stays fresh until you grind it.",
    swatch: "#6b3e2e",
  },
  {
    id: "ceramic-mug",
    name: "Ceramic mug",
    priceCents: 180_000,
    blurb: "Speckled clay, 300ml.",
    detail:
      "A wheel-thrown mug with a satin glaze. It holds about 300ml and is safe for the dishwasher.",
    swatch: "#d7c4b0",
  },
  {
    id: "beeswax-candle",
    name: "Beeswax candle",
    priceCents: 90_000,
    blurb: "Single wick, about 40 hours.",
    detail:
      "A poured beeswax candle with a cotton wick. Burn it on a stable surface and keep the wick trimmed.",
    swatch: "#e2b657",
  },
  {
    id: "cotton-scarf",
    name: "Cotton scarf",
    priceCents: 160_000,
    blurb: "Soft weave, two colours.",
    detail:
      "A lightweight scarf with a narrow stripe. It folds small enough for a bag and is easy to wash cold.",
    swatch: "#8c3a2f",
  },
];

export function findProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function formatPrice(priceCents: number): string {
  const shillings = priceCents / 100;
  return `KES ${shillings.toLocaleString("en-KE")}`;
}
