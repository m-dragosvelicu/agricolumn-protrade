export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

const routeMap = {
  PortConstanta: "/port-constanta",
  DailyPrices: "/daily-prices",
  COTCFTC: "/cot-cftc",
  DGAgri: "/dg-agri",
};

export function createPageUrl(name) {
  if (routeMap[name]) {
    return routeMap[name];
  }

  const kebab = name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();

  return `/${kebab}`;
}
