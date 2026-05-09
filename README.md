# App Fútbol DPS

Aplicación móvil de deportes construida con **React Native** y **Expo**. Muestra resultados, calendario de partidos, estadísticas y directorio de equipos con datos en tiempo real de [TheSportsDB API](https://www.thesportsdb.com/api.php).

---

## Requisitos previos

- [Node.js](https://nodejs.org/) instalado
- [Expo Go](https://expo.dev/client) en tu teléfono para probar en dispositivo físico (opcional)

---

## Instalación

```bash
npm install
```

Para correr en navegador también se necesitan estas dependencias web:

```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

---

## Comandos

| Comando | Descripción |
|---|---|
| `npm run web` | Abre la app en el navegador |
| `npx expo start` | Inicia servidor de desarrollo |
| `a` (en servidor) | Abre en emulador Android |
| `i` (en servidor) | Abre en simulador iOS (solo macOS) |

Para dispositivo físico: escanear el código QR con Expo Go.

---

## Estructura del proyecto

```
app-futbol/
├── App.js                   # Punto de entrada, manejo de login/sesión
├── assets/                  # Imágenes, íconos, splash
└── src/
    ├── navigation/
    │   ├── MainContainer.js  # Bottom tab navigator (4 tabs)
    │   └── StackNavigator.js # Stack para Inicio → Detalle de equipo
    ├── screens/
    │   ├── SplashScreen.js
    │   ├── LoginScreen.js
    │   ├── HomeScreen.js
    │   ├── DetailScreen.js
    │   ├── ResultadosScreen.js
    │   ├── EventDetailScreen.js
    │   ├── CalendarioScreen.js
    │   └── Perfil.js
    └── services/
        ├── sportsApi.js      # Llamadas a TheSportsDB
        └── favoritesStore.js # Estado de equipos favoritos
```

---

## Navegación

La app usa un **Bottom Tab Navigator** con 4 pestañas:

| Pestaña | Ícono | Pantalla |
|---|---|---|
| Inicio | 🏠 | Directorio de equipos (Premier League) |
| Resultados | 🏆 | Resultados pasados con estadísticas |
| Perfil | 👤 | Perfil de usuario y favoritos |
| Calendario | 📅 | Próximos partidos |

---

## Pantallas

### SplashScreen
Pantalla de carga animada con logo al iniciar la app.

### LoginScreen
Formulario de acceso con animación de entrada.

- Usuario: `ander.dps`
- Contraseña: `holamundo503`

La sesión se persiste en `AsyncStorage` con la clave `LOGIN_STATE`.

---

### Inicio — Directorio de Equipos
Listado de todos los equipos de la Premier League con escudo, nombre del equipo, estadio y año de fundación. Al tocar un equipo abre la pantalla de detalle.

**API usada:**
```
GET /search_all_teams.php?l=English%20Premier%20League
```

---

### Detalle de Equipo
Pantalla completa de un equipo con:
- Banner y colores del equipo
- Plantilla de jugadores (scroll horizontal) con foto y posición
- Próximos partidos del equipo
- Historia del club

**APIs usadas:**
```
GET /lookup_all_players.php?id={idEquipo}
GET /eventsnext.php?id={idEquipo}
```

---

### Resultados
Pantalla principal de resultados con:

**Filtros disponibles:**
- Por deporte: Todos / Fútbol / Baloncesto / Fútbol Americano / Baseball / Hockey
- Búsqueda inteligente por equipo: escribe el nombre y selecciona de las sugerencias — filtra todos los partidos de ese equipo

**Datos por partido:**
- Escudos de ambos equipos
- Marcador final
- Fecha y temporada
- Goleadores (cuando disponibles)
- Tarjetas amarillas y rojas (cuando disponibles)

Al tocar un partido abre **EventDetailScreen**.

**Ligas cargadas:** Premier League, La Liga, Serie A, Ligue 1, NBA, NFL, MLB, NHL (3 partidos más recientes por liga)

**API usada:**
```
GET /eventspastleague.php?id={idLiga}
```

---

### Detalle de Partido
Vista completa de un partido con:
- Escudos, marcador y estrellas de favorito para cada equipo
- Temporada y fecha
- Sección de goleadores con cada gol en su línea
- Tarjetas amarillas y rojas por equipo
- Botón **▶ Ver highlights en YouTube** (cuando TheSportsDB tiene el link)
- Estadísticas del partido (tiros, posesión, etc. — cuando disponibles)
- Información adicional: estadio, árbitro, espectadores

**APIs usadas:**
```
GET /lookupevent.php?id={idEvento}
GET /lookupeventstats.php?id={idEvento}
```

---

### Calendario
Próximos partidos de todas las ligas con:
- Filtro por deporte
- Escudos de ambos equipos
- Fecha y hora del partido (horario de El Salvador, UTC-6)
- Estadio

**Ligas cargadas:** Premier League, La Liga, Serie A, Ligue 1, NBA, NFL, MLB, NHL

**API usada:**
```
GET /eventsnextleague.php?id={idLiga}
```

---

### Perfil
- Nombre y correo del usuario
- Contador de equipos favoritos
- Lista de equipos favoritos con escudo — tocar quita de favoritos
- Toggle de notificaciones
- Botón de cerrar sesión

---

## Servicios

### sportsApi.js
Wrapper de TheSportsDB API. Base URL: `https://www.thesportsdb.com/api/v1/json/3`

| Función | Endpoint | Descripción |
|---|---|---|
| `getEventsByLeague(leagueId)` | `/eventspastleague.php` | Partidos pasados por liga |
| `getEventDetail(eventId)` | `/lookupevent.php` | Detalle de un partido |
| `getEventStats(eventId)` | `/lookupeventstats.php` | Estadísticas de un partido |

### favoritesStore.js
Manejo de equipos favoritos en memoria con patrón observable.

| Función | Descripción |
|---|---|
| `getFavorites()` | Devuelve lista de favoritos |
| `addFavorite(team)` | Agrega equipo |
| `removeFavorite(teamId)` | Elimina equipo |
| `isFavorite(teamId)` | Verifica si es favorito |
| `subscribe(listener)` | Suscribirse a cambios |

Favoritos por defecto: Manchester United, Real Madrid.

---

## API — TheSportsDB

- **Documentación:** https://www.thesportsdb.com/documentation
- **Base URL:** `https://www.thesportsdb.com/api/v1/json/3/`
- **API Key usada:** `3` (tier gratuito)

### Ligas configuradas

| ID | Liga | Deporte |
|---|---|---|
| 4328 | Premier League | Fútbol |
| 4335 | La Liga | Fútbol |
| 4332 | Serie A | Fútbol |
| 4334 | Ligue 1 | Fútbol |
| 4387 | NBA | Baloncesto |
| 4391 | NFL | Fútbol Americano |
| 4424 | MLB | Baseball |
| 4380 | NHL | Hockey |

---

## Dependencias principales

| Paquete | Versión | Uso |
|---|---|---|
| `expo` | 54.0.34 | Framework base |
| `react-native` | 0.81.5 | Motor de la app |
| `react` | 19.1.0 | UI |
| `@react-navigation/bottom-tabs` | 7.15.5 | Navegación por pestañas |
| `@react-navigation/native-stack` | 7.14.4 | Navegación en stack |
| `react-native-paper` | 5.12.0 | Componentes Material Design |
| `@expo/vector-icons` | 15.0.3 | Íconos (Ionicons) |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistencia de sesión |
| `expo-av` | 16.0.8 | Soporte de audio/video |

---

## Rama de desarrollo

## Base de Datos de Supabase 

La pueden usar para guardar favoritos, foto de perfil y usuarios en la tabla de supabase  `users` esta de assets user.png


### Ejemplos útiles a consumir:
- Listar todos los equipos en una liga (Ejem: English Premier League):
  `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English%20Premier%20League`
- Calendario de próximos 15 partidos por Equipo (Ejem. Id 133604: Arsenal):
  `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=133604`
