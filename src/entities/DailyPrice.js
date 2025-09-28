import { sortRecords, filterRecords, take } from "./utils";
import dataset from "@/data/dailyPrices.json";

const records = dataset.map((item, index) => ({ id: index + 1, ...item }));

export const DailyPrice = {
  async list(sort, limit) {
    const sorted = sortRecords(records, sort);
    return take(sorted, limit);
  },

  async filter(filters, sort, limit) {
    const filtered = filterRecords(records, filters);
    const sorted = sortRecords(filtered, sort);
    return take(sorted, limit);
  },
};
