const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

export const getEventsByLeague = async (leagueId) => {
  const res = await fetch(`${BASE_URL}/eventspastleague.php?id=${leagueId}`);
  const data = await res.json();
  return data.events;
};

export const getEventDetail = async (eventId) => {
  const res = await fetch(`${BASE_URL}/lookupevent.php?id=${eventId}`);
  const data = await res.json();
  return data.events?.[0];
};

export const getEventStats = async (eventId) => {
  const res = await fetch(`${BASE_URL}/lookupeventstats.php?id=${eventId}`);
  const data = await res.json();
  return data.eventstats;
};

export const getTeamBadge = async (teamName) => {
  const res = await fetch(`${BASE_URL}/searchteams.php?t=${encodeURIComponent(teamName)}`);
  const data = await res.json();
  return data.teams?.[0]?.strBadge || null;
};

export default {};
