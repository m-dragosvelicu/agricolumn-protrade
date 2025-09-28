function toComparable(value) {
  if (value == null) return value;
  if (typeof value === "number") return value;
  const dateValue = Date.parse(value);
  if (!Number.isNaN(dateValue)) {
    return dateValue;
  }
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }
  return String(value).toLowerCase();
}

export function sortRecords(records, sort) {
  if (!sort) {
    return [...records];
  }

  const direction = sort.startsWith("-") ? -1 : 1;
  const key = sort.replace(/^[-+]/, "");

  return [...records].sort((a, b) => {
    const aVal = toComparable(a[key]);
    const bVal = toComparable(b[key]);

    if (aVal === bVal) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    if (aVal > bVal) return direction;
    if (aVal < bVal) return -direction;
    return 0;
  });
}

export function filterRecords(records, filters = {}) {
  const entries = Object.entries(filters);
  if (entries.length === 0) {
    return [...records];
  }

  return records.filter((record) =>
    entries.every(([key, value]) => {
      if (Array.isArray(value)) {
        return value.includes(record[key]);
      }
      return record[key] === value;
    })
  );
}

export function take(records, limit) {
  if (!limit || limit <= 0) {
    return [...records];
  }
  return records.slice(0, limit);
}
