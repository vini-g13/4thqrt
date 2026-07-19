"use client";

import { useEffect, useState } from "react";
import { products as fallbackProducts, type Product } from "@/lib/products";

export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    let cancelled = false;
    async function refresh() {
      try {
        const response = await fetch("/api/catalog", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled && response.ok && Array.isArray(data.products)) setProducts(data.products);
      } catch {
        // De veilige lokale catalogus blijft zichtbaar wanneer de service tijdelijk niet bereikbaar is.
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, 20_000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, []);

  return products;
}
