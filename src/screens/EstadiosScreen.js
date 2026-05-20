import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { getTeamsByLeague, getTeamById } from "../services/sportsApi";

const normalizeStadiumKey = (value) =>
  value
    ?.toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const MANUAL_STADIUM_DATA = {
  "American Airlines Center": {
    location: "Dallas, Estados Unidos",
    capacity: "19,200",
    description: "Arena de los Dallas Mavericks y Dallas Stars, conocida por su ambiente eléctrico en partidos de NBA y NHL.",
  },
  "American Express Stadium": {
    location: "Brighton, Inglaterra",
    capacity: "31,800",
    description: "Estadio moderno del Brighton & Hove Albion con vistas al mar y un ambiente acogedor.",
  },
  "AT&T Stadium": {
    location: "Arlington, Estados Unidos",
    capacity: "80,000",
    description: "Gigante cazado de la NFL, casa de los Dallas Cowboys y famoso por su techo retráctil y pantalla gigante.",
  },
  "Ball Arena": {
    location: "Denver, Estados Unidos",
    capacity: "18,000",
    description: "Sede de los Denver Nuggets y Colorado Avalanche, ubicada en el corazón del distrito deportivo de Denver.",
  },
  "Bank of America Stadium": {
    location: "Charlotte, Estados Unidos",
    capacity: "75,523",
    description: "Estadio del Carolina Panthers con un ambiente único para la NFL y grandes eventos deportivos.",
  },
  "Barclays Center": {
    location: "Brooklyn, Estados Unidos",
    capacity: "17,732",
    description: "Arena urbana de Brooklyn, casa de los Brooklyn Nets y escenario de conciertos de primer nivel.",
  },
  "Brentford Community Stadium": {
    location: "Londres, Inglaterra",
    capacity: "17,250",
    description: "Estadio compacto y moderno que acoge los partidos del Brentford FC con un ambiente cercano.",
  },
  "Chase Center": {
    location: "San Francisco, Estados Unidos",
    capacity: "18,064",
    description: "Arena de los Golden State Warriors con tecnología avanzada y vistas a la bahía.",
  },
  "Chase Field": {
    location: "Phoenix, Estados Unidos",
    capacity: "48,519",
    description: "Estadio de béisbol de los Arizona Diamondbacks, con techo retráctil y clima controlado.",
  },
  "Coors Field": {
    location: "Denver, Estados Unidos",
    capacity: "50,144",
    description: "Estadio de los Colorado Rockies, conocido por su altitud y su enfoque en la experiencia del fanático.",
  },
  "Craven Cottage": {
    location: "Londres, Inglaterra",
    capacity: "19,000",
    description: "Estadio histórico del Fulham FC situado junto al río Támesis, con un estilo tradicional británico.",
  },
  "Decathlon Arena - Stade Pierre-Mauroy": {
    location: "Villeneuve-d'Ascq, Francia",
    capacity: "50,186",
    description: "Arena versátil del LOSC Lille, con techo retráctil y usos deportivos y culturales.",
  },
  "Emirates Stadium": {
    location: "Londres, Inglaterra",
    capacity: "60,704",
    description: "Estadio del Arsenal FC, reconocido por su visibilidad y ambiente moderno.",
  },
  "Empower Field at Mile High": {
    location: "Denver, Estados Unidos",
    capacity: "76,125",
    description: "Estadio del Denver Broncos, famoso por su ambiente en la NFL y su altitud elevada.",
  },
  "Estadi Municipal de Montilivi": {
    location: "Girona, España",
    capacity: "11,312",
    description: "Estadio del Girona FC con una atmósfera íntima y cercana al campo.",
  },
  "Estadio Abanca-Balaídos": {
    location: "Vigo, España",
    capacity: "29,000",
    description: "Sede de Celta de Vigo, con un ambiente ardiente en la liga española.",
  },
  "Estadio Ciudad de Valencia": {
    location: "Valencia, España",
    capacity: "26,000",
    description: "Estadio del Levante UD, localizado en la ciudad de Valencia y con historia reciente en La Liga.",
  },
  "Estadio Coliseum": {
    location: "Madrid, España",
    capacity: "20,000",
    description: "Estadio del AD Alcorcón con energía local y partidos compactos en la capital española.",
  },
  "Estadio de Mendizorroza": {
    location: "Vitoria-Gasteiz, España",
    capacity: "19,840",
    description: "Hogar del Deportivo Alavés, conocido por su atmósfera cuidada y su diseño funcional.",
  },
  "Estadio Martínez Valero": {
    location: "Elche, España",
    capacity: "33,732",
    description: "Estadio del Elche CF, con un gran suelo y una historia ligada a la liga española.",
  },
  "Fenway Park": {
    location: "Boston, Estados Unidos",
    capacity: "37,731",
    description: "Estadio de los Boston Red Sox y uno de los iconos históricos del béisbol mundial.",
  },
  "Great American Ball Park": {
    location: "Cincinnati, Estados Unidos",
    capacity: "42,319",
    description: "Sede de los Cincinnati Reds, con una vista espectacular del río Ohio.",
  },
  "Groupama Stadium": {
    location: "Décines-Charpieu, Francia",
    capacity: "59,286",
    description: "Estadio del Olympique Lyonnais, premiado por su comodidad y su ambiente moderno.",
  },
  "Guaranteed Rate Field": {
    location: "Chicago, Estados Unidos",
    capacity: "40,615",
    description: "Estadio de los Chicago White Sox, con una gran experiencia de béisbol en el sur de la ciudad.",
  },
  "Highmark Stadium": {
    location: "Orchard Park, Estados Unidos",
    capacity: "71,608",
    description: "Casa de los Buffalo Bills, con un ambiente intenso en la NFL de la región de Nueva York.",
  },
  "Hill Dickinson Stadium": {
    location: "Preston, Inglaterra",
    capacity: "20,000",
    description: "Estadio de Preston North End, con tradición histórica y un ambiente clásico inglés.",
  },
  "Honda Center": {
    location: "Anaheim, Estados Unidos",
    capacity: "17,174",
    description: "Arena de los Anaheim Ducks, rodeada de entretenimiento en el sur de California.",
  },
  "Huntington Bank Field": {
    location: "Minneapolis, Estados Unidos",
    capacity: "50,805",
    description: "Estadio universitario que también acoge grandes eventos de fútbol americano y entretenimiento.",
  },
  "KeyBank Center": {
    location: "Buffalo, Estados Unidos",
    capacity: "19,070",
    description: "Arena de los Buffalo Sabres, reconocida por su atmósfera apasionada en la NHL.",
  },
  "Lenovo Center": {
    location: "San Jose, Estados Unidos",
    capacity: "17,562",
    description: "Arena moderna de San Jose, hogar de emoción en la NHL y conciertos de gran escala.",
  },
  "Little Caesars Arena": {
    location: "Detroit, Estados Unidos",
    capacity: "20,000",
    description: "Estadio de los Detroit Pistons y Detroit Red Wings, con un diseño urbano integrado.",
  },
  "M&T Bank Stadium": {
    location: "Baltimore, Estados Unidos",
    capacity: "71,008",
    description: "Estadio de los Baltimore Ravens, con una de las atmósferas más ruidosas de la NFL.",
  },
  "Mercedes-Benz Stadium": {
    location: "Atlanta, Estados Unidos",
    capacity: "71,000",
    description: "Estadio ultramoderno de los Atlanta Falcons, famoso por su techo retráctil y su plaza central.",
  },
  "Nationwide Arena": {
    location: "Columbus, Estados Unidos",
    capacity: "18,500",
    description: "Arena de los Columbus Blue Jackets, con una experiencia cálida para los aficionados al hockey.",
  },
  "New Balance Arena": {
    location: "Boston, Estados Unidos",
    capacity: "19,550",
    description: "Arena de los Boston Celtics, centro neurálgico del deporte y el entretenimiento en Boston.",
  },
  "Orange Vélodrome": {
    location: "Marsella, Francia",
    capacity: "67,000",
    description: "Gran estadio del Olympique de Marseille, con una atmósfera impresionante en cada partido.",
  },
  "Oriole Park at Camden Yards": {
    location: "Baltimore, Estados Unidos",
    capacity: "45,971",
    description: "Estadio clásico de los Baltimore Orioles, apreciado por su diseño retro y vistas al Inner Harbor.",
  },
  "Paycor Stadium": {
    location: "Cincinnati, Estados Unidos",
    capacity: "65,515",
    description: "Estadio de los Cincinnati Bengals, con un ambiente intenso durante la temporada de la NFL.",
  },
  "Progressive Field": {
    location: "Cleveland, Estados Unidos",
    capacity: "34,830",
    description: "Estadio de los Cleveland Guardians, conocido por su arquitectura moderna y experiencia de fan.",
  },
  "RCDE Stadium": {
    location: "Barcelona, España",
    capacity: "40,500",
    description: "Estadio del RCD Espanyol, ubicado en Cornella y con una afición firme y cercana.",
  },
  "Riyadh Air Metropolitano": {
    location: "Madrid, España",
    capacity: "68,000",
    description: "Nombre comercial del Wanda Metropolitano, estadio moderno del Atlético de Madrid.",
  },
  "Rocket Arena": {
    location: "Houston, Estados Unidos",
    capacity: "18,300",
    description: "Arena de los Houston Rockets, con una atmósfera vibrante y entretenimiento completo.",
  },
  "San Mamés Barria": {
    location: "Bilbao, España",
    capacity: "53,000",
    description: "Estadio del Athletic Club, famoso por su diseño moderno y su afición apasionada.",
  },
  "Scotiabank Saddledome": {
    location: "Calgary, Canadá",
    capacity: "19,289",
    description: "Arena histórica de los Calgary Flames, con fuerte identidad en la NHL canadiense.",
  },
  "Selhurst Park": {
    location: "Londres, Inglaterra",
    capacity: "25,486",
    description: "Estadio del Crystal Palace, con una atmósfera intensa y un campo cercano a las gradas.",
  },
  "Soldier Field": {
    location: "Chicago, Estados Unidos",
    capacity: "61,500",
    description: "Estadio emblemático de los Chicago Bears, con vistas al lago Michigan y ambiente histórico.",
  },
  "Spectrum Center": {
    location: "Charlotte, Estados Unidos",
    capacity: "19,077",
    description: "Arena de los Charlotte Hornets, situada en el corazón del distrito financiero de Charlotte.",
  },
  "Spotify Camp Nou": {
    location: "Barcelona, España",
    capacity: "99,354",
    description: "Estadio del FC Barcelona renombrado a Spotify Camp Nou, el mayor estadio de Europa.",
  },
  "Stade Bollaert-Delelis": {
    location: "Lens, Francia",
    capacity: "38,223",
    description: "Estadio del RC Lens, conocido por su atmósfera intensa y su afición fiel.",
  },
  "Stade de l'Abbé Deschamps": {
    location: "Auxerre, Francia",
    capacity: "18,541",
    description: "Estadio del AJ Auxerre, con encanto histórico y una afición apasionada.",
  },
  "Stade du Moustoir": {
    location: "Lorient, Francia",
    capacity: "17,850",
    description: "Sede del FC Lorient, con un ambiente acogedor junto al Atlántico.",
  },
  "Stade Francis-Le Blé": {
    location: "Brest, Francia",
    capacity: "15,931",
    description: "Estadio del Stade Brestois 29, con una atmósfera cálida y una identidad regional fuerte.",
  },
  "Stade Océane": {
    location: "Le Havre, Francia",
    capacity: "25,178",
    description: "Estadio del Le Havre AC, moderno y cercano al puerto.",
  },
  "Stade Raymond Kopa": {
    location: "Angers, Francia",
    capacity: "20,296",
    description: "Estadio del SCO Angers, reconocido por su ambiente tranquilo y su historia local.",
  },
  "Stade Saint-Symphorien": {
    location: "Metz, Francia",
    capacity: "25,636",
    description: "Estadio del FC Metz, con un ambiente muy animado en la lorena francesa.",
  },
  "Stadio Artemio Franchi": {
    location: "Florencia, Italia",
    capacity: "43,147",
    description: "Estadio histórico de la Fiorentina, con arquitectura clásica y afición italiana.",
  },
  "Stadio Giovanni Zini": {
    location: "Cremona, Italia",
    capacity: "20,641",
    description: "Un estadio acogedor para el US Cremonese con una base de seguidores cercana al campo.",
  },
  "Stadio Giuseppe Meazza": {
    location: "Milán, Italia",
    capacity: "80,018",
    description: "También conocido como San Siro, hogar de AC Milan e Inter, con historia y grandeza.",
  },
  "Stadio Giuseppe Sinigaglia": {
    location: "Como, Italia",
    capacity: "13,602",
    description: "Estadio íntimo del Como 1907, en un entorno histórico junto al lago.",
  },
  "Stadio Luigi Ferraris": {
    location: "Génova, Italia",
    capacity: "36,205",
    description: "Estadio compartido por Genoa CFC y UC Sampdoria, uno de los más antiguos de Italia.",
  },
  "Stadio Marcantonio Bentegodi": {
    location: "Verona, Italia",
    capacity: "39,211",
    description: "Estadio del Hellas Verona y Chievo Verona, con un amplio aforo para el norte italiano.",
  },
  "Stadio Renato Dall'Ara": {
    location: "Bolonia, Italia",
    capacity: "38,279",
    description: "Estadio histórico del Bologna FC, con un ambiente clásico en la Serie A.",
  },
  "Stamford Bridge": {
    location: "Londres, Inglaterra",
    capacity: "40,341",
    description: "Casa del Chelsea FC desde 1905, con una atmósfera intensa en cada partido.",
  },
  "State Farm Arena": {
    location: "Atlanta, Estados Unidos",
    capacity: "17,624",
    description: "Arena de los Atlanta Hawks, con diseño moderno en el centro urbano.",
  },
  "State Farm Stadium": {
    location: "Glendale, Estados Unidos",
    capacity: "63,400",
    description: "Estadio de los Arizona Cardinals con techo retráctil y grandes eventos deportivos.",
  },
  "Sutter Health Park": {
    location: "Sacramento, Estados Unidos",
    capacity: "14,014",
    description: "Estadio íntimo de béisbol de los Sacramento River Cats.",
  },
  "TD Garden": {
    location: "Boston, Estados Unidos",
    capacity: "19,580",
    description: "Arena de los Boston Celtics y Boston Bruins, con una gran historia deportiva.",
  },
  "Truist Park": {
    location: "Atlanta, Estados Unidos",
    capacity: "41,084",
    description: "Estadio de los Atlanta Braves, diseñado como un moderno parque de béisbol.",
  },
  "Turf Moor": {
    location: "Burnley, Inglaterra",
    capacity: "21,944",
    description: "Estadio tradicional del Burnley FC con una atmósfera auténtica de la liga inglesa.",
  },
  "Unipol Domus": {
    location: "Cagliari, Italia",
    capacity: "23,000",
    description: "Estadio del Cagliari Calcio, conocido por su ambiente isleño en Cerdeña.",
  },
  "United Center": {
    location: "Chicago, Estados Unidos",
    capacity: "20,917",
    description: "Arena de los Chicago Bulls y Chicago Blackhawks, con una afición vibrante.",
  },
  "Villa Park": {
    location: "Birmingham, Inglaterra",
    capacity: "42,785",
    description: "Estadio emblemático del Aston Villa, con tradición y ambiente del fútbol inglés.",
  },
  "Vitality Stadium": {
    location: "Bournemouth, Inglaterra",
    capacity: "11,364",
    description: "Estadio compacto del Bournemouth, con ambiente familiar y público cercano.",
  },
  "Wrigley Field": {
    location: "Chicago, Estados Unidos",
    capacity: "41,649",
    description: "Clásico estadio de los Chicago Cubs, famoso por su fachada de hiedra y su historia.",
  },
};

