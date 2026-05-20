import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  useWindowDimensions,
} from "react-native";
import EventDetailScreen from "./EventDetailScreen";
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

const SPORTS = [
  "Todos",
  "Fútbol",
  "Baloncesto",
  "Fútbol Americano",
  "Baseball",
  "Hockey",
];

export default function ResultadosScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("Todos");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const { colors, dark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompactFilter = width <= 360;

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
              homeBadge: e.strHomeTeamBadge || null,
              awayBadge: e.strAwayTeamBadge || null,
              dateEvent: e.dateEvent || null,
              season: e.strSeason || null,
              homeGoals: e.strHomeGoalDetails || null,
              awayGoals: e.strAwayGoalDetails || null,
              homeRedCards: e.strHomeRedCards || null,
              awayRedCards: e.strAwayRedCards || null,
              homeYellowCards: e.strHomeYellowCards || null,
              awayYellowCards: e.strAwayYellowCards || null,
              venue: e.strVenue || null,
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

  const allTeams = useMemo(() => {
    const names = new Set(events.flatMap(e => [e.homeTeam, e.awayTeam]));
    return [...names].sort();
  }, [events]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || selectedTeam) return [];
    const q = searchQuery.toLowerCase();
    return allTeams.filter(t => t.toLowerCase().includes(q)).slice(0, 6);
  }, [searchQuery, selectedTeam, allTeams]);

  if (selectedEvent) {
    return (
      <EventDetailScreen
        event={selectedEvent}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  const filtered = events.filter(e => {
    if (selectedSport !== "Todos" && e.sport !== selectedSport) return false;
    if (selectedTeam) return e.homeTeam === selectedTeam || e.awayTeam === selectedTeam;
    return true;
  });

  const grouped = filtered.reduce((acc, event) => {
    if (!acc[event.league]) acc[event.league] = [];
    acc[event.league].push(event);
    return acc;
  }, {});

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    filtersWrapper: {
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 10,
    },
    filterBtn: {
      height: 34,
      paddingHorizontal: 16,
      borderRadius: 17,
      backgroundColor: dark ? "#333" : "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 10,
      marginBottom: 10,
    },
    filterActive: { backgroundColor: colors.primary },
    filterText: { fontSize: 13, fontWeight: "600", color: colors.secondary },
    filterTextActive: { color: "#fff" },
    filterToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: dark ? "#222" : "#f5f5f5",
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginHorizontal: 15,
      marginBottom: 0,
    },
    filterToggleText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    filterOptions: {
      paddingHorizontal: 15,
      paddingTop: 10,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    searchWrapper: {
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 12,
    },
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 14,
      color: colors.text,
    },
    selectedTeamChip: {
      marginTop: 8,
      alignSelf: "flex-start",
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    suggestions: {
      marginTop: 6,
      borderRadius: 10,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    suggestionItem: {
      paddingHorizontal: 14,
      paddingVertical: 11,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: { fontSize: 14, color: colors.text },
    leagueTitle: {
      paddingHorizontal: 15,
      paddingTop: 15,
      paddingBottom: 5,
      fontWeight: "bold",
      color: colors.secondary,
      fontSize: 12,
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 15,
      marginBottom: 10,
      borderRadius: 12,
      padding: 15,
    },
    cardDate: { fontSize: 11, color: colors.secondary },
    cardSeason: { fontSize: 11, color: colors.primary, fontWeight: "600" },
    badgePlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: dark ? "#333" : "#f0f0f0",
      justifyContent: "center",
      alignItems: "center",
    },
    badgeText: { fontSize: 10, fontWeight: "bold", color: colors.secondary },
    teamName: {
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
      color: colors.text,
    },
    score: { fontSize: 20, fontWeight: "bold", color: colors.primary },
    status: { fontSize: 11, color: colors.secondary, marginTop: 2 },
    goalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 10,
    },
    goalsText: { flex: 1, fontSize: 11, color: colors.secondary, lineHeight: 16 },
  });

  if (loading)
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.filtersWrapper}>
        {isCompactFilter ? (
          <>
            <TouchableOpacity
              style={dynamicStyles.filterToggle}
              onPress={() => setFilterOpen((prev) => !prev)}
            >
              <Text style={dynamicStyles.filterToggleText}>
                {selectedSport !== "Todos" ? `Deporte: ${selectedSport}` : "Filtrar por deporte"}
              </Text>
              <Text style={dynamicStyles.filterToggleText}>{filterOpen ? "−" : "+"}</Text>
            </TouchableOpacity>
            {filterOpen && (
              <View style={dynamicStyles.filterOptions}>
                {SPORTS.map((sport) => (
                  <TouchableOpacity
                    key={sport}
                    style={[
                      dynamicStyles.filterBtn,
                      selectedSport === sport && dynamicStyles.filterActive,
                    ]}
                    onPress={() => {
                      setSelectedSport(sport);
                      setFilterOpen(false);
                    }}
                  >
                    <Text
                      style={[
                        dynamicStyles.filterText,
                        selectedSport === sport && dynamicStyles.filterTextActive,
                      ]}
                    >
                      {sport}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
          >
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  dynamicStyles.filterBtn,
                  selectedSport === sport && dynamicStyles.filterActive,
                ]}
                onPress={() => setSelectedSport(sport)}
              >
                <Text
                  style={[
                    dynamicStyles.filterText,
                    selectedSport === sport && dynamicStyles.filterTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Barra de búsqueda */}
      <View style={dynamicStyles.searchWrapper}>
        <View style={dynamicStyles.searchRow}>
          <TextInput
            style={dynamicStyles.searchInput}
            placeholder="Buscar equipo..."
            placeholderTextColor={colors.secondary}
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);
              if (selectedTeam) setSelectedTeam(null);
            }}
          />
          {(searchQuery.length > 0 || selectedTeam) && (
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={() => { setSearchQuery(""); setSelectedTeam(null); }}
            >
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chip del equipo seleccionado */}
        {selectedTeam && (
          <View style={dynamicStyles.selectedTeamChip}>
            <Text style={styles.selectedTeamText}>{selectedTeam}</Text>
          </View>
        )}

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <View style={dynamicStyles.suggestions}>
            {suggestions.map(team => (
              <TouchableOpacity
                key={team}
                style={dynamicStyles.suggestionItem}
                onPress={() => { setSelectedTeam(team); setSearchQuery(team); }}
              >
                <Text style={dynamicStyles.suggestionText}>{team}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={Object.keys(grouped)}
        keyExtractor={(item) => item}
        renderItem={({ item: league }) => (
          <View>
            <Text style={dynamicStyles.leagueTitle}>{league.toUpperCase()}</Text>
            {grouped[league].map((event) => (
              <TouchableOpacity
                key={event.id}
                style={dynamicStyles.card}
                onPress={() => setSelectedEvent(event)}
              >
                {/* Fecha y temporada */}
                <View style={styles.cardHeader}>
                  {event.dateEvent && (
                    <Text style={dynamicStyles.cardDate}>{event.dateEvent}</Text>
                  )}
                  {event.season && (
                    <Text style={dynamicStyles.cardSeason}>Temp. {event.season}</Text>
                  )}
                </View>

                {/* Equipos y marcador */}
                <View style={styles.teamsRow}>
                  <View style={styles.teamBox}>
                    {event.homeBadge ? (
                      <Image
                        source={{ uri: event.homeBadge }}
                        style={styles.badgeImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={dynamicStyles.badgePlaceholder}>
                        <Text style={dynamicStyles.badgeText}>
                          {event.homeTeam.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={dynamicStyles.teamName}>{event.homeTeam}</Text>
                  </View>

                  <View style={styles.scoreBox}>
                    <Text style={dynamicStyles.score}>
                      {event.homeScore ?? "-"} - {event.awayScore ?? "-"}
                    </Text>
                    <Text style={dynamicStyles.status}>{event.status}</Text>
                  </View>

                  <View style={styles.teamBox}>
                    {event.awayBadge ? (
                      <Image
                        source={{ uri: event.awayBadge }}
                        style={styles.badgeImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={dynamicStyles.badgePlaceholder}>
                        <Text style={dynamicStyles.badgeText}>
                          {event.awayTeam.substring(0, 3).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={dynamicStyles.teamName}>{event.awayTeam}</Text>
                  </View>
                </View>

                {/* Goleadores */}
                {(event.homeGoals || event.awayGoals) && (
                  <View style={dynamicStyles.goalsRow}>
                    <Text style={dynamicStyles.goalsText} numberOfLines={2}>
                      {event.homeGoals || ""}
                    </Text>
                    <Text style={dynamicStyles.goalsText} numberOfLines={2}>
                      {event.awayGoals || ""}
                    </Text>
                  </View>
                )}

                {/* Tarjetas */}
                {(event.homeRedCards || event.awayRedCards ||
                  event.homeYellowCards || event.awayYellowCards) && (
                  <View style={styles.cardsRow}>
                    <View style={styles.cardSide}>
                      {event.homeYellowCards && (
                        <Text style={styles.yellowCard}>🟨 {event.homeYellowCards}</Text>
                      )}
                      {event.homeRedCards && (
                        <Text style={styles.redCard}>🟥 {event.homeRedCards}</Text>
                      )}
                    </View>
                    <View style={styles.cardSide}>
                      {event.awayYellowCards && (
                        <Text style={styles.yellowCard}>🟨 {event.awayYellowCards}</Text>
                      )}
                      {event.awayRedCards && (
                        <Text style={styles.redCard}>🟥 {event.awayRedCards}</Text>
                      )}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 56,
    gap: 8,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { color: "#aaa", fontSize: 16 },
  selectedTeamText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  teamsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  teamBox: { flex: 1, alignItems: "center", gap: 6 },
  badgeImage: { width: 40, height: 40 },
  scoreBox: { alignItems: "center", paddingHorizontal: 10 },
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 10,
  },
  cardSide: { flex: 1, gap: 2 },
  yellowCard: { fontSize: 11, color: "#888" },
  redCard: { fontSize: 11, color: "#888" },
});