// src/services/demandApi.ts
export const API_URL = "https://demandai-api.onrender.com";

export async function predictDemand(payload: any) {
  try {
    const res = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (err) {
    console.log("predictDemand error:", err);
    return { prediction: 0 };
  }
}
