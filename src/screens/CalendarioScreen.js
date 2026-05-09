import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

const LEAGUES = [
  { id: '4328', name: 'Premier League', sport: 'Fútbol' },
  { id: '4335', name: 'La Liga', sport: 'Fútbol' },
  { id: '4332', name: 'Serie A', sport: 'Fútbol' },
  { id: '4334', name: 'Ligue 1', sport: 'Fútbol' },
  { id: '4387', name: 'NBA', sport: 'Baloncesto' },
  { id: '4391', name: 'NFL', sport: 'Fútbol Americano' },
  { id: '4424', name: 'MLB', sport: 'Baseball' },
  { id: '4380', name: 'NHL', sport: 'Hockey' },
];

const SPORTS = ['Todas', 'Fútbol', 'Baloncesto', 'Fútbol Americano', 'Baseball', 'Hockey'];

const toSalvadorTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;
  try {
    const dt = new Date(`${dateStr}T${timeStr}Z`);
    return dt.toLocaleTimeString('es-SV', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return timeStr?.substring(0, 5) || null;
  }
};

export default function CalendarioScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState('Todas');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          LEAGUES.map(async (l) => {
            const res = await fetch(`${BASE_URL}/eventsnextleague.php?id=${l.id}`);
            const data = await res.json();
            return (data.events || []).map((e) => ({
              id: String(e.idEvent),
              homeTeam: e.strHomeTeam,
              awayTeam: e.strAwayTeam,
              homeBadge: e.strHomeTeamBadge || null,
              awayBadge: e.strAwayTeamBadge || null,
              dateEvent: e.dateEvent || null,
              time: toSalvadorTime(e.dateEvent, e.strTime),
              venue: e.strVenue || null,
              league: l.name,
              sport: l.sport,
            }));
          })
        );
        setEvents(results.flat());
      } catch (err) {
        console.error('Error al obtener calendario:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filtered = selectedSport === 'Todas'
    ? events
    : events.filter(e => e.sport === selectedSport);

  const grouped = filtered.reduce((acc, event) => {
    if (!acc[event.league]) acc[event.league] = [];
    acc[event.league].push(event);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#CC0000" />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Filtros por deporte */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {SPORTS.map((sport) => (
            <TouchableOpacity
              key={sport}
              style={[styles.filterBtn, selectedSport === sport && styles.filterActive]}
              onPress={() => setSelectedSport(sport)}
            >
              <Text style={[styles.filterText, selectedSport === sport && styles.filterTextActive]}>
                {sport}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {Object.keys(grouped).length > 0 ? (
        <FlatList
          data={Object.keys(grouped)}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: league }) => (
            <View>
              <Text style={styles.leagueTitle}>{league.toUpperCase()}</Text>
              {grouped[league].map((event) => (
                <View key={event.id} style={styles.card}>
                  {/* Fecha y hora */}
                  <View style={styles.dateRow}>
                    <View style={styles.dateLeft}>
                      <Ionicons name="calendar-outline" size={13} color="#999" />
                      <Text style={styles.dateText}>{event.dateEvent || 'Fecha por confirmar'}</Text>
                    </View>
                    {event.time && (
                      <Text style={styles.timeText}>{event.time} (SV)</Text>
                    )}
                  </View>

                  {/* Equipos */}
                  <View style={styles.teamsRow}>
                    <View style={styles.teamBox}>
                      {event.homeBadge ? (
                        <Image source={{ uri: event.homeBadge }} style={styles.badge} resizeMode="contain" />
                      ) : (
                        <View style={styles.badgePlaceholder}>
                          <Text style={styles.badgeText}>{event.homeTeam.substring(0, 3).toUpperCase()}</Text>
                        </View>
                      )}
                      <Text style={styles.teamName} numberOfLines={2}>{event.homeTeam}</Text>
                    </View>

                    <Text style={styles.vsText}>VS</Text>

                    <View style={styles.teamBox}>
                      {event.awayBadge ? (
                        <Image source={{ uri: event.awayBadge }} style={styles.badge} resizeMode="contain" />
                      ) : (
                        <View style={styles.badgePlaceholder}>
                          <Text style={styles.badgeText}>{event.awayTeam.substring(0, 3).toUpperCase()}</Text>
                        </View>
                      )}
                      <Text style={styles.teamName} numberOfLines={2}>{event.awayTeam}</Text>
                    </View>
                  </View>

                  {/* Estadio */}
                  {event.venue && (
                    <View style={styles.venueRow}>
                      <Ionicons name="location-outline" size={13} color="#999" />
                      <Text style={styles.venueText}>{event.venue}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={80} color="#CCC" />
          <Text style={styles.emptyText}>No hay partidos programados próximamente.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
  loadingText: { marginTop: 10, color: '#CC0000', fontWeight: 'bold' },
  filtersWrapper: {
    backgroundColor: '#fff',
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  filtersContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 56,
    gap: 8,
  },
  filterBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterActive: { backgroundColor: '#CC0000' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#fff' },
  listContent: { padding: 15 },
  leagueTitle: {
    fontWeight: 'bold',
    color: '#999',
    fontSize: 12,
    paddingBottom: 8,
    paddingTop: 4,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#666' },
  timeText: { fontSize: 13, fontWeight: '700', color: '#CC0000' },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  teamBox: { flex: 1, alignItems: 'center', gap: 6 },
  badge: { width: 44, height: 44 },
  badgePlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
  teamName: { fontSize: 13, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
  vsText: { fontSize: 12, fontWeight: '900', color: '#BBB', marginHorizontal: 10 },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  venueText: { fontSize: 12, color: '#888' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { marginTop: 20, textAlign: 'center', fontSize: 16, color: '#999', lineHeight: 24 },
});
