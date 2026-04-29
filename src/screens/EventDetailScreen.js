import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { getEventDetail, getEventStats, getTeamBadge } from "../services/sportsApi";
import {
  isFavorite,
  addFavorite,
  removeFavorite,
  subscribe,
} from "../services/favoritesStore";

export default function EventDetailScreen({ event, onBack }) {
  const [detail, setDetail] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [homeIsFav, setHomeIsFav] = useState(isFavorite(event.homeTeam));
  const [awayIsFav, setAwayIsFav] = useState(isFavorite(event.awayTeam));
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setHomeIsFav(isFavorite(event.homeTeam));
      setAwayIsFav(isFavorite(event.awayTeam));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [detailData, statsData] = await Promise.all([
          getEventDetail(event.id),
          getEventStats(event.id),
        ]);
        setDetail(detailData);
        setStats(statsData);
      } catch (err) {
        console.log("ERROR:", err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchBadges = async () => {
      const newBadges = {};
      const homeImg = await getTeamBadge(event.homeTeam);
      const awayImg = await getTeamBadge(event.awayTeam);
      if (homeImg) newBadges[event.homeTeam] = homeImg;
      if (awayImg) newBadges[event.awayTeam] = awayImg;
      setBadges(newBadges);
    };

    fetchDetail();
    fetchBadges();
  }, [event.id, event.homeTeam, event.awayTeam]);

  const toggleFavorite = (teamName, league) => {
    const team = {
      id: teamName,
      name: teamName,
      league: league,
      code: teamName.substring(0, 3).toUpperCase(),
    };
    if (isFavorite(teamName)) {
      removeFavorite(teamName);
    } else {
      addFavorite(team);
    }
  };

  if (loading)
    return (
      <ActivityIndicator size="large" color="#CC0000" style={{ flex: 1 }} />
    );

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>← Volver</Text>
      </TouchableOpacity>

      <View style={styles.matchHeader}>
        <Text style={styles.leagueInfo}>
          {event.league} • {detail?.dateEvent || ""}
        </Text>

        <View style={styles.teamsRow}>
          {/* Equipo local */}
          <View style={styles.teamBox}>
            {badges[event.homeTeam] ? (
              <Image source={{ uri: badges[event.homeTeam] }} style={styles.badgeImage} resizeMode="contain" />
            ) : (
              <Text style={styles.teamCode}>
                {event.homeTeam.substring(0, 3).toUpperCase()}
              </Text>
            )}
            <Text style={styles.teamFullName}>{event.homeTeam}</Text>
            <TouchableOpacity
              style={styles.starBtn}
              onPress={() => toggleFavorite(event.homeTeam, event.league)}
            >
              <Text style={styles.starIcon}>{homeIsFav ? "⭐" : "☆"}</Text>
            </TouchableOpacity>
          </View>

          {/* Marcador */}
          <View style={styles.scoreCenter}>
            <Text style={styles.bigScore}>
              {event.homeScore} - {event.awayScore}
            </Text>
            <Text style={styles.finalText}>Finalizado</Text>
          </View>

          {/* Equipo visitante */}
          <View style={styles.teamBox}>
            {badges[event.awayTeam] ? (
              <Image source={{ uri: badges[event.awayTeam] }} style={styles.badgeImage} resizeMode="contain" />
            ) : (
              <Text style={styles.teamCode}>
                {event.awayTeam.substring(0, 3).toUpperCase()}
              </Text>
            )}
            <Text style={styles.teamFullName}>{event.awayTeam}</Text>
            <TouchableOpacity
              style={styles.starBtn}
              onPress={() => toggleFavorite(event.awayTeam, event.league)}
            >
              <Text style={styles.starIcon}>{awayIsFav ? "⭐" : "☆"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Estadísticas */}
      {stats && Array.isArray(stats) && stats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statValue}>
                {stat.strHomeTeamStat ?? "-"}
              </Text>
              <Text style={styles.statLabel}>{stat.strStat}</Text>
              <Text style={styles.statValue}>
                {stat.strAwayTeamStat ?? "-"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Info extra */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        {detail?.strVenue ? (
          <Text style={styles.infoText}>🏟️ {detail.strVenue}</Text>
        ) : null}
        {detail?.strReferee ? (
          <Text style={styles.infoText}>👤 Árbitro: {detail.strReferee}</Text>
        ) : null}
        {detail?.intSpectators ? (
          <Text style={styles.infoText}>
            👥 Espectadores: {detail.intSpectators}
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  backBtn: { padding: 20, paddingTop: 50, backgroundColor: "#CC0000" },
  backText: { color: "rgba(255,255,255,0.9)", fontSize: 16, fontWeight: "600" },
  matchHeader: {
    backgroundColor: "#CC0000",
    padding: 20,
    alignItems: "center",
  },
  leagueInfo: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginBottom: 20,
  },
  teamsRow: { flexDirection: "row", alignItems: "center", width: "100%" },
  teamBox: { flex: 1, alignItems: "center" },
  badgeImage: { width: 60, height: 60, marginBottom: 5 },
  teamCode: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  teamFullName: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  starBtn: { marginTop: 8 },
  starIcon: { fontSize: 22 },
  scoreCenter: { alignItems: "center", paddingHorizontal: 10 },
  bigScore: { color: "#fff", fontSize: 42, fontWeight: "bold" },
  finalText: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 4 },
  section: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statLabel: { flex: 1, textAlign: "center", fontSize: 13, color: "#666" },
  statValue: {
    width: 60,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#CC0000",
  },
  infoText: { fontSize: 14, color: "#555", paddingVertical: 6 },
});
