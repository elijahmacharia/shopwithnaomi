export function distinctHighlights<T extends { id: string }>(shelf: T[], popular: T[], newest: T[]) {
  const seen = new Set<string>();
  function take(items: T[], limit: number) {
    const chosen: T[] = [];
    for (const item of items) {
      if (seen.has(item.id)) {
        continue;
      }
      seen.add(item.id);
      chosen.push(item);
      if (chosen.length >= limit) {
        break;
      }
    }
    return chosen;
  }
  return {
    shelf: take(shelf, 8),
    popular: take(popular, 4),
    newest: take(newest, 4),
  };
}
