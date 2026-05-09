import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  subscribe,
} from "../services/favoritesStore";
import { getTeamBadge } from "../services/sportsApi";
import { useTheme } from "../context/ThemeContext";

const BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

const LEAGUES = [
  { id: "4328", name: "Premier League", sport: "Fútbol" },
  { id: "4335", name: "La Liga", sport: "Fútbol" },
  { id: "4332", name: "Serie A", sport: "Fútbol" },
  { id: "4334", name: "Ligue 1", sport: "Fútbol" },
  { id: "4387", name: "NBA", sport: "Baloncesto" },
  { id: "4391", name: "NFL", sport: "Fútbol Americano" },
  { id: "4424", name: "MLB", sport: "Baseball" },
  { id: "4380", name: "NHL", sport: "Hockey" },
];

export default function PerfilScreen({ onLogout }) {
  const { dark, colors, toggleTheme } = useTheme();
  const [favorites, setFavorites] = useState(getFavorites());
  const [showSuggested, setShowSuggested] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [badges, setBadges] = useState({});
  const [availableBadges, setAvailableBadges] = useState({});
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem("profile_image");
        if (savedImage) setProfileImage(savedImage);
      } catch (err) {
        console.log("Error loading profile image:", err);
      }
    };
    loadProfileImage();
  }, []);

  const handlePickImage = async () => {
    if (Platform.OS === "web") {
      pickFromGallery();
      return;
    }

    Alert.alert(
      "Foto de Perfil",
      "Selecciona una opción",
      [
        {
          text: "Tomar Foto",
          onPress: takePhoto,
        },
        {
          text: "Elegir de Galería",
          onPress: pickFromGallery,
        },
        {
          text: "Eliminar Foto",
          onPress: removePhoto,
          style: "destructive",
        },
        { text: "Cancelar", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Lo sentimos, necesitamos permisos de cámara para hacer esto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem("profile_image", uri);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Lo sentimos, necesitamos permisos de galería para hacer esto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setProfileImage(uri);
      await AsyncStorage.setItem("profile_image", uri);
    }
  };

  const removePhoto = async () => {
    setProfileImage(null);
    await AsyncStorage.removeItem("profile_image");
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const results = await Promise.all(
          LEAGUES.map(async (l) => {
            const res = await fetch(
              `${BASE_URL}/eventspastleague.php?id=${l.id}`,
            );
            const data = await res.json();
            return (data.events || []).slice(0, 3).flatMap((e) => [
              {
                id: `${e.strHomeTeam}`,
                name: e.strHomeTeam,
                league: l.name,
                code: e.strHomeTeam.substring(0, 3).toUpperCase(),
              },
              {
                id: `${e.strAwayTeam}`,
                name: e.strAwayTeam,
                league: l.name,
                code: e.strAwayTeam.substring(0, 3).toUpperCase(),
              },
            ]);
          }),
        );
        const flat = results.flat();
        const unique = flat.filter(
          (t, i) => flat.findIndex((x) => x.id === t.id) === i,
        );
        setAvailableTeams(unique);
      } catch (err) {
        console.log("ERROR:", err.message);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe((updated) => setFavorites([...updated]));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      const newBadges = {};
      await Promise.all(
        favorites.map(async (team) => {
          const url = await getTeamBadge(team.name);
          if (url) newBadges[team.id] = url;
        }),
      );
      setBadges(newBadges);
    };
    fetchBadges();
  }, [favorites]);

  useEffect(() => {
    const fetchAvailableBadges = async () => {
      const newBadges = {};
      await Promise.all(
        availableTeams.map(async (team) => {
          const url = await getTeamBadge(team.name);
          if (url) newBadges[team.id] = url;
        }),
      );
      setAvailableBadges(newBadges);
    };
    if (availableTeams.length > 0) fetchAvailableBadges();
  }, [availableTeams]);

  const handleRemove = (teamId) => {
    Alert.alert(
      "Eliminar favorito",
      "¿Quieres eliminar este equipo de tus favoritos?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => removeFavorite(teamId),
        },
      ],
    );
  };

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    profileSection: {
      alignItems: "center",
      backgroundColor: colors.card,
      paddingVertical: 24,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: dark ? "#333" : "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
      borderWidth: 3,
      borderColor: colors.primary,
    },
    cameraIconContainer: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.primary,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: colors.card,
    },
    userName: { fontSize: 20, fontWeight: "bold", color: colors.text },
    userEmail: { fontSize: 14, color: colors.secondary, marginTop: 4 },
    statBox: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
    },
    section: {
      backgroundColor: colors.card,
      margin: 15,
      borderRadius: 12,
      padding: 15,
    },
    sectionTitle: { fontSize: 16, fontWeight: "bold", color: colors.text },
    addBtn: { color: colors.primary, fontWeight: "600", fontSize: 15 },
    emptyText: {
      color: colors.secondary,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 16,
      lineHeight: 22,
    },
    teamRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    teamBadge: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    teamName: { fontSize: 15, fontWeight: "600", color: colors.text },
    teamLeague: { fontSize: 13, color: colors.secondary, marginTop: 2 },
    chevron: { fontSize: 22, color: colors.secondary },
    suggestedBox: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    notifText: { fontSize: 15, color: colors.text },
    logoutBtn: {
      marginTop: 12,
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <View style={dynamicStyles.profileSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={handlePickImage}>
          <View style={dynamicStyles.avatar}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.avatarText}>👤</Text>
            )}
          </View>
          <View style={dynamicStyles.cameraIconContainer}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={dynamicStyles.userName}>Ander (DPS)</Text>
        <Text style={dynamicStyles.userEmail}>ander.dps@email.com</Text>
        <TouchableOpacity style={dynamicStyles.logoutBtn} onPress={() => onLogout?.()}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={dynamicStyles.statBox}>
          <Text style={styles.statNumber}>{favorites.length}</Text>
          <Text style={styles.statLabel}>Equipos{"\n"}Favoritos</Text>
        </View>
        <View style={dynamicStyles.statBox}>
          <Text style={styles.statNumber}>47</Text>
          <Text style={styles.statLabel}>Partidos{"\n"}Seguidos</Text>
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>🌙 Modo Oscuro</Text>
          <Switch
            value={dark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: colors.primary }}
            thumbColor={dark ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <View style={dynamicStyles.section}>
        <View style={styles.sectionHeader}>
          <Text style={dynamicStyles.sectionTitle}>⭐ Equipos Favoritos</Text>
          <TouchableOpacity onPress={() => setShowSuggested(!showSuggested)}>
            <Text style={dynamicStyles.addBtn}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {favorites.length === 0 && (
          <Text style={dynamicStyles.emptyText}>
            No tienes equipos favoritos aún.{"\n"}Agrégalos desde los partidos
            ⭐
          </Text>
        )}

        {favorites.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={dynamicStyles.teamRow}
            onLongPress={() => handleRemove(team.id)}
          >
            <View style={dynamicStyles.teamBadge}>
              {badges[team.id] ? (
                <Image
                  source={{ uri: badges[team.id] }}
                  style={styles.badgeImage}
                  resizeMode="contain"
                />
              ) : (
                <Text style={styles.teamBadgeText}>{team.code}</Text>
              )}
            </View>
            <View style={styles.teamInfo}>
              <Text style={dynamicStyles.teamName}>{team.name}</Text>
              <Text style={dynamicStyles.teamLeague}>{team.league}</Text>
            </View>
            <Text style={dynamicStyles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {showSuggested && (
          <View style={dynamicStyles.suggestedBox}>
            <Text style={styles.suggestedTitle}>Equipos disponibles</Text>
            {availableTeams
              .filter((t) => !favorites.find((f) => f.id === t.id))
              .map((team) => (
                <TouchableOpacity
                  key={team.id}
                  style={styles.suggestedRow}
                  onPress={() => {
                    addFavorite(team);
                    setShowSuggested(false);
                  }}
                >
                  <View style={dynamicStyles.teamBadge}>
                    {availableBadges[team.id] ? (
                      <Image
                        source={{ uri: availableBadges[team.id] }}
                        style={styles.badgeImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.teamBadgeText}>{team.code}</Text>
                    )}
                  </View>
                  <View style={styles.teamInfo}>
                    <Text style={dynamicStyles.teamName}>{team.name}</Text>
                    <Text style={dynamicStyles.teamLeague}>{team.league}</Text>
                  </View>
                  <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </View>

      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>🔔 Notificaciones</Text>
        <View style={styles.notifRow}>
          <Text style={dynamicStyles.notifText}>Resultados en vivo</Text>
          <View style={styles.toggleOn}>
            <Text style={styles.toggleText}>ON</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  cameraIcon: {
    fontSize: 14,
  },
  avatarText: { fontSize: 36 },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginTop: 15,
    gap: 15,
  },
  statNumber: { fontSize: 28, fontWeight: "bold", color: "#fff" },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  teamBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  badgeImage: { width: 34, height: 34 },
  teamInfo: { flex: 1 },
  suggestedTitle: { fontSize: 13, color: "#999", marginBottom: 8 },
  suggestedRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  addIcon: { fontSize: 22, color: "#f4511e", fontWeight: "bold" },
  notifRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  toggleOn: {
    backgroundColor: "#f4511e",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  toggleText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
});
