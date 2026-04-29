import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainContainer from './src/navigation/MainContainer';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';

const LOGIN_KEY = 'LOGIN_STATE';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const loadLoginState = async () => {
      try {
        const value = await AsyncStorage.getItem(LOGIN_KEY);
        setIsLoggedIn(value === 'true');
      } catch (err) {
        console.log('Error reading login state', err);
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
    await AsyncStorage.removeItem(LOGIN_KEY);
    setIsLoggedIn(false);
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

  return (
    <NavigationContainer>
      <MainContainer onLogout={handleLogout} />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
