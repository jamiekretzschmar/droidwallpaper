import React, { useRef, useEffect } from 'react';
import { Theme } from '../types';
import { 
  Signal, 
  Wifi, 
  Battery, 
  Phone, 
  MessageSquare, 
  Chrome, 
  Camera, 
  Music, 
  Mail, 
  Calendar, 
  MapPin, 
  Settings,
  Search,
  Mic,
  Clock,
  Calculator,
  Image as Gallery,
  Play,
  Youtube,
  Facebook,
  Twitter,
  Instagram
} from 'lucide-react';

interface PhonePreviewProps {
  theme: Theme;
  isGenerating?: boolean;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({ theme, isGenerating }) => {
  const { colors, wallpaperImage, liveWallpaperUrl, activeWallpaperMode, iconStyle } = theme;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play video when mode switches to video
  useEffect(() => {
    if (activeWallpaperMode === 'video' && liveWallpaperUrl && videoRef.current) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented", e));
    }
  }, [activeWallpaperMode, liveWallpaperUrl]);

  // Dynamic icon styles based on the theme's iconStyle setting
  const getIconContainerStyle = () => {
    switch (iconStyle) {
      case 'filled':
        return { backgroundColor: colors.primary, color: colors.background };
      case 'outline':
        return { border: `1.5px solid ${colors.primary}`, color: colors.primary, backgroundColor: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)' };
      case 'neumorphic':
        return { 
          backgroundColor: colors.surface, 
          color: colors.primary,
          boxShadow: `4px 4px 10px rgba(0,0,0,0.3), -2px -2px 5px rgba(255,255,255,0.05)`
        };
      case 'minimal':
      default:
        return { backgroundColor: `${colors.surface}E6`, color: colors.primary, backdropFilter: 'blur(8px)' };
    }
  };

  // Base icon container class
  const iconContainerClass = `w-[52px] h-[52px] rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ease-out group-hover:scale-105 ${
    iconStyle === 'neumorphic' ? 'shadow-inner' : 'shadow-lg'
  }`;
  
  const iconStyleObj = getIconContainerStyle();

  const AppIcon = ({ Icon, label, delay = 0 }: { Icon: any, label: string, delay?: number }) => (
    <div className="flex flex-col items-center gap-1.5 group cursor-pointer relative">
      {/* Icon Background / Container */}
      <div 
        className={`${iconContainerClass} ${isGenerating ? 'animate-pulse' : ''}`} 
        style={{ 
            ...iconStyleObj,
            animationDelay: `${delay}ms` 
        }}
      >
        <Icon size={22} strokeWidth={2} className={`transition-transform duration-300 ${isGenerating ? 'animate-spin-slow' : 'group-hover:rotate-12'}`} />
      </div>
      
      {/* Label */}
      <span 
        className="text-[10px] font-medium tracking-wide drop-shadow-lg truncate w-14 text-center opacity-90 group-hover:opacity-100 transition-opacity" 
        style={{ color: colors.text }}
      >
        {label}
      </span>
    </div>
  );

