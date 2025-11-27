// src/services/demandApi.ts
import axios from "axios";

export const API_URL = "https://demandai-api.onrender.com"; // <- change if needed

// payload fields — make them optional because we compute these on client
export type PredictPayload = {
  lag_1?: number;
  lag_7?: number;
  r7_mean?: number;
  r30_mean?: number;
  temp_c?: number | null;
  is_event_day?: 0 | 1;
};

// Normalized payload sent to server (all fields included)
function normalizePayload(p: Partial<PredictPayload>) {
  return {
    lag_1: Number(p.lag_1 ?? 0),
    lag_7: Number(p.lag_7 ?? 0),
    r7_mean: Number(p.r7_mean ?? 0),
    r30_mean: Number(p.r30_mean ?? 0),
    // allow null for temp if unknown
    temp_c: p.temp_c === undefined ? null : (p.temp_c === null ? null : Number(p.temp_c)),
    is_event_day: p.is_event_day === 1 ? 1 : 0,
  };
}

/**
 * predictDemand
 * - Accepts partial PredictPayload (helpers will fill defaults)
 * - Returns number | null
 */
export async function predictDemand(payload: Partial<PredictPayload>): Promise<number | null> {
  try {
    const body = normalizePayload(payload);
    const res = await axios.post(`${API_URL}/predict`, body, { timeout: 10000 });
    // If your server returns { prediction: <num> }, handle both cases
    if (res?.data?.prediction !== undefined && res.data.prediction !== null) {
      return Number(res.data.prediction);
    }
    // maybe server returns raw number
    if (typeof res?.data === "number") return res.data;
    return null;
  } catch (err: any) {
    console.warn("predictDemand error:", err?.message ?? err);
    return null;
  }
}

/**
 * fetchTemperature - optional helper that calls your server weather endpoint if you created one.
 * If you didn't expose /weather, this will gracefully return null.
 */
export async function fetchTemperature(lat: number, lon: number): Promise<number | null> {
  try {
    const res = await axios.get(`${API_URL}/weather`, { params: { lat, lon }, timeout: 8000 });
    if (res?.data?.temp !== undefined && res.data.temp !== null) return Number(res.data.temp);
  } catch (err) {
    // ignore
  }
  return null;
}
