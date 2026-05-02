# App Fútbol DPS

Una aplicación móvil interactiva construida con **React Native** y **Expo** para consultar datos de fútbol utilizando la información en tiempo real de la API de [The SportsDB](https://www.thesportsdb.com/api.php).

---

## 🚀 Requisitos e Instalación

### 1. Requisitos Previos
* Asegúrate de tener [Node.js](https://nodejs.org/) instalado.
* (Opcional) La aplicación [Expo Go](https://expo.dev/client) instalada en tu teléfono Android o iOS para probar en dispositivos físicos.

### 2. Instalación Principal del Proyecto
Abre tu terminal en la carpeta del proyecto (`app-futbol-dps`) e instala todas las dependencias del `package.json`:
```bash
npm install
```

### 3. Habilitar la compatibilidad de entorno Web (Importante)
Como pudiste notar al intentar correr la app en el navegador, **hacen falta dependencias exclusivas para web**. Para solucionar el error que te salió en consola (`CommandError... Install react-dom, react-native-web`), instala las dependencias de web en un solo paso ejecutando esto:
```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```

---

## 🏃‍♂️ Comandos para Correr la Aplicación

Para desplegar la aplicación, usa el prefijo local de la librería `npx expo`.

### Iniciar en Navegador Web 💻
Comando directo para abrir en el explorador de forma inmediata.
```bash
npm run web
# (Equivalente a: npx expo start --web)
```

### Iniciar en Dispositivo Móvil (Android/iOS) 📱
1. Inicia el servidor de desarrollo en la consola:
```bash
npx expo start
```
2. Presiona la letra `a` para abrir en emulador **Android**, `i` para abrir en simulador de **iOS** (Solo macOS), o simplemente **escanea el código QR que aparecerá en pantalla** utilizando la cámara de tu smartphone o la app de *Expo Go*.

---

## ⚽ Consumo de API: The SportsDB

Los datos del fútbol, equipos, ligas y partidos se obtienen conectándose a la API oficial de The SportsDB en su versión gratuita. 

* **Documentación Oficial OpenAPI:** [TheSportsDB OpenAPI Specs](https://www.thesportsdb.com/documentation#openapi)
* **Punto de Endpoints API v1:** `https://www.thesportsdb.com/api/v1/json/{API_KEY}/`
* **API Key Pública para Testing:** `3`

### Ejemplos útiles a consumir:
- Listar todos los equipos en una liga (Ejem: English Premier League):
  `https://www.thesportsdb.com/api/v1/json/3/search_all_teams.php?l=English%20Premier%20League`
- Calendario de próximos 15 partidos por Equipo (Ejem. Id 133604: Arsenal):
  `https://www.thesportsdb.com/api/v1/json/3/eventsnext.php?id=133604`
