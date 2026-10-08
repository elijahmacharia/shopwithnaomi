export type CartLine = {
  productId: string;
  quantity: number;
};

const STORAGE_KEY = "shopwithnaomi.cart";

export function addToCart(lines: CartLine[], productId: string): CartLine[] {
  const existing = lines.find((line) => line.productId === productId);
  if (!existing) {
    return [...lines, { productId, quantity: 1 }];
  }
  return lines.map((line) =>
    line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
  );
}

export function setQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  if (quantity <= 0) {
    return lines.filter((line) => line.productId !== productId);
  }
  return lines.map((line) => (line.productId === productId ? { ...line, quantity } : line));
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartTotal(lines: CartLine[], priceOf: (productId: string) => number): number {
  return lines.reduce((total, line) => total + priceOf(line.productId) * line.quantity, 0);
}

export function parseCart(raw: string | null): CartLine[] {
  if (!raw) {
    return [];
  }
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) {
      return [];
    }
    return data.flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return [];
      }
      const productId = "productId" in entry ? entry.productId : undefined;
      const quantity = "quantity" in entry ? entry.quantity : undefined;
      if (typeof productId !== "string" || productId.length === 0) {
        return [];
      }
      if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0) {
        return [];
      }
      return [{ productId, quantity }];
    });
  } catch {
    return [];
  }
}

export function loadCart(): CartLine[] {
  if (typeof localStorage === "undefined") {
    return [];
  }
  return parseCart(localStorage.getItem(STORAGE_KEY));
}

export function saveCart(lines: CartLine[]): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
}
