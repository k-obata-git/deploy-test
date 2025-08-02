export function sortBy<T>(items: T[], key: keyof T, asc = true): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal === bVal) return 0;
    if (asc) return aVal > bVal ? 1 : -1;
    return aVal < bVal ? 1 : -1;
  });
}
