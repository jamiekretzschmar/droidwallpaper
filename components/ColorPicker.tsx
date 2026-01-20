import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (newColor: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
  return (
    <div className="group flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/5 backdrop-blur-sm">
      <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">{color}</span>
        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shadow-inner ring-1 ring-transparent group-hover:ring-white/20 transition-all">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-none opacity-0"
          />
          <div 
            className="w-full h-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
};