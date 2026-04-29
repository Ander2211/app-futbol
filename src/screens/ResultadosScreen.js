import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
} from "react-native";
import EventDetailScreen from "./EventDetailScreen";

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

const SPORTS = [
  "Todos",
  "Fútbol",
  "Baloncesto",
  "Fútbol Americano",
  "Baseball",
  "Hockey",
];

const getTeamBadge = async (teamName) => {
  const res = await fetch(
    `${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`,
  );
  const data = await res.json();
  return data.teams?.[0]?.strBadge || null;
};

export default function ResultadosScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("Todos");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [badges, setBadges] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          LEAGUES.map(async (l) => {
            const res = await fetch(
              `${BASE_URL}/eventspastleague.php?id=${l.id}`,
            );
            const data = await res.json();
            return (data.events || []).slice(0, 3).map((e) => ({
              id: String(e.idEvent),
              homeTeam: e.strHomeTeam,
              awayTeam: e.strAwayTeam,
              homeScore: e.intHomeScore,
              awayScore: e.intAwayScore,
              status: "Finalizado",
              league: l.name,
              sport: l.sport,
            }));
          }),
        );
        setEvents(results.flat());
      } catch (err) {
        console.log("ERROR:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const fetchBadges = async () => {
      const newBadges = {};
      const teamNames = [
        ...new Set(events.flatMap((e) => [e.homeTeam, e.awayTeam])),
      ];
      await Promise.all(
        teamNames.map(async (name) => {
          const url = await getTeamBadge(name);
          if (url) newBadges[name] = url;
        }),
      );
      setBadges(newBadges);
    };
    if (events.length > 0) fetchBadges();
  }, [events]);

  if (selectedEvent) {
    return (
      <EventDetailScreen
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  const filtered =
    selectedSport === "Todos"
      ? events
      : events.filter((e) => e.sport === selectedSport);

  const grouped = filtered.reduce((acc, event) => {
    if (!acc[event.league]) acc[event.league] = [];
    acc[event.league].push(event);
    return acc;
  }, {});

  if (loading)
    return (
      <ActivityIndicator size="large" color="#CC0000" style={{ flex: 1 }} />
    );

  return (
    <View style={styles.container}>
      {/* We remove header as Tab navigation or Stack navigation might have their own, 
          but actually let's keep it here because APPi doesn't have a header. */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultados</Text>
      </View> */}

      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[
                styles.filterBtn,
                selectedSport === sport && styles.filterActive,
              ]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedSport === sport && styles.filterTextActive,
                ]}
              >
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={Object.keys(grouped)}
        keyExtractor={(item) => item}
        renderItem={({ item: league }) => (
          <View>
            <Text style={styles.leagueTitle}>{league.toUpperCase()}</Text>
            {grouped[league].map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.card}
                onPress={() => setSelectedEvent(event)}
              >
                <View style={styles.teamBox}>
                  {badges[event.homeTeam] ? (
                    <Image
                      source={{ uri: badges[event.homeTeam] }}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.badgePlaceholder}>
                      <Text style={styles.badgeText}>
                        {event.homeTeam.substring(0, 3).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.teamName}>{event.homeTeam}</Text>
                </View>

                <View style={styles.scoreBox}>
                  <Text style={styles.score}>
                    {event.homeScore ?? "-"} - {event.awayScore ?? "-"}
                  </Text>
                  <Text style={styles.status}>{event.status}</Text>
                </View>

                <View style={styles.teamBox}>
                  {badges[event.awayTeam] ? (
                    <Image
                      source={{ uri: badges[event.awayTeam] }}
                      style={styles.badgeImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.badgePlaceholder}>
                      <Text style={styles.badgeText}>
                        {event.awayTeam.substring(0, 3).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.teamName}>{event.awayTeam}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#CC0000", padding: 20, paddingTop: 50 },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  filtersWrapper: {
    backgroundColor: "#fff",
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  filtersContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 56,
    gap: 8,
  },
  filterBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  filterActive: { backgroundColor: "#CC0000" },
  filterText: { fontSize: 13, fontWeight: "600", color: "#666" },
  filterTextActive: { color: "#fff" },
  leagueTitle: {
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
    fontWeight: "bold",
    color: "#999",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamBox: { flex: 1, alignItems: "center", gap: 6 },
  badgeImage: { width: 40, height: 40 },
  badgePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { fontSize: 10, fontWeight: "bold", color: "#666" },
  teamName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  scoreBox: { alignItems: "center", paddingHorizontal: 10 },
  score: { fontSize: 20, fontWeight: "bold", color: "#CC0000" },
  status: { fontSize: 11, color: "#999", marginTop: 2 },
});
