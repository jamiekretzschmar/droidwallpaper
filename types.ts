export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  surface: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  wallpaperPrompt: string;
  wallpaperImage?: string; // Base64 string
  liveWallpaperUrl?: string; // Blob URL for video
  activeWallpaperMode: 'image' | 'video';
  iconStyle: 'minimal' | 'filled' | 'outline' | 'neumorphic';
}

export interface GenerationStatus {
  isGeneratingTheme: boolean;
  isGeneratingWallpaper: boolean;
  isGeneratingLiveWallpaper: boolean;
  error: string | null;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
}
