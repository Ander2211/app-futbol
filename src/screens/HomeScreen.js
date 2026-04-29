import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  SafeAreaView
} from 'react-native';

export default function HomeScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    try {
      const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English%20Premier%20League');
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (error) {
      console.error("Error al obtener equipos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={{marginTop: 10, color: '#f4511e', fontWeight: 'bold'}}>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.idTeam}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Details', { team: item })}
          >
            <View style={styles.badgeContainer}>
              <Image source={{ uri: item.strBadge }} style={styles.badge} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.strTeam}</Text>
              <Text style={styles.stadium}>🏟️ {item.strStadium}</Text>
              {item.intFormedYear && <Text style={styles.year}>Fundado: {item.intFormedYear}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#F5F7FA'
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  badgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    padding: 5,
  },
  badge: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  stadium: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 2,
  },
  year: {
    fontSize: 12,
    color: '#999999',
  }
});