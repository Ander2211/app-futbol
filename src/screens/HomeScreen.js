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
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { colors, dark } = useTheme();

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

  const dynamicStyles = StyleSheet.create({
    center: {
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 15,
      marginVertical: 10,
      marginHorizontal: 16,
      borderRadius: 16,
      elevation: 4, 
      shadowColor: dark ? '#000' : '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: dark ? 0.3 : 0.1,
      shadowRadius: 6,
      alignItems: 'center',
    },
    badgeContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: dark ? '#333' : '#F0F2F5',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 15,
      padding: 5,
    },
    name: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    stadium: {
      fontSize: 14,
      color: colors.secondary,
      fontWeight: '500',
      marginBottom: 2,
    },
    year: {
      fontSize: 12,
      color: colors.secondary,
      opacity: 0.7
    }
  });

  if (loading) {
    return (
      <View style={dynamicStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{marginTop: 10, color: colors.primary, fontWeight: 'bold'}}>Cargando equipos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.idTeam}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={dynamicStyles.card} 
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Details', { team: item })}
          >
            <View style={dynamicStyles.badgeContainer}>
              <Image source={{ uri: item.strBadge }} style={styles.badge} />
            </View>
            <View style={styles.info}>
              <Text style={dynamicStyles.name}>{item.strTeam}</Text>
              <Text style={dynamicStyles.stadium}>🏟️ {item.strStadium}</Text>
              {item.intFormedYear && <Text style={dynamicStyles.year}>Fundado: {item.intFormedYear}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  }
});