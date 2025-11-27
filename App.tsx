// App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";

// Screens
import LoginScreen from "./src/screens/auth/LoginScreen";
import Welcome from "./src/screens/auth/Welcome";
import RegisterCustomer from "./src/screens/auth/RegisterCustomer";
import RegisterShopkeeper from "./src/screens/auth/RegisterShopkeeper";

import CustomerHome from "./src/screens/customer/Home";
import ShopDetails from "./src/screens/customer/ShopDetails";

import ShopkeeperDashboard from "./src/screens/shopkeeper/Dashboard";
import SalesLog from "./src/screens/shopkeeper/SalesLog";
import Inventory from "./src/screens/shopkeeper/Inventory";
import ForecastScreen from "./src/screens/shopkeeper/ForecastScreen";

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        (user as any).role === "shopkeeper" ? (
          <Stack.Group>
            <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboard} />
            <Stack.Screen name="SalesLog" component={SalesLog} />
            <Stack.Screen name="Inventory" component={Inventory} />
            <Stack.Screen name="Forecast" component={ForecastScreen} />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen name="CustomerHome" component={CustomerHome} />
            <Stack.Screen name="ShopDetails" component={ShopDetails} />
          </Stack.Group>
        )
      ) : (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="RegisterCustomer"
            component={RegisterCustomer}
            options={{
              headerShown: true,
              title: "Customer Signup",
              headerTintColor: "#2563eb",
            }}
          />
          <Stack.Screen
            name="RegisterShopkeeper"
            component={RegisterShopkeeper}
            options={{
              headerShown: true,
              title: "Partner Signup",
              headerTintColor: "#d97706",
            }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
});
