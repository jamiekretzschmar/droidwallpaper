import React, { useState } from 'react';
import { PhonePreview } from './components/PhonePreview';
import { ThemeControls } from './components/ThemeControls';
import { Theme, GenerationStatus } from './types';
import { generateThemeData, generateWallpaperImage, generateLiveWallpaperVideo, editWallpaperImage, generateVideoFromImage } from './services/geminiService';
import { Menu } from 'lucide-react';

// Initial default theme
const defaultTheme: Theme = {
  id: 'default',
  name: 'Oceanic Depth',
  description: 'A deep blue aesthetic with teal accents.',
  colors: {
    primary: '#22d3ee',
    secondary: '#0ea5e9',
    accent: '#f472b6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9'
  },
  wallpaperPrompt: 'Deep ocean bioluminescence, abstract shapes, dark blue and teal gradients',
  wallpaperImage: '', 
  liveWallpaperUrl: undefined,
  activeWallpaperMode: 'image',
  iconStyle: 'filled'
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [uiMode, setUiMode] = useState<'dark' | 'light'>('dark');
  const [status, setStatus] = useState<GenerationStatus>({
    isGeneratingTheme: false,
    isGeneratingWallpaper: false,
    isGeneratingLiveWallpaper: false,
    isEditingImage: false,
    isAnimatingImage: false,
    error: null
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const triggerHaptic = (intensity: number = 10) => {
    if (navigator.vibrate) navigator.vibrate(intensity);
  };

  const ensureApiKey = async (): Promise<boolean> => {
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await window.aistudio.openSelectKey();
            return true;
        }
        return true;
      }
    } catch (e) {
      console.warn("AI Studio API Key selection check failed.", e);
    }
    return true; 
  };

  const handleError = (err: any, fallbackMessage: string) => {
    console.error(err);
    let errorMessage = fallbackMessage;
    if (err.message && err.message.includes("SAFETY")) {
        errorMessage = "Safety filters triggered. Try a different prompt.";
    } else if (err.message && err.message.includes("404")) {
        errorMessage = "API Error. Please check your API Key selection.";
        if (window.aistudio && window.aistudio.openSelectKey) {
           window.aistudio.openSelectKey(); 
        }
    } else if (err.message) {
        errorMessage = err.message;
    }
    setStatus(prev => ({ ...prev, error: errorMessage }));
  };

  const handleGenerateTheme = async (prompt: string) => {
    triggerHaptic(20);
    setStatus(prev => ({ ...prev, isGeneratingTheme: true, error: null }));
    
    try {
      const generatedData = await generateThemeData(prompt);
      
      const newTheme: Theme = {
        ...theme,
        ...generatedData,
        colors: { ...theme.colors, ...generatedData.colors },
        id: crypto.randomUUID(),
        wallpaperImage: undefined, 
        liveWallpaperUrl: undefined,
        activeWallpaperMode: 'image'
      };
      
      setTheme(newTheme);

      if (newTheme.wallpaperPrompt) {
        handleGenerateWallpaper(false, newTheme.wallpaperPrompt);
      }

    } catch (err: any) {
      handleError(err, "Failed to generate theme.");
    } finally {
      setStatus(prev => ({ ...prev, isGeneratingTheme: false }));
    }
  };

  const handleGenerateWallpaper = async (highQuality: boolean, promptOverride?: string) => {
    triggerHaptic(10);
    const promptToUse = promptOverride || theme.wallpaperPrompt;
    if (!promptToUse) {
        setStatus(prev => ({ ...prev, error: "No wallpaper prompt available." }));
        return;
    }

    if (highQuality) await ensureApiKey();

    setStatus(prev => ({ ...prev, isGeneratingWallpaper: true, error: null }));
    try {
      const base64Image = await generateWallpaperImage(promptToUse, highQuality);
      setTheme(prev => ({ 
          ...prev, 
          wallpaperImage: base64Image, 
          activeWallpaperMode: 'image' 
      }));
    } catch (err: any) {
      handleError(err, "Wallpaper generation failed.");
    } finally {
      setStatus(prev => ({ ...prev, isGeneratingWallpaper: false }));
    }
  };

  const handleEditWallpaper = async (editPrompt: string) => {
    triggerHaptic(10);
    if (!theme.wallpaperImage) {
      setStatus(prev => ({ ...prev, error: "No image to edit." }));
      return;
    }
    
    setStatus(prev => ({ ...prev, isEditingImage: true, error: null }));
    try {
      const editedBase64 = await editWallpaperImage(theme.wallpaperImage, editPrompt);
      setTheme(prev => ({ 
          ...prev, 
          wallpaperImage: editedBase64, 
          activeWallpaperMode: 'image' 
      }));
    } catch (err: any) {
      handleError(err, "Image editing failed.");
    } finally {
      setStatus(prev => ({ ...prev, isEditingImage: false }));
    }
  };

  const handleAnimateImage = async () => {
    triggerHaptic(20);
    if (!theme.wallpaperImage) {
      setStatus(prev => ({ ...prev, error: "No image to animate." }));
      return;
    }

    await ensureApiKey();
    setStatus(prev => ({ ...prev, isAnimatingImage: true, error: null }));
    try {
      const videoUrl = await generateVideoFromImage(theme.wallpaperImage, theme.wallpaperPrompt);
      setTheme(prev => ({ 
          ...prev, 
          liveWallpaperUrl: videoUrl,
          activeWallpaperMode: 'video'
      }));
    } catch (err: any) {
      handleError(err, "Animation failed.");
    } finally {
      setStatus(prev => ({ ...prev, isAnimatingImage: false }));
    }
  };

  const handleGenerateLiveWallpaper = async () => {
    triggerHaptic(20);
    if (!theme.wallpaperPrompt) {
        setStatus(prev => ({ ...prev, error: "No prompt available for video." }));
        return;
    }

    await ensureApiKey();

    setStatus(prev => ({ ...prev, isGeneratingLiveWallpaper: true, error: null }));
    try {
      const videoUrl = await generateLiveWallpaperVideo(theme.wallpaperPrompt);
      setTheme(prev => ({ 
          ...prev, 
          liveWallpaperUrl: videoUrl,
          activeWallpaperMode: 'video'
      }));
    } catch (err: any) {
      handleError(err, "Live wallpaper generation failed.");
    } finally {
      setStatus(prev => ({ ...prev, isGeneratingLiveWallpaper: false }));
    }
  };

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const toggleUiMode = () => {
    triggerHaptic(20);
    setUiMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const isWorking = status.isGeneratingTheme || status.isGeneratingWallpaper || status.isGeneratingLiveWallpaper || status.isEditingImage || status.isAnimatingImage;

  return (
    <div className={`flex h-screen w-full overflow-hidden relative font-sans transition-colors duration-500 ${uiMode === 'dark' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Dynamic Background Mesh (Only visible in dark mode or subtly in light) */}
      <div 
        className="absolute inset-0 z-0 animate-aurora transition-colors duration-[2000ms]"
        style={{
            background: uiMode === 'dark' 
                ? `radial-gradient(circle at 10% 20%, ${theme.colors.background} 0%, transparent 40%),
                   radial-gradient(circle at 90% 80%, ${theme.colors.primary}40 0%, transparent 40%),
                   radial-gradient(circle at 50% 50%, #000 0%, #050505 100%)`
                : `radial-gradient(circle at 10% 20%, ${theme.colors.background}20 0%, transparent 40%),
                   radial-gradient(circle at 90% 80%, ${theme.colors.primary}10 0%, transparent 40%),
                   radial-gradient(circle at 50% 50%, #f3f4f6 0%, #ffffff 100%)`
        }}
      />
      <div className={`absolute inset-0 z-0 opacity-30 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150 ${uiMode === 'dark' ? 'brightness-150' : 'brightness-100 invert'}`}></div>

      {/* Mobile Hamburger Button */}
      <button 
        onClick={() => {
            triggerHaptic(10);
            setIsMobileMenuOpen(true);
        }}
        className={`absolute top-6 left-6 z-30 p-3 backdrop-blur-md border rounded-full md:hidden shadow-xl active:scale-95 transition-transform ${uiMode === 'dark' ? 'bg-white/10 border-white/10 text-white' : 'bg-black/5 border-black/5 text-black'}`}
      >
        <Menu size={24} />
      </button>

      {/* Left Panel: Floating Controls (Drawer on Mobile) */}
      <div 
        className={`
            fixed inset-0 z-50 md:relative md:z-20 md:block md:w-auto h-full shadow-2xl transition-transform duration-300 ease-spring
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <ThemeControls 
            theme={theme}
            uiMode={uiMode}
            status={status}
            onUpdateTheme={updateTheme}
            onGenerateTheme={handleGenerateTheme}
            onGenerateWallpaper={(hq) => handleGenerateWallpaper(hq)}
            onGenerateLiveWallpaper={handleGenerateLiveWallpaper}
            onEditWallpaper={handleEditWallpaper}
            onAnimateImage={handleAnimateImage}
            onClose={() => {
              triggerHaptic(10);
              setIsMobileMenuOpen(false);
            }}
            onToggleUiMode={toggleUiMode}
        />
        
        {/* Mobile Backdrop for Drawer */}
        {isMobileMenuOpen && (
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm -z-10 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
        )}
      </div>

      {/* Right Panel: Preview Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 z-10 w-full">
        <div className="relative z-10 transform transition-all duration-700 ease-out hover:scale-[1.02] scale-[0.85] sm:scale-100 origin-center">
            <PhonePreview theme={theme} isGenerating={isWorking} />
            
            {/* Reflection on floor */}
            <div className={`absolute -bottom-12 left-10 right-10 h-12 bg-gradient-to-b opacity-20 blur-xl rounded-full transform scale-x-75 ${uiMode === 'dark' ? 'from-white/10 to-transparent' : 'from-black/10 to-transparent'}`}></div>
        </div>
        
        <div className="mt-8 text-center space-y-1">
            <p className={`text-xs tracking-[0.2em] font-medium uppercase font-display ${uiMode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>Simulated Environment</p>
            <p className={`text-[10px] font-mono ${uiMode === 'dark' ? 'text-gray-700' : 'text-gray-400'}`}>RENDER_ID: {theme.id.split('-')[0]}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
