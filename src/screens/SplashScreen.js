import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, Animated } from "react-native";

export default function SplashScreen({ onFinish }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const loadingWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(loadingWidth, {
        toValue: 200,
        duration: 3800,
        useNativeDriver: false,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/logo.jpeg")}
        style={[styles.logo, { opacity }]}
        resizeMode="contain"
      />
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingBar, { width: loadingWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CC0000",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 250,
    height: 250,
    borderRadius: 40,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 80,
    width: 200,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  loadingBar: {
    height: 4,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
});
