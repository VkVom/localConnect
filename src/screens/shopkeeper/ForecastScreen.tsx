// src/screens/shopkeeper/ForecastScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { generateWeeklyForecast } from "../../services/forecastService";

export default function ForecastScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const result = await generateWeeklyForecast(user!.uid);
      setData(result);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📦 Weekly Demand Forecast</Text>

      <Text style={styles.text}>{data.forecastText}</Text>

      <View style={styles.box}>
        <Text style={styles.subtitle}>Top Selling Items</Text>
        {data.topItems.map((i: string) => (
          <Text key={i} style={styles.item}>
            • {i}
          </Text>
        ))}
      </View>

      <View style={styles.box}>
        <Text style={styles.subtitle}>Slow-Moving Items</Text>
        {data.lowItems.map((i: string) => (
          <Text key={i} style={styles.item}>
            • {i}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 10 },
  text: { fontSize: 16, color: "#334155", marginBottom: 20, lineHeight: 22 },
  box: {
    backgroundColor: "#f1f5f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
  },
  subtitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  item: { fontSize: 16, color: "#475569", marginBottom: 5 },
});
