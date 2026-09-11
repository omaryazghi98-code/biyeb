export type Broadcast = {
  country: string;
  countryCode: string;
  station: string;
  stationUrl?: string;
  logoUrl?: string;
};

const ALWAYS_VISIBLE = ["MA", "FR", "US"] as const;

export function sortBroadcastsForCountryPicker(items: Broadcast[]) {
  return [...items].sort((a, b) => {
    const ai = ALWAYS_VISIBLE.indexOf(a.countryCode as (typeof ALWAYS_VISIBLE)[number]);
    const bi = ALWAYS_VISIBLE.indexOf(b.countryCode as (typeof ALWAYS_VISIBLE)[number]);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.country.localeCompare(b.country);
  });
}

export function dedupeBroadcasts(items: Broadcast[]) {
  return [...new Map(items.map((item) => [`${item.countryCode}:${item.station}`, item])).values()];
}
