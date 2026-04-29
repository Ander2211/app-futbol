let favorites = [
  { id: 'Manchester United', name: 'Manchester United', league: 'Premier League', code: 'MAN' },
  { id: 'Real Madrid', name: 'Real Madrid', league: 'La Liga', code: 'REA' },
];

let listeners = [];

export const getFavorites = () => favorites;

export const addFavorite = (team) => {
  if (!favorites.find(f => f.id === team.id)) {
    favorites = [...favorites, team];
    listeners.forEach(l => l(favorites));
  }
};

export const removeFavorite = (teamId) => {
  favorites = favorites.filter(f => f.id !== teamId);
  listeners.forEach(l => l(favorites));
};

export const isFavorite = (teamId) => !!favorites.find(f => f.id === teamId);

export const subscribe = (listener) => {
  listeners.push(listener);
  return () => { listeners = listeners.filter(l => l !== listener); };
};
