// ============================================================
// ARCHIVO: src/screens/LoginScreen.js
// DESCRIPCIÓN: Pantalla de Login y Registro con Supabase Auth
//
// ¿QUÉ HACE ESTE ARCHIVO?
//   1. Muestra un formulario de Login (correo + contraseña)
//   2. Muestra un formulario de Registro (username + correo + contraseña)
//   3. Al hacer login: verifica credenciales contra Supabase Auth
//   4. Al registrarse: crea el usuario en Supabase Auth Y guarda
//      sus datos (id, email, username, fecha) en la tabla "users"
//   5. Guarda el token de sesión (JWT) en expo-secure-store
//      para que la sesión persista aunque el usuario cierre la app
//
// LIBRERÍAS USADAS:
//   - expo-secure-store: almacenamiento seguro del token JWT
//   - @supabase/supabase-js: cliente de Supabase para Auth y BD
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store'; // Para guardar el token de forma segura
import { supabase } from '../services/supabase';  // Cliente de Supabase
import SplashScreen from './SplashScreen';

// Clave con la que se guarda el token en SecureStore
const SESSION_KEY = 'supabase_session';

export default function LoginScreen({ onLoginSuccess }) {
  const [showSplash, setShowSplash] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false); // true = registro, false = login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Solo se usa en registro
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Animaciones de entrada del formulario
  const slideAnim = useRef(new Animated.Value(35)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showSplash) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 550, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]).start();
    }
  }, [showSplash]);

  // ============================================================
  // FUNCIÓN: saveSession
  // Guarda el token JWT de Supabase en expo-secure-store
  // Esto permite que la sesión persista aunque se cierre la app
  // El token es un dato sensible, por eso se usa SecureStore
  // y NO AsyncStorage (que no está cifrado)
  // ============================================================
  const saveSession = async (session) => {
    try {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('No se pudo guardar la sesión en SecureStore:', e);
    }
  };

  // ============================================================
  // FUNCIÓN: handleLogin
  // Inicia sesión usando Supabase Auth con correo y contraseña
  // Si es exitoso, guarda el token en SecureStore y redirige
  // ============================================================
  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setError('Completa correo y contraseña.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    try {
      // Llamada a Supabase Auth para verificar credenciales
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        setError(translateError(authError.message));
        return;
      }

      // Si el login fue exitoso, guardamos el token en SecureStore
      if (data.session) {
        await saveSession(data.session);
      }

      onLoginSuccess?.(); // Redirige a la app principal
    } catch (e) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FUNCIÓN: handleRegister
  // Registra un nuevo usuario con 2 pasos:
  //   PASO 1: Crea el usuario en Supabase Auth (correo + contraseña)
  //   PASO 2: Guarda los datos del usuario en la tabla "users"
  //           (id, email, username, fecha_creacion)
  // ============================================================
  const handleRegister = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password || !username) {
      setError('Completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setError('');
    setInfo('');
    setLoading(true);

    try {
      // PASO 1: Crear usuario en Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        setError(translateError(authError.message));
        return;
      }

      // PASO 2: Guardar datos del usuario en la tabla "users" de Supabase
      // Usamos el id que genera Supabase Auth automáticamente
      if (data.user) {
        const { error: dbError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,              // UUID generado por Supabase Auth
              email: trimmedEmail,           // Correo del usuario
              username: username,            // Nombre de usuario ingresado
              fecha_creacion: new Date().toISOString(), // Fecha actual
            });

        if (dbError) {
          console.warn('Error al guardar en tabla users:', dbError.message);
        }
      }

      // Si no requiere confirmación de correo, inicia sesión directo
      if (data.session) {
        await saveSession(data.session);
        onLoginSuccess?.();
      } else {
        // Si requiere confirmación, muestra mensaje y vuelve al login
        setInfo('¡Registro exitoso! Ya puedes iniciar sesión.');
        setIsRegisterMode(false);
      }

    } catch (e) {
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  // Traduce mensajes de error de Supabase al español
  const translateError = (msg) => {
    if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
    if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
    if (msg.includes('User already registered')) return 'Este correo ya está registrado.';
    if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
    if (msg.includes('Unable to validate email')) return 'Correo electrónico inválido.';
    return msg;
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    setInfo('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
      <KeyboardAvoidingView
          style={styles.outer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <Text style={styles.title}>CHAMP TEAM</Text>
          <Text style={styles.subtitle}>
            {isRegisterMode ? 'Crea tu cuenta' : '¡Bienvenido de nuevo!'}
          </Text>

          <Animated.View
              style={[styles.card, { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Campo username — solo visible en modo registro */}
            {isRegisterMode && (
                <TextInput
                    placeholder="Nombre de usuario"
                    placeholderTextColor="#999"
                    style={styles.input}
                    value={username}
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    editable={!loading}
                />
            )}

            <TextInput
                placeholder="Correo electrónico"
                placeholderTextColor="#999"
                style={styles.input}
                value={email}
                autoCapitalize="none"
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
            />
            <TextInput
                placeholder="Contraseña"
                placeholderTextColor="#999"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
            {info ? <Text style={styles.info}>{info}</Text> : null}

            <TouchableOpacity
                style={[styles.loginBtn, loading && styles.btnDisabled]}
                onPress={isRegisterMode ? handleRegister : handleLogin}
                disabled={loading}
            >
              {loading ? (
                  <ActivityIndicator color="#cc0000" />
              ) : (
                  <Text style={styles.loginText}>
                    {isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}
                  </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.registerBtn, loading && styles.btnDisabled]}
                onPress={toggleMode}
                disabled={loading}
            >
              <Text style={styles.registerText}>
                {isRegisterMode ? 'Ya tengo cuenta' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
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
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ededed',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: '#333',
    fontSize: 14,
  },
  error: { color: '#cc0000', fontSize: 13, marginBottom: 10 },
  info: { color: '#2e7d32', fontSize: 13, marginBottom: 10 },
  loginBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cc0000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    minHeight: 46,
    justifyContent: 'center',
  },
  loginText: { color: '#cc0000', fontWeight: '700', fontSize: 15 },
  registerBtn: {
    backgroundColor: '#cc0000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 46,
    justifyContent: 'center',
  },
  registerText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.6 },
});