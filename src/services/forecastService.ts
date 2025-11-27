// src/services/forecastService.ts
import { db } from "../config/firebase";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { predictDemand } from "./demandApi";
import { getGeminiSummary } from "./geminiService";
import { getLastNDays } from "../utils/featureHelpers";

export async function generateWeeklyForecast(shopId: string) {
  const q = query(
    collection(db, "sales"),
    where("uid", "==", shopId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);
  const sales = snap.docs.map((doc) => ({
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as any[];

  if (sales.length === 0) {
    return {
      weeklyDemand: 0,
      topItems: [],
      lowItems: [],
      forecastText: "No sales data found to generate forecast.",
    };
  }

  const last30 = getLastNDays(sales, 30);
  const last7 = getLastNDays(sales, 7);

  const lag_1 = sales[0]?.quantity || 0;
  const lag_7 = last7[last7.length - 1]?.quantity || 0;

  const r7_mean = last7.reduce((s, x) => s + (x.quantity || 0), 0) / (last7.length || 1);
  const r30_mean = last30.reduce((s, x) => s + (x.quantity || 0), 0) / (last30.length || 1);

  const ml = await predictDemand({
    lag_1,
    lag_7,
    r7_mean,
    r30_mean,
    temp_c: 28,
    is_event_day: 0,
  });

  const daily = ml.prediction || 0;
  const weeklyDemand = Math.round(daily * 7);

  // Top / slow items
  const itemMap: Record<string, number> = {};
  last7.forEach((s) => {
    itemMap[s.item] = (itemMap[s.item] || 0) + s.quantity;
  });

  const sorted = Object.entries(itemMap).sort((a, b) => b[1] - a[1]);
  const topItems = sorted.slice(0, 3).map(([i]) => i);
  const lowItems = sorted.slice(-3).map(([i]) => i);

  const forecastText = await getGeminiSummary({
    weeklyDemand,
    topItems,
    lowItems,
  });

  return {
    weeklyDemand,
    topItems,
    lowItems,
    forecastText,
  };
}
