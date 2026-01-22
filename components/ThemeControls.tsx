import React, { useState } from 'react';
import { Theme, GenerationStatus } from '../types';
import { ColorPicker } from './ColorPicker';
import { toPng } from 'html-to-image';
import { Wand2, Image as ImageIcon, Download, Loader2, Upload, AlertCircle, Video, Sparkles, ChevronDown, ChevronUp, Palette, Smartphone, Layers, X, Sun, Moon, PlayCircle, MonitorPlay, Shuffle, FileJson, ImageIcon as ImageIconSmall, FileUp, Edit3, Film } from 'lucide-react';

interface ThemeControlsProps {
  theme: Theme;
  status: GenerationStatus;
  uiMode: 'dark' | 'light';
  onUpdateTheme: (updates: Partial<Theme>) => void;
  onGenerateTheme: (prompt: string) => void;
  onGenerateWallpaper: (highQuality: boolean) => void;
  onGenerateLiveWallpaper: () => void;
  onEditWallpaper: (prompt: string) => void;
  onAnimateImage: () => void;
  onClose?: () => void;
  onToggleUiMode: () => void;
}

const PRESET_PALETTES = [
    {
        name: 'Cyber Neon',
        colors: { primary: '#00f0ff', secondary: '#7000ff', accent: '#ff003c', background: '#050505', surface: '#101010', text: '#ffffff' }
    },
    {
        name: 'Sunset Vibes',
        colors: { primary: '#ff7e5f', secondary: '#feb47b', accent: '#ff9966', background: '#2d1b2e', surface: '#4a2c4a', text: '#ffe6e6' }
    },
    {
        name: 'Forest Rain',
        colors: { primary: '#4ade80', secondary: '#22c55e', accent: '#fbbf24', background: '#022c22', surface: '#064e3b', text: '#ecfccb' }
    },
    {
        name: 'Deep Blue',
        colors: { primary: '#38bdf8', secondary: '#818cf8', accent: '#f472b6', background: '#0f172a', surface: '#1e293b', text: '#f8fafc' }
    },
    {
        name: 'Soft Pastel',
        colors: { primary: '#f9a8d4', secondary: '#c4b5fd', accent: '#2dd4bf', background: '#fff1f2', surface: '#ffffff', text: '#4b5563' }
    },
    {
        name: 'Royal Gold',
        colors: { primary: '#fbbf24', secondary: '#d97706', accent: '#f59e0b', background: '#451a03', surface: '#78350f', text: '#fef3c7' }
    },
    {
        name: 'Monochrome',
        colors: { primary: '#e5e7eb', secondary: '#9ca3af', accent: '#ffffff', background: '#111827', surface: '#1f2937', text: '#f3f4f6' }
    },
     {
        name: 'Vaporwave',
        colors: { primary: '#ff00c1', secondary: '#9600ff', accent: '#00fff9', background: '#0d0221', surface: '#261447', text: '#ffffff' }
    }
];

