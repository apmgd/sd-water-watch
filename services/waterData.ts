
import { BeachGroup, BeachSite, AreaGroup, StatusLevel, WaterDataPoint } from '../types';

const SD_COUNTY_API_URL = "https://services1.arcgis.com/eGSDp8lpKe5izqVc/arcgis/rest/services/Beach_Water_Quality_Closures_and_Advisories/FeatureServer/0/query";

// ArcGIS fields mapping
interface ArcGISFeature {
  attributes: {
    Name: string;
    WaterContact: string; // "Open", "Advisory", "Closure"
    Date: number; // Timestamp
    Reason: string;
  };
}


const generateProjectedHistory = (status: StatusLevel): WaterDataPoint[] => {
  const history: WaterDataPoint[] = [];
  const today = new Date();
  const DANGER_THRESHOLD = 104; 
  
  // Set baselines based on current status
  let targetValue = 50; // Default Safe
  if (status === StatusLevel.WARNING) targetValue = 110;
  if (status === StatusLevel.DANGER) targetValue = 250;

  let currentValue = targetValue;

  // Generate 180 days of data
  for (let i = 0; i < 180; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    
    // More organic noise generation
    const noise = (Math.random() - 0.5) * 60;
    
    // Create 'events' where pollution spikes happen occasionally in history
    let eventSpike = 0;
    if (Math.random() > 0.9) eventSpike = 150; // Occasional bad day
    
    // If it's further back in time, tend towards 'Safe' baseline to simulate current event being new
    const drift = i > 10 ? (50 - currentValue) * 0.1 : 0; 

    let val = currentValue + drift + noise + eventSpike;
    val = Math.max(5, val); // Minimum bacterial count
    
    // Update current value for next iteration (smoothing)
    currentValue = val;

    history.unshift({
      date: d.toISOString().split('T')[0],
      value: Math.round(val),
      threshold: DANGER_THRESHOLD
    });
  }
  return history;
};

const mapStatus = (arcGisStatus: string | null | undefined): StatusLevel => {
  if (!arcGisStatus) return StatusLevel.SAFE;
  const s = String(arcGisStatus).toLowerCase();
  // Check for various forms of "Closed" or "Closure"
  if (s.includes('clos')) return StatusLevel.DANGER;
  // Check for "Advisory" or "Warning"
  if (s.includes('advis') || s.includes('warn')) return StatusLevel.WARNING;
  return StatusLevel.SAFE;
};

const assignRegion = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('imperial') || n.includes('tijuana') || n.includes('coronado') || n.includes('silver strand')) {
    return "South Bay";
  }
  if (n.includes('ocean beach') || n.includes('mission') || n.includes('pacific beach') || n.includes('sunset cliffs')) {
    return "Central";
  }
  if (n.includes('la jolla') || n.includes('torrey') || n.includes('del mar') || n.includes('solana') || n.includes('cardiff') || n.includes('encinitas') || n.includes('moonlight') || n.includes('carlsbad') || n.includes('oceanside')) {
    return "North County";
  }
  return "San Diego County";
};

const assignAreaName = (siteName: string): string => {
  const n = siteName.toLowerCase();

  // Imperial Beach (includes Tijuana Slough)
  if (n.includes('imperial') || n.includes('tijuana')) {
    return "Imperial Beach";
  }

  // Coronado (includes Silver Strand)
  if (n.includes('coronado') || n.includes('silver strand')) {
    return "Coronado";
  }

  // Ocean Beach
  if (n.includes('ocean beach') || n.includes('ob ')) {
    return "Ocean Beach";
  }

  // Mission Bay
  if (n.includes('mission')) {
    return "Mission Bay";
  }

  // Pacific Beach
  if (n.includes('pacific beach') || n.includes('pb ')) {
    return "Pacific Beach";
  }

  // La Jolla (all La Jolla sites)
  if (n.includes('la jolla') || n.includes('torrey')) {
    return "La Jolla";
  }

  // Del Mar
  if (n.includes('del mar')) {
    return "Del Mar";
  }

  // Solana Beach / Encinitas
  if (n.includes('solana') || n.includes('encinitas') || n.includes('moonlight') || n.includes('cardiff')) {
    return "Encinitas / Solana Beach";
  }

  // Carlsbad
  if (n.includes('carlsbad')) {
    return "Carlsbad";
  }

  // Oceanside
  if (n.includes('oceanside')) {
    return "Oceanside";
  }

  // Default: use the site name as area name
  return siteName;
};

