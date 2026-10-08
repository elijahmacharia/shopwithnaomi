export function getPage(value: string | undefined, pageSize = 20) {
  const page = Math.max(1, Number.parseInt(value ?? "1", 10) || 1);
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize));
}
