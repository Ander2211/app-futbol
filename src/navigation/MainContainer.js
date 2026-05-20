import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Import Navigation & Screens
import StackNavigator from "./StackNavigator";
import PerfilScreen from "../screens/Perfil";
import CalendarioScreen from "../screens/CalendarioScreen";
import ResultadosScreen from "../screens/ResultadosScreen";
import EstadiosScreen from "../screens/EstadiosScreen";

// Screen Names
const homeName = "Inicio";
const resultsName = "Resultados";
const stadiumsName = "Estadios";
const profileName = "Perfil";
const calendarName = "Calendario";

const Tab = createBottomTabNavigator();

function MainContainer({ onLogout }) {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let rn = route.name;

          if (rn === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (rn === resultsName) {
            iconName = focused ? "trophy" : "trophy-outline";
          } else if (rn === stadiumsName) {
            iconName = focused ? "location" : "location-outline";
          } else if (rn === profileName) {
            iconName = focused ? "person" : "person-outline";
          } else if (rn === calendarName) {
            iconName = focused ? "calendar" : "calendar-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
        tabBarStyle: { 
          padding: 10, 
          height: 70, 
          backgroundColor: colors.card,
          borderTopColor: colors.border
        },
        headerShown: false, // Ocultamos el header del Tab para que el Stack tome el control
      })}
    >
      <Tab.Screen name={homeName} component={StackNavigator} />
      <Tab.Screen
        name={resultsName}
        component={ResultadosScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name={stadiumsName}
        component={EstadiosScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
      <Tab.Screen
        name={profileName}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        {() => <PerfilScreen onLogout={onLogout} />}
      </Tab.Screen>
      <Tab.Screen
        name={calendarName}
        component={CalendarioScreen}
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      />
    </Tab.Navigator>
  );
}

export default MainContainer;
