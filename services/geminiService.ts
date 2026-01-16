import { GoogleGenAI } from "@google/genai";
import { WaterDataPoint, StatusLevel, BeachGroup } from "../types";

// Note: In a real deployment, this should be proxied through a backend to protect the key.
// For GitHub Pages deployment, the API key is optional. Set VITE_API_KEY in your .env file.
const apiKey = import.meta.env.VITE_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeWaterQuality = async (
  beachName: string,
  history: WaterDataPoint[],
  currentStatus: StatusLevel
): Promise<string> => {
  if (!ai) {
    return "AI analysis requires an API key. See the current status above for safety information.";
  }

  try {
    const prompt = `
      You are a beach safety expert. Provide a safety summary for ${beachName} in San Diego.

      Live Data:
      - Current Official Status: ${currentStatus}

      Context:
      - If status is SAFE/OPEN: The water is clean and bacteria levels are low.
      - If status is WARNING/ADVISORY: Bacteria levels may have exceeded health standards, possibly due to runoff or recent rain.
      - If status is DANGER/CLOSED: The water is contaminated (sewage or high bacteria). Avoid contact.

      Task:
      Write a 1-2 sentence friendly summary for a swimmer or surfer.
      Focus on the official status (${currentStatus}).
      Keep it helpful, concise, and safe. Do not use markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to analyze data at this moment.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "AI Analysis currently unavailable.";
  }
};

export const getCountySummary = async (beaches: BeachGroup[]): Promise<string> => {
  if (!ai) {
    const openCount = beaches.filter(b => b.currentStatus === StatusLevel.SAFE).length;
    const closedCount = beaches.filter(b => b.currentStatus === StatusLevel.DANGER).length;
    const advisoryCount = beaches.filter(b => b.currentStatus === StatusLevel.WARNING).length;
    return `Monitoring ${beaches.length} beaches: ${openCount} open, ${advisoryCount} advisory, ${closedCount} closed.`;
  }

  try {
    const openCount = beaches.filter(b => b.currentStatus === StatusLevel.SAFE).length;
    const closedCount = beaches.filter(b => b.currentStatus === StatusLevel.DANGER).length;
    const advisoryCount = beaches.filter(b => b.currentStatus === StatusLevel.WARNING).length;

    // Get list of closed regions for context
    const closedBeaches = beaches
      .filter(b => b.currentStatus === StatusLevel.DANGER)
      .map(b => b.name)
      .join(', ');

    const prompt = `
      You are a water quality scientist for San Diego County.

      Data Snapshot:
      - Total Beaches Monitored: ${beaches.length}
      - Open: ${openCount}
      - Advisory: ${advisoryCount}
      - Closed: ${closedCount}
      - Specific Closures: ${closedBeaches || "None"}

      Task:
      Write a concise, 2-3 sentence "State of the Union" summary of San Diego's water quality trends over the last 30 days based on this snapshot.
      Mention if specific regions (like South Bay vs North County) are disproportionately affected.
      Do not use markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Gemini summary failed:", error);
    return "Unable to generate county summary.";
  }
}