export const ThemeControls: React.FC<ThemeControlsProps> = ({
  theme,
  status,
  uiMode,
  onUpdateTheme,
  onGenerateTheme,
  onGenerateWallpaper,
  onGenerateLiveWallpaper,
  onEditWallpaper,
  onAnimateImage,
  onClose,
  onToggleUiMode,
}) => {
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [useHighQuality, setUseHighQuality] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('colors');
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const toggleSection = (section: string) => {
    triggerHaptic();
    setActiveSection(activeSection === section ? null : section);
  };

  const handleShufflePalette = () => {
    triggerHaptic();
    const nextIndex = (paletteIndex + 1) % PRESET_PALETTES.length;
    setPaletteIndex(nextIndex);
    onUpdateTheme({ colors: PRESET_PALETTES[nextIndex].colors });
  };

  const handleColorChange = (key: keyof Theme['colors'], value: string) => {
    onUpdateTheme({
      colors: {
        ...theme.colors,
        [key]: value
      }
    });
  };

  const handleExportJson = () => {
    triggerHaptic();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(theme, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${theme.name.replace(/\s+/g, '_').toLowerCase()}_theme.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleExportImage = async () => {
    triggerHaptic();
    setIsExportingImage(true);
    const node = document.getElementById('phone-preview-target');
    if (node) {
        try {
            // Increase pixel ratio for high quality
            const dataUrl = await toPng(node, { 
                cacheBust: true, 
                pixelRatio: 2,
                backgroundColor: 'transparent',
                style: {
                    transform: 'scale(1)', // Ensure it captures at 100% scale even if transformed by CSS in view
                    margin: '0'
                }
            });
            const link = document.createElement('a');
            link.download = `${theme.name.replace(/\s+/g, '_')}_preview.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate image', err);
        } finally {
            setIsExportingImage(false);
        }
    } else {
        setIsExportingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerHaptic();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onUpdateTheme({ wallpaperImage: reader.result, activeWallpaperMode: 'image' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerHaptic();
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
            const json = JSON.parse(event.target?.result as string);
            if (json && json.colors) {
                onUpdateTheme(json);
            } else {
                alert("Invalid theme file.");
            }
        } catch (err) {
            console.error("Failed to parse JSON", err);
            alert("Failed to load theme.");
        }
      };
      reader.readAsText(file);
    }
  };

  const iconStyles: Theme['iconStyle'][] = ['minimal', 'filled', 'outline', 'neumorphic'];

  const themeClasses = {
    container: uiMode === 'dark' ? 'bg-[#050505]/90 border-white/10' : 'bg-white/90 border-black/10 shadow-[4px_0_24px_rgba(0,0,0,0.05)]',
    text: uiMode === 'dark' ? 'text-white' : 'text-gray-900',
    subText: uiMode === 'dark' ? 'text-gray-400' : 'text-gray-500',
    sectionHeader: uiMode === 'dark' ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-black/5',
    sectionHeaderActive: uiMode === 'dark' ? 'bg-white/10 text-white shadow-lg' : 'bg-black/5 text-gray-900 shadow-sm',
    inputBg: uiMode === 'dark' ? 'bg-[#0a0a0a] border-white/10 text-gray-200 placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400',
    cardBg: uiMode === 'dark' ? 'bg-[#0f0f0f]/50 border-white/5' : 'bg-white border-black/5 shadow-sm',
    buttonGhost: uiMode === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700',
    footer: uiMode === 'dark' ? 'bg-black/40 border-white/10' : 'bg-white/50 border-black/5',
    exportBtn: uiMode === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800',
    secondaryBtn: uiMode === 'dark' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  };

  const SectionHeader = ({ id, icon: Icon, title }: { id: string, icon: any, title: string }) => (
    <button 
        onClick={() => toggleSection(id)}
        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all backdrop-blur-md ${activeSection === id ? themeClasses.sectionHeaderActive : themeClasses.sectionHeader}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={18} />
            <span className="text-sm font-medium tracking-wide">{title}</span>
        </div>
        {activeSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  return (
    <div className={`flex flex-col h-full backdrop-blur-2xl border-r w-full md:w-[480px] relative z-50 shadow-2xl transition-colors duration-500 ${themeClasses.container}`}>
      
      {/* Header Area */}
      <div className={`p-6 md:p-8 pb-6 border-b flex items-start justify-between ${uiMode === 'dark' ? 'border-white/5' : 'border-black/5'}`}>
        <div>
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <Smartphone size={18} className="text-white" />
                </div>
                <h1 className={`text-xl font-bold font-display tracking-tight ${themeClasses.text}`}>
                DroidTheme <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">AI</span>
                </h1>
            </div>
            <p className={`text-xs pl-11 font-medium tracking-wide opacity-70 ${themeClasses.subText}`}>GEN 2.0 • ULTRA-REALISTIC PREVIEW</p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* UI Mode Toggle */}
            <button
                onClick={onToggleUiMode}
                className={`p-2 rounded-lg transition-colors ${uiMode === 'dark' ? 'bg-white/5 hover:bg-white/10 text-gray-400' : 'bg-black/5 hover:bg-black/10 text-gray-600'}`}
            >
                {uiMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {/* Mobile Close Button */}
            <button 
                onClick={onClose} 
                className={`md:hidden p-2 rounded-lg ${uiMode === 'dark' ? 'text-gray-400 hover:text-white bg-white/5' : 'text-gray-600 hover:text-black bg-black/5'}`}
            >
                <X size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Error Message */}
        {status.error && (
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-md rounded-2xl p-4 flex items-start gap-3 animate-pulse">
                <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                <p className="text-red-400 text-xs font-medium leading-relaxed">{status.error}</p>
            </div>
        )}

        {/* AI Input - "Command Center" Style */}
        <div className="space-y-3">
            <label className={`text-[10px] uppercase tracking-widest font-bold ml-1 ${themeClasses.subText}`}>Directive</label>
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your vision (e.g., 'Neon Tokyo rain, cyberpunk glass, deep purple & cyan')"
                    className={`relative w-full h-28 border rounded-xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none shadow-inner transition-colors ${themeClasses.inputBg}`}
                />
                <button
                    onClick={() => {
                        triggerHaptic();
                        onGenerateTheme(prompt);
                    }}
                    disabled={status.isGeneratingTheme || !prompt.trim()}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white disabled:opacity-0 transition-all shadow-lg shimmer-effect overflow-hidden"
                >
                    {status.isGeneratingTheme ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                </button>
            </div>
        </div>

        <div className={`h-px w-full my-2 ${uiMode === 'dark' ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent' : 'bg-gradient-to-r from-transparent via-black/10 to-transparent'}`}></div>

        {/* Manual Controls - Accordion */}
        <div className="space-y-2">
            
            {/* Colors Section */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${themeClasses.cardBg}`}>
                <SectionHeader id="colors" icon={Palette} title="Chromatic Tuning" />
                
                {activeSection === 'colors' && (
                    <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                         {/* Palette Strip Visualizer with Shuffle */}
                         <div className="flex items-center gap-3 mb-4">
                            <div className="flex h-4 rounded-full overflow-hidden w-full shadow-md opacity-90 ring-1 ring-white/10">
                                {Object.values(theme.colors).map((c, i) => (
                                    <div key={i} className="flex-1 transition-colors duration-500" style={{ backgroundColor: c }}></div>
                                ))}
                            </div>
                            <button 
                                onClick={handleShufflePalette}
                                className={`p-2 rounded-lg transition-all hover:scale-105 active:scale-95 ${themeClasses.buttonGhost}`}
                                title="Cycle Palette"
                            >
                                <Shuffle size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <ColorPicker label="Primary Dominant" color={theme.colors.primary} onChange={(c) => handleColorChange('primary', c)} />
                            <ColorPicker label="Secondary Flow" color={theme.colors.secondary} onChange={(c) => handleColorChange('secondary', c)} />
                            <ColorPicker label="Accent Highlight" color={theme.colors.accent} onChange={(c) => handleColorChange('accent', c)} />
                            <ColorPicker label="Background Base" color={theme.colors.background} onChange={(c) => handleColorChange('background', c)} />
                            <ColorPicker label="Surface Glass" color={theme.colors.surface} onChange={(c) => handleColorChange('surface', c)} />
                            <ColorPicker label="Text Contrast" color={theme.colors.text} onChange={(c) => handleColorChange('text', c)} />
                        </div>
                    </div>
                )}
            </div>

            {/* Icons Section */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${themeClasses.cardBg}`}>
                 <SectionHeader id="icons" icon={Layers} title="Iconography" />
                 {activeSection === 'icons' && (
                    <div className="p-4 pt-0 grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                        {iconStyles.map((style) => (
                            <button
                                key={style}
                                onClick={() => {
                                    triggerHaptic();
                                    onUpdateTheme({ iconStyle: style });
                                }}
                                className={`relative p-3 rounded-xl border transition-all duration-300 group flex flex-col items-center gap-2 ${
                                    theme.iconStyle === style
                                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-500'
                                        : themeClasses.buttonGhost
                                }`}
                            >
                                {/* Visual Representation of Style */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    style === 'outline' ? 'border-2 border-current bg-transparent' :
                                    style === 'filled' ? 'bg-current text-white' :
                                    style === 'neumorphic' ? (uiMode === 'dark' ? 'bg-gray-700 shadow-inner text-current' : 'bg-gray-200 shadow-inner text-current') :
                                    (uiMode === 'dark' ? 'bg-gray-700/50 text-current' : 'bg-gray-300 text-current')
                                }`}>
                                    <div className={`w-3 h-3 rounded-sm opacity-70 ${style === 'filled' ? 'bg-white' : 'bg-current'}`}></div>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider">{style}</span>
                            </button>
                        ))}
                    </div>
                 )}
            </div>

            {/* Wallpaper Section */}
            <div className={`rounded-2xl border overflow-hidden transition-colors ${themeClasses.cardBg}`}>
                 <SectionHeader id="wallpaper" icon={ImageIcon} title="Reality Engine" />
                 {activeSection === 'wallpaper' && (
                     <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${uiMode === 'dark' ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
                            <span className={`text-xs ${themeClasses.subText}`}>HD Rendering (Nano Pro)</span>
                            <button 
                                onClick={() => {
                                    triggerHaptic();
                                    setUseHighQuality(!useHighQuality);
                                }}
                                className={`w-10 h-5 rounded-full relative transition-colors ${useHighQuality ? 'bg-blue-600' : 'bg-gray-500'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${useHighQuality ? 'left-6' : 'left-1'}`}></div>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                             <button 
                                onClick={() => {
                                    triggerHaptic();
                                    onGenerateWallpaper(useHighQuality);
                                }}
                                disabled={status.isGeneratingWallpaper || status.isGeneratingLiveWallpaper}
                                className={`p-3 rounded-xl flex flex-col items-center justify-center gap-2 border transition-all group disabled:opacity-50 ${themeClasses.buttonGhost}`}
                            >
                                {status.isGeneratingWallpaper ? <Loader2 className="animate-spin text-blue-400" size={20}/> : <Sparkles className="text-blue-400 group-hover:scale-110 transition-transform" size={20} />}
                                <span className="text-[10px] font-medium opacity-80">Static Gen</span>
                            </button>
                            <button 
                                onClick={() => {
                                    triggerHaptic();
                                    onGenerateLiveWallpaper();
                                }}
                                disabled={status.isGeneratingWallpaper || status.isGeneratingLiveWallpaper}
                                className="p-3 bg-gradient-to-br from-purple-900/20 to-pink-900/20 hover:from-purple-900/30 hover:to-pink-900/30 rounded-xl flex flex-col items-center justify-center gap-2 border border-purple-500/20 transition-all group disabled:opacity-50"
                            >
                                {status.isGeneratingLiveWallpaper ? <Loader2 className="animate-spin text-pink-400" size={20}/> : <Video className="text-pink-400 group-hover:scale-110 transition-transform" size={20} />}
                                <span className="text-[10px] font-medium text-pink-500">Veo Live</span>
                            </button>
                        </div>
                        
                        {/* Nano Banana Image Editing */}
                        <div className="space-y-2">
                             <label className={`text-[10px] uppercase tracking-widest font-bold ml-1 ${themeClasses.subText}`}>Edit Image (Gemini 2.5 Flash)</label>
                             <div className="relative">
                                <input 
                                    type="text"
                                    value={editPrompt}
                                    onChange={(e) => setEditPrompt(e.target.value)}
                                    placeholder="Add retro filter, remove person..."
                                    className={`w-full py-2.5 px-4 pr-12 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors ${themeClasses.inputBg}`}
                                />
                                <button
                                    onClick={() => {
                                        triggerHaptic();
                                        onEditWallpaper(editPrompt);
                                    }}
                                    disabled={status.isEditingImage || !editPrompt.trim() || !theme.wallpaperImage}
                                    className="absolute right-2 top-1.5 p-1.5 text-purple-400 hover:text-purple-300 disabled:opacity-0"
                                >
                                    {status.isEditingImage ? <Loader2 className="animate-spin" size={16} /> : <Edit3 size={16} />}
                                </button>
                             </div>
                        </div>

                        {/* Image to Video Animation (Veo) */}
                        <button
                            onClick={() => {
                                triggerHaptic();
                                onAnimateImage();
                            }}
                            disabled={status.isAnimatingImage || !theme.wallpaperImage}
                            className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 border transition-all group disabled:opacity-50 ${themeClasses.buttonGhost} bg-gradient-to-r from-blue-500/5 to-purple-500/5 hover:from-blue-500/10 hover:to-purple-500/10`}
                        >
                            {status.isAnimatingImage ? <Loader2 className="animate-spin text-purple-400" size={18} /> : <Film size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />}
                            <span className="text-xs font-bold tracking-wide">Animate Image with Veo</span>
                        </button>

                         {/* Wallpaper Actions (Download) */}
                         {theme.wallpaperImage && theme.activeWallpaperMode === 'image' && (
                             <button
                                onClick={() => {
                                    triggerHaptic();
                                    const link = document.createElement('a');
                                    link.href = theme.wallpaperImage!;
                                    link.download = `wallpaper_${theme.id}.png`;
                                    link.click();
                                }}
                                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 border transition-all group ${themeClasses.buttonGhost}`}
                            >
                                <Download size={16} />
                                <span className="text-xs font-medium">Save Wallpaper (PNG)</span>
                            </button>
                        )}

                        {/* New Preview Controls for Live Wallpaper */}
                        {theme.liveWallpaperUrl && (
                             <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        triggerHaptic();
                                        onUpdateTheme({ activeWallpaperMode: 'video' });
                                    }}
                                    className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${theme.activeWallpaperMode === 'video' ? 'bg-pink-600 text-white' : themeClasses.buttonGhost}`}
                                >
                                    <MonitorPlay size={14} />
                                    Show Video
                                </button>
                                {theme.activeWallpaperMode === 'video' && (
                                    <button
                                        onClick={() => {
                                            triggerHaptic();
                                            // Toggle briefly to trigger re-render/replay or simply handled by PhonePreview ref
                                            onUpdateTheme({ activeWallpaperMode: 'image' });
                                            setTimeout(() => onUpdateTheme({ activeWallpaperMode: 'video' }), 50);
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 ${themeClasses.buttonGhost}`}
                                    >
                                        <PlayCircle size={14} />
                                        Replay
                                    </button>
                                )}
                             </div>
                        )}

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className={`w-full border-t ${uiMode === 'dark' ? 'border-white/5' : 'border-black/5'}`}></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className={`px-2 ${uiMode === 'dark' ? 'bg-[#151515] text-gray-500' : 'bg-gray-50 text-gray-400'}`}>Or</span>
                            </div>
                        </div>

                        <label className={`flex items-center justify-center gap-2 p-3 border border-dashed rounded-xl cursor-pointer transition-colors text-xs hover:text-opacity-80 ${uiMode === 'dark' ? 'border-gray-700 hover:bg-white/5 text-gray-400' : 'border-gray-300 hover:bg-black/5 text-gray-500'}`}>
                             <Upload size={14} />
                             <span>Upload Local Asset</span>
                             <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </label>

                        <p className={`text-[10px] font-mono truncate px-1 opacity-60 ${themeClasses.subText}`}>
                            SRC: {theme.wallpaperPrompt || "N/A"}
                        </p>
                     </div>
                 )}
            </div>
        </div>

      </div>

      {/* Footer / Export */}
      <div className={`p-6 pt-4 border-t backdrop-blur-xl ${themeClasses.footer}`}>
        <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center px-1 mb-1">
                <span className={`text-xs font-medium tracking-wider uppercase ${themeClasses.subText}`}>{theme.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded border ${uiMode === 'dark' ? 'text-gray-600 bg-white/5 border-white/5' : 'text-gray-400 bg-black/5 border-black/5'}`}>v2.0</span>
            </div>
            
            {/* Import Button */}
            <label className={`w-full py-2.5 text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${themeClasses.secondaryBtn}`}>
                <FileUp size={14} />
                IMPORT THEME FILE (JSON)
                <input type="file" accept=".json" className="hidden" onChange={handleJsonUpload} />
            </label>

            {/* Export Buttons */}
            <div className="flex gap-3">
                <button 
                    onClick={handleExportJson}
                    className={`flex-1 py-3 text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 ${themeClasses.secondaryBtn}`}
                >
                    <FileJson size={16} />
                    SAVE JSON
                </button>
                <button 
                    onClick={handleExportImage}
                    disabled={isExportingImage}
                    className={`flex-1 py-3 text-xs font-bold tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 ${themeClasses.exportBtn}`}
                >
                    {isExportingImage ? <Loader2 className="animate-spin" size={16} /> : <ImageIconSmall size={16} />}
                    EXPORT PREVIEW (PNG)
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
