import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Para simplificar, usaremos la Premier League (ID: 4328)
const PREMIER_LEAGUE_ID = '4328';

export default function CalendarioScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUpcomingEvents = async () => {
    try {
      // Usamos el endpoint de eventos próximos de la liga
      const response = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${PREMIER_LEAGUE_ID}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error al obtener calendario:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.dateEvent}</Text>
        <Text style={styles.timeText}>{item.strTime?.substring(0, 5) || 'TBD'}</Text>
      </View>
      
      <View style={styles.matchContainer}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName} numberOfLines={1}>{item.strHomeTeam}</Text>
        </View>
        
        <Text style={styles.vsText}>VS</Text>
        
        <View style={styles.teamInfo}>
          <Text style={[styles.teamName, { textAlign: 'right' }]} numberOfLines={1}>{item.strAwayTeam}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.venueText}>{item.strVenue || 'Estadio por confirmar'}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Cargando calendario...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximos Partidos</Text>
        <Text style={styles.headerSubtitle}>Premier League 🏆</Text>
      </View>

      {events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.idEvent}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    color: '#f4511e',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#f4511e',
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f4511e',
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  vsText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#BBB',
    marginHorizontal: 15,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  venueText: {
    fontSize: 12,
    color: '#888',
    marginLeft: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
  }
});
