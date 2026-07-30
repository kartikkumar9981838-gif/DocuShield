import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Trash2, Check, Download } from 'lucide-react';
import { ESignItem } from '../../types';

interface ESignToolProps {
  currentPage: number;
  onAddSignature: (sig: Omit<ESignItem, 'id'>) => void;
  onApplyAllSignatures: () => void;
  hasSignatures: boolean;
  isProcessing: boolean;
}

export const ESignTool: React.FC<ESignToolProps> = ({
  currentPage,
  onAddSignature,
  onApplyAllSignatures,
  hasSignatures,
  isProcessing,
}) => {
  const [tab, setTab] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('John Doe');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Canvas for Drawing
  useEffect(() => {
    if (tab !== 'draw' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#12233F';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [tab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handlePlaceSignature = () => {
    let dataUrl = '';
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      dataUrl = canvas.toDataURL('image/png');
    } else {
      // Create offscreen canvas for typed signature
      const offscreen = document.createElement('canvas');
      offscreen.width = 300;
      offscreen.height = 100;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.font = '36px "Caveat", cursive, sans-serif';
        ctx.fillStyle = '#12233F';
        ctx.fillText(typedName, 20, 60);
        dataUrl = offscreen.toDataURL('image/png');
      }
    }

    onAddSignature({
      pageIndex: currentPage - 1,
      x: 100,
      y: 100,
      width: 160,
      height: 60,
      dataUrl,
    });
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setTab('draw')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              tab === 'draw' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Draw Signature
          </button>
          <button
            onClick={() => setTab('type')}
            className={`px-3 py-1 rounded-md text-xs font-semibold ${
              tab === 'type' ? 'bg-[#00C2CB] text-white' : 'text-slate-300'
            }`}
          >
            Type Signature
          </button>
        </div>

        {tab === 'draw' ? (
          <div className="flex items-center gap-2">
            <div className="bg-white rounded border border-slate-700 overflow-hidden">
              <canvas
                ref={canvasRef}
                width={180}
                height={40}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="cursor-crosshair block"
              />
            </div>
            <button onClick={clearCanvas} className="text-slate-400 hover:text-white p-1" title="Clear">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={typedName}
            onChange={(e) => setTypedName(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-xs px-3 py-1.5 rounded-lg w-40 font-serif"
            placeholder="Type name..."
          />
        )}

        <button
          onClick={handlePlaceSignature}
          className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
        >
          <PenTool className="w-3.5 h-3.5 text-[#00C2CB]" />
          <span>Place Signature</span>
        </button>
      </div>

      <button
        onClick={onApplyAllSignatures}
        disabled={!hasSignatures || isProcessing}
        className="bg-[#00C2CB] hover:bg-[#00aeb6] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
      >
        <Download className="w-4 h-4" />
        <span>{isProcessing ? 'Flattening...' : 'Flatten & Save PDF'}</span>
      </button>
    </div>
  );
};
