import React, { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SplashScreen from './SplashScreen';

const VALID_USER = {
  username: 'ander.dps',
  email: 'ander.dps@email.com',
  password: 'holamundo503',
};

export default function LoginScreen({ onLoginSuccess }) {
  const [showSplash, setShowSplash] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const slideAnim = useRef(new Animated.Value(35)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showSplash) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSplash]);

  const handleLogin = () => {
    const value = emailOrUsername.trim().toLowerCase();
    const isValidUser = value === VALID_USER.username || value === VALID_USER.email;
    const isValidPassword = password === VALID_USER.password;

    if (!value || !password) {
      setError('Completa usuario/correo y contraseña.');
      return;
    }

    if (isValidUser && isValidPassword) {
      setError('');
      onLoginSuccess?.();
      return;
    }

    setError('Credenciales incorrectas. Intenta de nuevo.');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.title}>CHAMP TEAM</Text>
        <Text style={styles.subtitle}>¡Bienvenido de nuevo!</Text>

        <Animated.View style={[styles.card, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}> 
          <TextInput
            placeholder="Usuario o correo"
            placeholderTextColor="#999"
            style={styles.input}
            value={emailOrUsername}
            autoCapitalize="none"
            onChangeText={setEmailOrUsername}
            keyboardType="email-address"
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor="#999"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Iniciar sesión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerBtn} onPress={() => {}}>
            <Text style={styles.registerText}>Registrarse</Text>
          </TouchableOpacity>

          <Text style={styles.tips}>Usa: ander.dps o ander.dps@email.com + holamundo503</Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: '#CC0000' },
  inner: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { color: '#fff', fontSize: 34, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { color: '#fff', fontSize: 16, marginBottom: 20 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 18, padding: 16, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  input: { borderWidth: 1, borderColor: '#ededed', borderRadius: 10, padding: 12, marginBottom: 12, color: '#333', fontSize: 14 },
  error: { color: '#cc0000', fontSize: 13, marginBottom: 10 },
  loginBtn: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cc0000', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  loginText: { color: '#cc0000', fontWeight: '700', fontSize: 15 },
  registerBtn: { backgroundColor: '#cc0000', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 10 },
  registerText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  tips: { marginTop: 10, fontSize: 12, color: '#999', textAlign: 'center' },
});
