const BASE_URL = process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";

export type ApiFootballPlayer = {
  player: {
    id: number;
    name: string;
    firstname?: string;
    lastname?: string;
    age?: number;
    nationality?: string;
    photo?: string;
  };
  statistics: Array<{
    team?: { id: number; name: string; logo: string };
    games?: { position?: string };
  }>;
};

export type ApiFootballFixture = {
  fixture: {
    id: number;
    date: string;
    status?: { short?: string };
    venue?: { name?: string };
  };
  league?: { name?: string };
  teams: {
    home: { id: number; name: string; logo?: string };
    away: { id: number; name: string; logo?: string };
  };
};

async function request<T>(path: string, params: Record<string, string | number>) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) throw new Error("API_FOOTBALL_KEY is not configured");

  const url = new URL(`${BASE_URL}${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, String(value));

  const response = await fetch(url, {
    headers: { "x-apisports-key": key },
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error(`API-Football request failed: ${response.status}`);
  return (await response.json()) as { response: T; errors?: Record<string, string> };
}

export async function searchPlayers(name: string) {
  return request<ApiFootballPlayer[]>("/players", { search: name, season: new Date().getFullYear() });
}

export async function getTeamFixtures(teamId: number, season = new Date().getFullYear()) {
  return request<ApiFootballFixture[]>("/fixtures", { team: teamId, season });
}

export async function getFixture(fixtureId: number) {
  return request<ApiFootballFixture[]>("/fixtures", { id: fixtureId });
}
