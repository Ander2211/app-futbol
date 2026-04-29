import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  SafeAreaView
} from 'react-native';

export default function DetailScreen({ route }) {
  const { team } = route.params;
  const [players, setPlayers] = useState([]);
  const [nextEvents, setNextEvents] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        if (!team.idTeam) return;

        // Petición 1: Jugadores
        const resPlayers = await fetch(`https://www.thesportsdb.com/api/v1/json/3/lookup_all_players.php?id=${team.idTeam}`);
        const dataPlayers = await resPlayers.json();
        
        // Petición 2: Próximos Partidos
        const resEvents = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=${team.idTeam}`);
        const dataEvents = await resEvents.json();

        setPlayers(dataPlayers.player || []);
        setNextEvents(dataEvents.events || []);
      } catch (error) {
        console.error("Error cargando detalles:", error);
      } finally {
        setLoadingExtra(false);
      }
    };
    fetchExtraData();
  }, [team.idTeam]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera */}
        <View style={styles.header}>
          <Image 
            source={{ uri: team.strFanart1 || team.strTeamFanart1 || 'https://via.placeholder.com/400x200' }} 
            style={styles.banner} 
          />
          <View style={styles.badgeOverlay}>
            <Image source={{ uri: team.strBadge }} style={styles.mainBadge} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{team.strTeam}</Text>
          <Text style={styles.subtitle}>{team.strStadium} • {team.strLocation}</Text>

          {/* Sección: Próximos Partidos */}
          <Text style={styles.sectionTitle}>Próximos Partidos</Text>
          {loadingExtra ? (
            <ActivityIndicator size="small" color="#f4511e" />
          ) : nextEvents.length > 0 ? (
            nextEvents.map((event) => (
              <View key={event.idEvent} style={styles.eventCard}>
                <Text style={styles.eventDate}>{event.dateEvent} | {event.strTime}</Text>
                <Text style={styles.eventMatch}>{event.strEvent}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>No hay partidos programados próximamente.</Text>
          )}

          {/* Sección: Plantilla */}
          <Text style={styles.sectionTitle}>Plantilla Actual</Text>
          <FlatList
            horizontal
            data={players}
            keyExtractor={(item) => item.idPlayer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.playerCard}>
                <Image 
                  source={{ uri: item.strThumb || 'https://cdn-icons-png.flaticon.com/512/166/166344.png' }} 
                  style={styles.playerImage} 
                />
                <Text style={styles.playerName} numberOfLines={1}>{item.strPlayer}</Text>
                <Text style={styles.playerPosition}>{item.strPosition}</Text>
              </View>
            )}
          />

          {/* Sección: Historia (Traducción forzada) */}
          <Text style={styles.sectionTitle}>Historia del Club</Text>
          <Text style={styles.description}>
            {team.strDescriptionES 
              ? team.strDescriptionES 
              : "La descripción en español no está disponible para este club. Aquí tienes la versión original:\n\n" + team.strDescriptionEN}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { height: 250, position: 'relative', backgroundColor: '#eee' },
  banner: { width: '100%', height: 200 },
  badgeOverlay: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 60,
    padding: 5,
    elevation: 5,
  },
  mainBadge: { width: 100, height: 100 },
  content: { padding: 20, marginTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A' },
  subtitle: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 20 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 25,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f4511e',
    paddingLeft: 10,
  },
  eventCard: {
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  eventDate: { fontSize: 12, color: '#f4511e', fontWeight: 'bold' },
  eventMatch: { fontSize: 15, color: '#333' },
  playerCard: {
    width: 110,
    marginRight: 15,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 10,
  },
  playerImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
  playerName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center' },
  playerPosition: { fontSize: 10, color: '#888' },
  description: { fontSize: 15, lineHeight: 24, color: '#444', textAlign: 'justify', paddingBottom: 30 },
  noData: { color: '#999', fontStyle: 'italic' }
});
