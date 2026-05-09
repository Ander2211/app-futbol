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
import { useTheme } from '../context/ThemeContext';

export default function DetailScreen({ route }) {
  const { team } = route.params;
  const [players, setPlayers] = useState([]);
  const [nextEvents, setNextEvents] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);
  const { colors, dark } = useTheme();

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

  const dynamicStyles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { height: 250, position: 'relative', backgroundColor: dark ? '#111' : '#eee' },
    badgeOverlay: {
      position: 'absolute',
      bottom: 0,
      alignSelf: 'center',
      backgroundColor: colors.card,
      borderRadius: 60,
      padding: 5,
      elevation: 5,
    },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: colors.text },
    subtitle: { fontSize: 16, textAlign: 'center', color: colors.secondary, marginBottom: 20 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 25,
      marginBottom: 15,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: 10,
    },
    eventCard: {
      backgroundColor: colors.card,
      padding: 12,
      borderRadius: 10,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    eventDate: { fontSize: 12, color: colors.primary, fontWeight: 'bold' },
    eventMatch: { fontSize: 15, color: colors.text },
    playerCard: {
      width: 110,
      marginRight: 15,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 10,
    },
    playerName: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: colors.text },
    playerPosition: { fontSize: 10, color: colors.secondary },
    description: { fontSize: 15, lineHeight: 24, color: colors.text, opacity: 0.85, textAlign: 'justify', paddingBottom: 30 },
    noData: { color: colors.secondary, fontStyle: 'italic' }
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cabecera */}
        <View style={dynamicStyles.header}>
          <Image 
            source={{ uri: team.strFanart1 || team.strTeamFanart1 || 'https://via.placeholder.com/400x200' }} 
            style={styles.banner} 
          />
          <View style={dynamicStyles.badgeOverlay}>
            <Image source={{ uri: team.strBadge }} style={styles.mainBadge} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={dynamicStyles.title}>{team.strTeam}</Text>
          <Text style={dynamicStyles.subtitle}>{team.strStadium} • {team.strLocation}</Text>

          {/* Sección: Próximos Partidos */}
          <Text style={dynamicStyles.sectionTitle}>Próximos Partidos</Text>
          {loadingExtra ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : nextEvents.length > 0 ? (
            nextEvents.map((event) => (
              <View key={event.idEvent} style={dynamicStyles.eventCard}>
                <Text style={dynamicStyles.eventDate}>{event.dateEvent} | {event.strTime}</Text>
                <Text style={dynamicStyles.eventMatch}>{event.strEvent}</Text>
              </View>
            ))
          ) : (
            <Text style={dynamicStyles.noData}>No hay partidos programados próximamente.</Text>
          )}

          {/* Sección: Plantilla */}
          <Text style={dynamicStyles.sectionTitle}>Plantilla Actual</Text>
          <FlatList
            horizontal
            data={players}
            keyExtractor={(item) => item.idPlayer}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={dynamicStyles.playerCard}>
                <Image 
                  source={{ uri: item.strThumb || 'https://cdn-icons-png.flaticon.com/512/166/166344.png' }} 
                  style={styles.playerImage} 
                />
                <Text style={dynamicStyles.playerName} numberOfLines={1}>{item.strPlayer}</Text>
                <Text style={dynamicStyles.playerPosition}>{item.strPosition}</Text>
              </View>
            )}
          />

          {/* Sección: Historia (Traducción forzada) */}
          <Text style={dynamicStyles.sectionTitle}>Historia del Club</Text>
          <Text style={dynamicStyles.description}>
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
  banner: { width: '100%', height: 200 },
  mainBadge: { width: 100, height: 100 },
  content: { padding: 20, marginTop: 10 },
  playerImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8 },
});
