import { GoogleGenAI, Type } from "@google/genai";
import { AISeasonIntel, Series } from "../src/types";
import { generateSeasonIntel } from "../shared/seasonIntelService";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function fetchAISeasonIntelligence(
  seriesTitle: string,
  currentContext?: string,
  series?: Partial<Series> | null
): Promise<AISeasonIntel> {
  const ai = getAI();

  if (!ai) {
    // High-accuracy fallback using rich series metadata
    return generateSeasonIntel(seriesTitle, currentContext, series);
  }

  try {
    const prompt = `Analyze the current renewal status, upcoming season release date, production state, and cast/plot intelligence for the streaming TV series: "${seriesTitle}".
${currentContext ? `Context details: ${currentContext}` : ''}
Provide a structured analysis for fans tracking new seasons and release schedules.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a television industry expert and streaming series renewal analyst. Provide accurate, concise, and insightful intelligence on season renewals, upcoming release dates, filming status, and storyline expectations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seriesTitle: { type: Type.STRING },
            renewalStatus: { type: Type.STRING, description: "e.g., Renewed for Season 3, In Pre-Production, Final Season Coming, Concluded" },
            confirmedNextSeason: { type: Type.INTEGER, description: "Number of next upcoming season, or null if ended" },
            projectedReleaseWindow: { type: Type.STRING, description: "e.g., Autumn 2026, Q1 2027, or exact date" },
            productionStatus: { type: Type.STRING, description: "Current stage: Writing, Filming, Post-Production, or Wrapped" },
            filmingLocation: { type: Type.STRING },
            keyCastUpdates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-4 notable casting updates or returning stars"
            },
            plotTeasers: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 high-level story teasers without major unreleased spoilers"
            },
            sourcesSummary: { type: Type.STRING, description: "Trade report and studio announcement verification summary" },
            confidence: {
              type: Type.STRING,
              description: "Confidence level",
            }
          },
          required: ["seriesTitle", "renewalStatus", "projectedReleaseWindow", "productionStatus", "keyCastUpdates", "plotTeasers", "sourcesSummary", "confidence"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text from Gemini model");
    }

    const parsed = JSON.parse(text) as AISeasonIntel;
    parsed.lastUpdated = new Date().toISOString().split('T')[0];
    return parsed;
  } catch (err: any) {
    console.error("Gemini Season Intelligence Error:", err);
    return generateSeasonIntel(seriesTitle, currentContext, series);
  }
}

/**
 * Real-time AI Cinema Radar: fetches live in-theaters movies and upcoming theatrical intelligence.
 */
export async function fetchLiveTheatersRadar(): Promise<Partial<Series>[]> {
  const ai = getAI();
  if (!ai) return [];

  try {
    const currentYear = new Date().getFullYear();
    const prompt = `Provide the top 6 to 8 domestic movies currently playing in domestic movie theaters in the current year (${currentYear}) only (such as Spider-Man: Brand New Day, Toy Story 5, Coyote vs. Acme, The Dog Stars, Michael, The Batman Part II, Weapons, Project Hail Mary).
Do NOT return movies from previous years (${currentYear - 1} or earlier) or foreign/international-only releases. Return ONLY domestic releases from ${currentYear}.
For each movie include:
- title
- tagline
- synopsis (concise 2-sentence overview)
- releaseYear (must be ${currentYear})
- runtimeMinutes
- director
- genres (array of strings, e.g. ["Action", "Sci-Fi"])
- boxOffice (e.g. "$340M Domestic Box Office")
- rating (e.g. 8.4)
- theaterStatus: "now_in_theaters"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a real-time box office analyst and cinema curator. Return valid JSON only.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              tagline: { type: Type.STRING },
              synopsis: { type: Type.STRING },
              releaseYear: { type: Type.INTEGER },
              runtimeMinutes: { type: Type.INTEGER },
              director: { type: Type.STRING },
              genres: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              boxOffice: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              theaterStatus: { type: Type.STRING }
            },
            required: ['title', 'synopsis', 'releaseYear', 'genres', 'director', 'theaterStatus']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawList = JSON.parse(text) as Array<{
      title: string;
      tagline?: string;
      synopsis: string;
      releaseYear: number;
      runtimeMinutes?: number;
      director?: string;
      genres: string[];
      boxOffice?: string;
      rating?: number;
      theaterStatus?: string;
    }>;

    return rawList.map((item) => ({
      id: `ai-radar-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      mediaType: 'movie',
      title: item.title,
      tagline: item.tagline || 'In Theaters Worldwide',
      synopsis: item.synopsis,
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      providers: ['theaters'],
      primaryProvider: 'theaters',
      genres: item.genres || ['Drama'],
      rating: item.rating || 8.1,
      ratingCount: 'Live Cinema Radar',
      contentRating: 'PG-13',
      firstAirYear: item.releaseYear || currentYear,
      decade: '2020s',
      totalSeasons: 1,
      totalEpisodes: 1,
      runtimeMinutes: item.runtimeMinutes || 120,
      theaterStatus: 'now_in_theaters',
      isDomestic: true,
      boxOffice: item.boxOffice || 'Box Office Active',
      director: item.director,
      status: 'In Theaters',
      isNowPlaying: true,
      isUpcoming: false,
      isClassic: false,
      hasNewSeasonAlert: false,
      renewalState: 'airing_now',
      renewalBadgeText: 'Live Cinema Radar',
      cast: [],
      source: 'gemini_radar',
      seasons: []
    }));
  } catch (err) {
    console.warn('Gemini Live Theaters Radar error (falling back to curated radar):', err);
    return [];
  }
}

