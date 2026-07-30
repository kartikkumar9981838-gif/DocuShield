import React from 'react';
import { WatermarkConfig } from '../../types';
import { Stamp, Eye, Download } from 'lucide-react';

interface WatermarkToolProps {
  config: WatermarkConfig;
  showPreview: boolean;
  onUpdateConfig: (updates: Partial<WatermarkConfig>) => void;
  onTogglePreview: () => void;
  onApplyWatermark: () => void;
  isProcessing: boolean;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({
  config,
  showPreview,
  onUpdateConfig,
  onTogglePreview,
  onApplyWatermark,
  isProcessing,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3 flex-wrap">
        {/* Type Toggle */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => onUpdateConfig({ type: 'text' })}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              config.type === 'text' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Text
          </button>
          <button
            onClick={() => onUpdateConfig({ type: 'image' })}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              config.type === 'image' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Logo Image
          </button>
        </div>

        {/* Text Input or Image Upload */}
        {config.type === 'text' ? (
          <input
            type="text"
            value={config.text}
            onChange={(e) => onUpdateConfig({ text: e.target.value })}
            placeholder="Watermark Text (e.g. CONFIDENTIAL)"
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg w-48 focus:outline-none focus:border-[#00C2CB]"
          />
        ) : (
          <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700">
            <span>{config.imageUrl ? 'Change Logo' : 'Upload Logo (PNG/JPG)'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const url = URL.createObjectURL(e.target.files[0]);
                  onUpdateConfig({ imageUrl: url });
                }
              }}
              className="hidden"
            />
          </label>
        )}

        {/* Controls: Size, Opacity, Rotation, Position */}
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span>Size:</span>
          <input
            type="range"
            min="12"
            max="120"
            value={config.size}
            onChange={(e) => onUpdateConfig({ size: parseInt(e.target.value, 10) })}
            className="w-20 accent-[#00C2CB]"
          />

          <span>Opacity:</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.opacity}
            onChange={(e) => onUpdateConfig({ opacity: parseFloat(e.target.value) })}
            className="w-16 accent-[#00C2CB]"
          />

          <span>Angle:</span>
          <input
            type="range"
            min="-90"
            max="90"
            value={config.rotation}
            onChange={(e) => onUpdateConfig({ rotation: parseInt(e.target.value, 10) })}
            className="w-16 accent-[#00C2CB]"
          />

          <select
            value={config.position}
            onChange={(e) => onUpdateConfig({ position: e.target.value as any })}
            className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1"
          >
            <option value="center">Center</option>
            <option value="top-left">Top-Left</option>
            <option value="bottom-right">Bottom-Right</option>
            <option value="tile">Tile Grid</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePreview}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
            showPreview ? 'bg-[#00C2CB] text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
        </button>

        <button
          onClick={onApplyWatermark}
          disabled={isProcessing}
          className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>{isProcessing ? 'Applying...' : 'Apply Watermark'}</span>
        </button>
      </div>
    </div>
  );
};
