// src/utils/featureHelpers.ts
export function getLastNDays(sales: any[], n: number) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

  return sales.filter((s) => {
    const t = s.createdAt;
    return t && t >= cutoff;
  });
}
