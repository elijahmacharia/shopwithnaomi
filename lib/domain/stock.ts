export function assertSufficientStock(available: number, requested: number, productName: string): void {
  if (!Number.isInteger(requested) || requested <= 0) {
    throw new Error("Enter a valid quantity.");
  }
  if (available < requested) {
    throw new Error(available <= 0 ? `${productName} is out of stock.` : `Only ${available} units of ${productName} are available.`);
  }
}

export function isLowStock(current: number, minimum: number): boolean {
  return current <= minimum;
}

export function stockAfterSale(current: number, sold: number): number {
  assertSufficientStock(current, sold, "This product");
  return current - sold;
}
