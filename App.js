import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './src/services/supabase';
import MainContainer from './src/navigation/MainContainer';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const LOGIN_KEY = 'LOGIN_STATE';
const SESSION_KEY = 'supabase_session';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { dark, colors } = useTheme();

  useEffect(() => {
    const loadLoginState = async () => {
      try {
        // 1. Verificar sesión guardada en SecureStore
        const storedSession = await SecureStore.getItemAsync(SESSION_KEY);
        if (storedSession) {
          const session = JSON.parse(storedSession);
          // Restaurar sesión en el cliente Supabase
          await supabase.auth.setSession(session);
          // Verificar que la sesión siga siendo válida
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            setIsLoggedIn(true);
            setIsInitialized(true);
            return;
          }
        }

        // 2. Fallback: revisar AsyncStorage (compatibilidad con versión anterior)
        const value = await AsyncStorage.getItem(LOGIN_KEY);
        if (value === 'true') {
          // Hay un estado de login antiguo, pero sin sesión Supabase → forzar re-login
          await AsyncStorage.removeItem(LOGIN_KEY);
        }
      } catch (err) {
        console.log('Error al cargar estado de sesión:', err);
      } finally {
        setIsInitialized(true);
      }
    };
    loadLoginState();
  }, []);

  const handleLoginSuccess = async () => {
    await AsyncStorage.setItem(LOGIN_KEY, 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync(SESSION_KEY);
      await AsyncStorage.removeItem(LOGIN_KEY);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    } finally {
      setIsLoggedIn(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isInitialized) {
    return null;
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const navigationTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
      <NavigationContainer theme={navigationTheme}>
        <MainContainer onLogout={handleLogout} />
        <StatusBar style={colors.statusBar} />
      </NavigationContainer>
  );
}

export default function App() {
  return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
  );
}