  return (
    <div id="phone-preview-target" className="relative group perspective-1000 p-8">
      {/* Ambient Glow Behind Phone - Included in capture */}
      <div 
        className="absolute inset-4 blur-3xl opacity-40 transition-colors duration-1000 rounded-[3rem]"
        style={{ backgroundColor: colors.primary }}
      ></div>

      {/* Phone Bezel */}
      <div className="relative mx-auto w-[340px] h-[680px] bg-[#0a0a0a] rounded-[3.5rem] border-[6px] border-[#1a1a1a] shadow-2xl overflow-hidden ring-1 ring-white/10 z-10 transition-transform duration-500">
        
        {/* Inner Bezel / Screen Border */}
        <div className="absolute inset-0 rounded-[3.1rem] border-[8px] border-black pointer-events-none z-50"></div>
        
        {/* Screen Content */}
        <div 
          className="w-full h-full relative flex flex-col bg-gray-900 overflow-hidden"
          style={{ 
            backgroundColor: colors.background,
            transition: 'background-color 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Wallpaper Layer */}
          <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
             {/* Static Wallpaper */}
             <div 
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${activeWallpaperMode === 'image' && wallpaperImage ? 'opacity-100' : 'opacity-0'}`}
                style={{ backgroundImage: wallpaperImage ? `url(${wallpaperImage})` : 'none' }}
             />
             
             {/* Live Wallpaper */}
             {liveWallpaperUrl && (
                <div className={`absolute inset-0 transition-opacity duration-700 ${activeWallpaperMode === 'video' ? 'opacity-100' : 'opacity-0'}`}>
                    <video 
                      ref={videoRef}
                      src={liveWallpaperUrl}
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover"
                    />
                </div>
             )}
          </div>

          {/* Scanning Effect (Loading State) */}
          {isGenerating && (
            <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <div className="w-full h-1 bg-white/20 absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                <div className="text-xs font-mono text-white/70 bg-black/50 px-3 py-1 rounded-full border border-white/10">SYNTHESIZING SYSTEM UI...</div>
            </div>
          )}
          <style>{`
            @keyframes scan { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
            @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .animate-spin-slow { animation: spin-slow 3s linear infinite; }
          `}</style>

          {/* Screen Glare/Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-30 pointer-events-none z-30"></div>

          {/* UI Overlay */}
          <div className="relative w-full h-full flex flex-col z-20">
            
            {/* Status Bar */}
            <div className="flex justify-between items-center px-7 pt-5 pb-2 text-[11px] font-semibold tracking-wide" style={{ color: colors.text }}>
              <span>09:41</span>
              <div className="flex gap-1.5 items-center opacity-90">
                <Signal size={12} strokeWidth={3} />
                <Wifi size={12} strokeWidth={3} />
                <Battery size={12} strokeWidth={3} />
              </div>
            </div>

            {/* Dynamic Island / Notch Placeholder */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-50 flex items-center justify-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] ml-16 shadow-inner"></div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col p-6 pt-10 overflow-y-auto scrollbar-hide">
              <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
              
              {/* Modern Clock Widget */}
              <div className="mb-8 mt-4 hover:scale-105 transition-transform duration-300 cursor-default">
                <div className="flex flex-col items-center">
                    <div className="text-6xl font-light tracking-tighter drop-shadow-lg" style={{ color: colors.text }}>
                        09:41
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs uppercase tracking-widest opacity-80 font-medium" style={{ color: colors.text }}>Wed 25 Oct</span>
                        <div className="w-1 h-1 rounded-full bg-white/50"></div>
                        <div className="text-xs font-medium" style={{ color: colors.accent }}>72°F</div>
                    </div>
                </div>
              </div>

               {/* Glass Search Bar */}
               <div 
                 className="mb-8 p-3.5 rounded-[2rem] flex items-center gap-3 shadow-lg border border-white/5 backdrop-blur-xl transition-all duration-500 hover:bg-white/10"
                 style={{ backgroundColor: `${colors.surface}90`, color: colors.text }}
               >
                 <div style={{color: colors.primary}} className="opacity-90"><GoogleIcon /></div>
                 <div className="flex-1 opacity-50 text-xs font-medium tracking-wide">Search apps, web...</div>
                 <Mic size={16} className="opacity-50" />
                 <Camera size={16} className="opacity-50" />
               </div>

              {/* App Grid */}
              <div className="grid grid-cols-4 gap-y-7 gap-x-2 pb-8 px-1">
                 <AppIcon Icon={Mail} label="Gmail" delay={0} />
                 <AppIcon Icon={Calendar} label="Calendar" delay={50} />
                 <AppIcon Icon={Gallery} label="Photos" delay={100} />
                 <AppIcon Icon={Settings} label="Settings" delay={150} />
                 <AppIcon Icon={Clock} label="Clock" delay={200} />
                 <AppIcon Icon={MapPin} label="Maps" delay={250} />
                 <AppIcon Icon={Play} label="Play" delay={300} />
                 <AppIcon Icon={Youtube} label="YouTube" delay={350} />
                 <AppIcon Icon={Music} label="Music" delay={400} />
                 <AppIcon Icon={Calculator} label="Calc" delay={450} />
                 <AppIcon Icon={Instagram} label="Social" delay={500} />
                 <AppIcon Icon={Twitter} label="X" delay={550} />
              </div>
            </div>

            {/* Floating Glass Dock */}
            <div className="px-4 pb-6">
              <div 
                className="flex justify-around items-center p-4 rounded-[2.5rem] backdrop-blur-xl shadow-2xl border-t border-white/10 hover:bg-white/10 transition-colors duration-300"
                style={{ backgroundColor: `${colors.surface}40` }}
              >
                <AppIcon Icon={Phone} label="" />
                <AppIcon Icon={MessageSquare} label="" />
                <AppIcon Icon={Chrome} label="" />
                <AppIcon Icon={Camera} label="" />
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-1 bg-white/40 rounded-full z-50 backdrop-blur-md"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);