const NORMALIZED_STADIUM_DATA = Object.fromEntries(
  Object.entries(MANUAL_STADIUM_DATA).map(([stadium, value]) => [normalizeStadiumKey(stadium), value])
);

const LEAGUES = [
  { name: "English Premier League", sport: "Fútbol" },
  { name: "Spanish La Liga", sport: "Fútbol" },
  { name: "Italian Serie A", sport: "Fútbol" },
  { name: "French Ligue 1", sport: "Fútbol" },
  { name: "NBA", sport: "Baloncesto" },
  { name: "NFL", sport: "Fútbol Americano" },
  { name: "MLB", sport: "Baseball" },
  { name: "NHL", sport: "Hockey" },
];

const SPORTS = ["Todos", "Fútbol", "Baloncesto", "Fútbol Americano", "Baseball", "Hockey"];

export default function EstadiosScreen() {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stadiumDetail, setStadiumDetail] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const { colors, dark } = useTheme();
  const { width } = useWindowDimensions();
  const isCompactFilter = width <= 360;

  useEffect(() => {
    const fetchStadiums = async () => {
      try {
        const results = await Promise.all(
          LEAGUES.map(async (league) => {
            const teams = await getTeamsByLeague(league.name);
            return (teams || [])
              .filter((team) => team.strStadium)
              .map((team) => ({
                id: `${team.idTeam}-${team.strStadium}`,
                stadiumName: team.strStadium,
                location: team.strStadiumLocation || "",
                capacity: team.intStadiumCapacity || "",
                description: team.strStadiumDescription || "",
                teamName: team.strTeam,
                teamId: team.idTeam,
                sport: league.sport,
                league: league.name,
                badge: team.strTeamBadge,
                manualInfo: NORMALIZED_STADIUM_DATA[normalizeStadiumKey(team.strStadium)] || null,
              }));
          }),
        );

        const uniqueMap = new Map();
        results.flat().forEach((item) => {
          const key = item.stadiumName.toLowerCase().trim();
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, { ...item, teams: [item.teamName] });
          } else {
            const existing = uniqueMap.get(key);
            if (!existing.teams.includes(item.teamName)) {
              existing.teams.push(item.teamName);
            }
          }
        });

        setStadiums(Array.from(uniqueMap.values()).sort((a, b) => a.stadiumName.localeCompare(b.stadiumName)));
      } catch (error) {
        console.error("Error cargando estadios:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStadiums();
  }, []);

  const filteredStadiums = useMemo(() => {
    return stadiums.filter((stadium) => {
      if (selectedSport !== "Todos" && stadium.sport !== selectedSport) {
        return false;
      }
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        stadium.stadiumName.toLowerCase().includes(query) ||
        stadium.location.toLowerCase().includes(query) ||
        stadium.teams.join(" ").toLowerCase().includes(query) ||
        stadium.league.toLowerCase().includes(query)
      );
    });
  }, [stadiums, selectedSport, searchQuery]);

  const loadStadiumDetail = async (stadium) => {
    setSelectedStadium(stadium);
    setStadiumDetail(null);
    setDetailLoading(true);
    try {
      const detail = await getTeamById(stadium.teamId);
      setStadiumDetail(detail || stadium);
    } catch (error) {
      console.error("Error cargando detalles del estadio:", error);
      setStadiumDetail(stadium);
    } finally {
      setDetailLoading(false);
    }
  };

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
    searchWrapper: {
      backgroundColor: colors.card,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    searchInput: {
      height: 42,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      color: colors.text,
      backgroundColor: colors.background,
    },
    filterToggle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: dark ? "#222" : "#f5f5f5",
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginHorizontal: 15,
      marginBottom: 10,
    },
    filterToggleText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
    },
    filterOptions: {
      paddingHorizontal: 15,
      marginBottom: 10,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      overflow: "hidden",
      flexBasis: "31%",
      marginBottom: 12,
      minHeight: 160,
    },
    cardContent: {
      padding: 12,
    },
    stadiumImage: {
      width: "100%",
      height: 100,
      resizeMode: "cover",
      backgroundColor: dark ? "#222" : "#e8e8e8",
    },
    stadiumName: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.text,
      marginTop: 0,
      marginBottom: 6,
    },
    stadiumMeta: {
      fontSize: 11,
      color: colors.secondary,
      marginBottom: 3,
      lineHeight: 16,
    },
    stadiumTeams: {
      fontSize: 11,
      color: colors.text,
      marginBottom: 6,
      lineHeight: 16,
    },
    miniBadge: {
      alignSelf: "flex-start",
      backgroundColor: colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: 10,
    },
    miniBadgeText: {
      fontSize: 10,
      color: "#fff",
      fontWeight: "700",
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 18,
      marginTop: 16,
      shadowColor: dark ? "#000" : "#000",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 5,
    },
    detailHeader: {
      marginBottom: 14,
    },
    detailTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
      marginBottom: 6,
    },
    detailSubtitle: {
      fontSize: 13,
      color: colors.secondary,
      marginBottom: 12,
    },
    detailChipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 14,
    },
    chip: {
      backgroundColor: dark ? "#2d2d2d" : "#eef2ff",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      marginRight: 8,
      marginBottom: 8,
    },
    chipText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.primary,
    },
    infoSection: {
      marginBottom: 20,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.secondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "700",
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    infoBox: {
      flex: 1,
      backgroundColor: dark ? "#1d1d1d" : "#eef3ff",
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(79,70,229,0.15)",
      marginRight: 10,
      marginBottom: 10,
    },
    descriptionBox: {
      backgroundColor: dark ? "#1d1d1d" : "#eef3ff",
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(79,70,229,0.15)",
    },
    descriptionTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: 13,
      color: colors.secondary,
      lineHeight: 20,
    },
    detailBack: {
      paddingHorizontal: 15,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    detailBackText: {
      color: colors.primary,
      fontWeight: "700",
    },
  });

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.text }}>Cargando estadios...</Text>
        </View>
      </View>
    );
  }

  if (selectedStadium) {
    const manualInfo =
      MANUAL_STADIUM_DATA[selectedStadium.stadiumName] ||
      NORMALIZED_STADIUM_DATA[normalizeStadiumKey(selectedStadium.stadiumName)] ||
      selectedStadium.manualInfo ||
      null;

    const detailInfo = {
      location:
        manualInfo?.location ||
        stadiumDetail?.strStadiumLocation ||
        selectedStadium.location ||
        "No disponible",
      capacity:
        manualInfo?.capacity ||
        stadiumDetail?.intStadiumCapacity ||
        selectedStadium.capacity ||
        "N/A",
      description:
        manualInfo?.description ||
        stadiumDetail?.strStadiumDescription ||
        selectedStadium.description ||
        "No hay descripción disponible para este estadio.",
    };

    return (
      <SafeAreaView style={dynamicStyles.container}>
        <TouchableOpacity
          style={dynamicStyles.detailBack}
          onPress={() => setSelectedStadium(null)}
        >
          <Text style={dynamicStyles.detailBackText}>{"← Volver a estadios"}</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ padding: 15 }}>
          {detailLoading ? (
            <View style={{ marginTop: 50, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.text }}>Cargando información...</Text>
            </View>
          ) : (
            <View style={dynamicStyles.detailCard}>
              <View style={dynamicStyles.detailHeader}>
                <Text style={dynamicStyles.detailTitle}>{selectedStadium.stadiumName}</Text>
                <Text style={dynamicStyles.detailSubtitle}>Estadio principal para {selectedStadium.teams.join(" • ")}</Text>
                <View style={dynamicStyles.detailChipsRow}>
                  <View style={dynamicStyles.chip}>
                    <Text style={dynamicStyles.chipText}>{selectedStadium.sport}</Text>
                  </View>
                  <View style={dynamicStyles.chip}>
                    <Text style={dynamicStyles.chipText}>{selectedStadium.league}</Text>
                  </View>
                </View>
              </View>

              <View style={dynamicStyles.infoSection}>
                <View style={dynamicStyles.infoRow}>
                  <View style={dynamicStyles.infoBox}>
                    <Text style={dynamicStyles.infoLabel}>Ubicación</Text>
                    <Text style={dynamicStyles.infoValue}>{detailInfo.location}</Text>
                  </View>
                  <View style={dynamicStyles.infoBox}>
                    <Text style={dynamicStyles.infoLabel}>Capacidad</Text>
                    <Text style={dynamicStyles.infoValue}>{detailInfo.capacity}</Text>
                  </View>
                </View>
                <View style={dynamicStyles.infoRow}>
                  <View style={dynamicStyles.infoBox}>
                    <Text style={dynamicStyles.infoLabel}>Equipos</Text>
                    <Text style={dynamicStyles.infoValue}>{selectedStadium.teams.join(" • ")}</Text>
                  </View>
                </View>
              </View>

              <View style={dynamicStyles.descriptionBox}>
                <Text style={dynamicStyles.descriptionTitle}>Descripción</Text>
                <Text style={dynamicStyles.descriptionText}>{detailInfo.description}</Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={dynamicStyles.filtersWrapper}>
        {isCompactFilter ? (
          <>
            <TouchableOpacity
              style={dynamicStyles.filterToggle}
              onPress={() => setFilterOpen((prev) => !prev)}
            >
              <Text style={dynamicStyles.filterToggleText}>
                {filterOpen ? "Ocultar filtros" : "Mostrar filtros"}
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
            contentContainerStyle={{ paddingHorizontal: 15 }}
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

      <View style={dynamicStyles.searchWrapper}>
        <TextInput
          placeholder="Buscar estadio, ciudad o equipo"
          placeholderTextColor={colors.secondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={dynamicStyles.searchInput}
        />
      </View>

      <FlatList
        data={filteredStadiums}
        keyExtractor={(item) => item.id}
        key="flatlist-3"
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 5, paddingHorizontal: 10 }}
        columnWrapperStyle={{ justifyContent: "space-between", marginBottom: 12 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20 }}>
            <Text style={{ color: colors.text }}>No se encontraron estadios para esta búsqueda.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={dynamicStyles.card}
            activeOpacity={0.8}
            onPress={() => loadStadiumDetail(item)}
          >

            <View style={dynamicStyles.cardContent}>
              <Text style={dynamicStyles.stadiumName} numberOfLines={2}>{item.stadiumName}</Text>
              <View style={dynamicStyles.miniBadge}>
                <Text style={dynamicStyles.miniBadgeText}>{item.sport}</Text>
              </View>
              <Text style={dynamicStyles.stadiumMeta} numberOfLines={1}>{item.league}</Text>
              <Text style={dynamicStyles.stadiumTeams} numberOfLines={1}>{item.teams.join(" • ")}</Text>
              {item.location ? <Text style={dynamicStyles.stadiumMeta} numberOfLines={1}>{item.location}</Text> : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
