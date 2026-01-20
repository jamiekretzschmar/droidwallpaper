import { GoogleGenAI, Type } from "@google/genai";
import { Theme, ThemeColors } from "../types";

// Always create a new instance to ensure the latest API key is used
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate a consistent theme structure
export const generateThemeData = async (userPrompt: string): Promise<Partial<Theme>> => {
  const ai = getAI();
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert Android UI/UX designer. 
    Your goal is to create a cohesive theme configuration based on the user's description.
    You need to define a color palette, a name, a description, and a prompt to generate a matching wallpaper later.
    Ensure colors provide good contrast and follow Material Design principles where appropriate.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "A creative name for the theme" },
            description: { type: Type.STRING, description: "A short description of the vibe" },
            colors: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.STRING, description: "Hex code for primary color" },
                secondary: { type: Type.STRING, description: "Hex code for secondary color" },
                accent: { type: Type.STRING, description: "Hex code for accent/highlight color" },
                background: { type: Type.STRING, description: "Hex code for background color (often dark or light)" },
                surface: { type: Type.STRING, description: "Hex code for surface elements like cards" },
                text: { type: Type.STRING, description: "Hex code for main text, contrasting with background" },
              },
              required: ["primary", "secondary", "accent", "background", "surface", "text"]
            },
            wallpaperPrompt: { type: Type.STRING, description: "A detailed prompt to generate an abstract or scenic wallpaper matching this theme." },
            iconStyle: { type: Type.STRING, enum: ["minimal", "filled", "outline", "neumorphic"] }
          },
          required: ["name", "description", "colors", "wallpaperPrompt", "iconStyle"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<Theme>;
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error generating theme data:", error);
    throw error;
  }
};

export const generateWallpaperImage = async (prompt: string, highQuality: boolean = false): Promise<string> => {
  const ai = getAI();
  const model = highQuality ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";
  
  // High quality config
  const config: any = {};
  if (highQuality) {
    config.imageConfig = {
      aspectRatio: "9:16",
      imageSize: "1K" // Can be 1K, 2K, 4K. 1K is faster for preview.
    };
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { text: prompt + " --aspect-ratio 9:16 --high-quality abstract digital art wallpaper phone background, clean, aesthetic" }
        ]
      },
      config: Object.keys(config).length > 0 ? config : undefined
    });

    // Extract image from parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating wallpaper:", error);
    throw error;
  }
};

export const generateLiveWallpaperVideo = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const model = "veo-3.1-fast-generate-preview";

  try {
    let operation = await ai.models.generateVideos({
      model,
      prompt: prompt + ", vertical 9:16 phone wallpaper, abstract, moving slowly, cinematic, 4k loop, seamless",
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      throw new Error("Video generation failed: No download URI returned.");
    }

    // Fetch the video content using the API key
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Error generating live wallpaper:", error);
    throw error;
  }
};