const getLast48HoursReadings = (history: WaterDataPoint[]): number[] => {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  return history
    .filter(point => new Date(point.date) >= twoDaysAgo)
    .map(point => point.value);
};

const calculateAreaMetrics = (sites: BeachSite[]): { highest: number; average: number; worstStatus: StatusLevel } => {
  let allReadings: number[] = [];
  let worstStatus = StatusLevel.SAFE;

  sites.forEach(site => {
    const readings = getLast48HoursReadings(site.history);
    allReadings = allReadings.concat(readings);

    // Determine worst status
    if (site.currentStatus === StatusLevel.DANGER) {
      worstStatus = StatusLevel.DANGER;
    } else if (site.currentStatus === StatusLevel.WARNING && worstStatus !== StatusLevel.DANGER) {
      worstStatus = StatusLevel.WARNING;
    }
  });

  const highest = allReadings.length > 0 ? Math.max(...allReadings) : 0;
  const average = allReadings.length > 0 ? Math.round(allReadings.reduce((a, b) => a + b, 0) / allReadings.length) : 0;

  return { highest, average, worstStatus };
};

const processSites = (features: ArcGISFeature[]): BeachSite[] => {
  return features.map((f, index) => {
      // Safe checks for missing attributes
      const rawStatus = f.attributes?.WaterContact || "Open";
      const name = f.attributes?.Name || "Unknown Beach";
      const dateVal = f.attributes?.Date || Date.now();
      const reason = f.attributes?.Reason || "";

      const status = mapStatus(rawStatus);

      return {
        id: `sd-site-${index}`,
        name: name,
        currentStatus: status,
        lastUpdated: new Date(dateVal).toISOString(),
        reason: reason,
        history: generateProjectedHistory(status),
        latitude: 0,
        longitude: 0
      };
    });
};

const groupSitesByArea = (sites: BeachSite[]): AreaGroup[] => {
  // Group sites by area name
  const areaMap = new Map<string, BeachSite[]>();

  sites.forEach(site => {
    const areaName = assignAreaName(site.name);
    if (!areaMap.has(areaName)) {
      areaMap.set(areaName, []);
    }
    areaMap.get(areaName)!.push(site);
  });

  // Convert map to AreaGroup array
  const areas: AreaGroup[] = [];
  let areaIndex = 0;

  areaMap.forEach((sitesInArea, areaName) => {
    const { highest, average, worstStatus } = calculateAreaMetrics(sitesInArea);
    const region = assignRegion(sitesInArea[0].name);
    const mostRecentUpdate = sitesInArea
      .map(s => new Date(s.lastUpdated).getTime())
      .reduce((a, b) => Math.max(a, b), 0);

    areas.push({
      id: `sd-area-${areaIndex++}`,
      name: areaName,
      region: region,
      sites: sitesInArea,
      highestReading48h: highest,
      averageReading48h: average,
      worstStatus: worstStatus,
      lastUpdated: new Date(mostRecentUpdate).toISOString()
    });
  });

  return areas;
};

export const getAreas = async (): Promise<AreaGroup[]> => {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "Name,WaterContact,Date,Reason",
    f: "json",
    orderByFields: "Name ASC"
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10s

  try {
    const response = await fetch(`${SD_COUNTY_API_URL}?${params.toString()}`, {
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.features || data.features.length === 0) {
      throw new Error("No data returned from API");
    }

    const sites = processSites(data.features);
    const areas = groupSitesByArea(sites);

    console.log(`Successfully loaded ${sites.length} sites grouped into ${areas.length} areas`);
    return areas;

  } catch (error) {
    console.error("Failed to fetch water quality data:", error);
    // Return empty array - the UI will show an appropriate error message
    return [];
  }
};

// Legacy function for backwards compatibility
export const getBeaches = getAreas;
