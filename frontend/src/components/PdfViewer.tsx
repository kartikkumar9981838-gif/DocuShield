import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { WatermarkConfig, RedactionArea, TextEditItem, ESignItem, ScanCorner } from '../types';
import { Move, Trash2, Plus, Minus, Check } from 'lucide-react';

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PdfViewerProps {
  arrayBuffer: ArrayBuffer | null;
  currentPage: number;
  zoom: number;
  activeTool: string;
  watermarkConfig: WatermarkConfig;
  showWatermarkPreview: boolean;
  redactions: RedactionArea[];
  textEdits: TextEditItem[];
  signatures: ESignItem[];
  scanCorners: ScanCorner[];
  scanImageSrc: string | null;
  onAddRedaction: (area: Omit<RedactionArea, 'id'>) => void;
  onRemoveRedaction: (id: string) => void;
  onAddTextEdit: (item: Omit<TextEditItem, 'id'>) => void;
  onUpdateTextEdit: (id: string, updates: Partial<TextEditItem>) => void;
  onRemoveTextEdit: (id: string) => void;
  onUpdateSignature: (id: string, updates: Partial<ESignItem>) => void;
  onRemoveSignature: (id: string) => void;
  onUpdateScanCorner: (index: number, pt: ScanCorner) => void;
  onNumPagesLoaded: (numPages: number) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  arrayBuffer,
  currentPage,
  zoom,
  activeTool,
  watermarkConfig,
  showWatermarkPreview,
  redactions,
  textEdits,
  signatures,
  scanCorners,
  scanImageSrc,
  onAddRedaction,
  onRemoveRedaction,
  onAddTextEdit,
  onUpdateTextEdit,
  onRemoveTextEdit,
  onUpdateSignature,
  onRemoveSignature,
  onUpdateScanCorner,
  onNumPagesLoaded,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 595, height: 842 });
  const [selectedTextEditId, setSelectedTextEditId] = useState<string | null>(null);
  const [selectedSigId, setSelectedSigId] = useState<string | null>(null);

  // Drawing state for redaction or text edit creation
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrawRect, setCurrentDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Load PDF Document
  useEffect(() => {
    if (!arrayBuffer) {
      setPdfDoc(null);
      return;
    }

    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) });
    loadingTask.promise
      .then((doc) => {
        setPdfDoc(doc);
        onNumPagesLoaded(doc.numPages);
      })
      .catch((err) => {
        console.error('Error loading PDF document:', err);
      });
  }, [arrayBuffer]);

  // Render Page to Canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    pdfDoc.getPage(currentPage).then((page: any) => {
      const viewport = page.getViewport({ scale: zoom });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageDimensions({ width: viewport.width, height: viewport.height });

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      page.render(renderContext);
    });
  }, [pdfDoc, currentPage, zoom]);

  // Handle Mouse / Touch down for drawing redactions or text boxes
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'redact' || activeTool === 'edit-text') {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setCurrentDrawRect({ x, y, w: 0, h: 0 });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const w = Math.abs(currentX - drawStart.x);
    const h = Math.abs(currentY - drawStart.y);

    setCurrentDrawRect({ x, y, w, h });
  };

  const handlePointerUp = () => {
    if (!isDrawing || !currentDrawRect) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDrawRect(null);
      return;
    }

    if (currentDrawRect.w > 10 && currentDrawRect.h > 10) {
      // Standardize coordinates relative to unscaled PDF point dimensions
      const pdfX = currentDrawRect.x / zoom;
      const pdfY = currentDrawRect.y / zoom;
      const pdfW = currentDrawRect.w / zoom;
      const pdfH = currentDrawRect.h / zoom;

      if (activeTool === 'redact') {
        onAddRedaction({
          pageIndex: currentPage - 1,
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
        });
      } else if (activeTool === 'edit-text') {
        onAddTextEdit({
          pageIndex: currentPage - 1,
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
          originalText: 'Sample Text',
          newText: 'Edited Text',
          fontSize: Math.max(12, Math.round(pdfH * 0.7)),
          fontColor: '#000000',
        });
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDrawRect(null);
  };

  const currentPageRedactions = redactions.filter((r) => r.pageIndex === currentPage - 1);
  const currentPageEdits = textEdits.filter((t) => t.pageIndex === currentPage - 1);
  const currentPageSigs = signatures.filter((s) => s.pageIndex === currentPage - 1);

  return (
    <div className="relative inline-block shadow-md border border-[#E5E7EB] bg-white rounded-lg overflow-hidden select-none">
      {/* Canvas for PDF Page Render */}
      {activeTool === 'scanner' && scanImageSrc ? (
        <div className="relative">
          <img src={scanImageSrc} alt="Document Scan" className="max-w-full h-auto block rounded-lg" />
          {/* 4 Corner Handles for Scanner */}
          {scanCorners.map((pt, idx) => (
            <div
              key={idx}
              style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
              className="absolute w-6 h-6 -ml-3 -mt-3 bg-[#00C2CB] border-2 border-white rounded-full cursor-move shadow-md flex items-center justify-center text-white text-[10px] font-bold z-30"
            >
              {idx + 1}
            </div>
          ))}
        </div>
      ) : (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative cursor-crosshair"
        >
          <canvas ref={canvasRef} className="block" />

          {/* Drawing Box Active Preview */}
          {isDrawing && currentDrawRect && (
            <div
              style={{
                left: `${currentDrawRect.x}px`,
                top: `${currentDrawRect.y}px`,
                width: `${currentDrawRect.w}px`,
                height: `${currentDrawRect.h}px`,
              }}
              className={`absolute border-2 ${
                activeTool === 'redact'
                  ? 'bg-black/60 border-red-500'
                  : 'bg-[#00C2CB]/20 border-[#00C2CB] stroke-dash'
              } pointer-events-none z-20`}
            />
          )}

          {/* Redaction Areas Overlay */}
          {currentPageRedactions.map((red) => (
            <div
              key={red.id}
              style={{
                left: `${red.x * zoom}px`,
                top: `${red.y * zoom}px`,
                width: `${red.width * zoom}px`,
                height: `${red.height * zoom}px`,
              }}
              className="absolute bg-black border border-red-500/80 group flex items-center justify-center z-20"
            >
              <span className="text-[10px] font-bold text-red-400 opacity-80 group-hover:opacity-100">REDACT</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveRedaction(red.id);
                }}
                className="absolute -top-3 -right-3 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {/* Text Editing Items Overlay with UX Drag Handles & Floating Context Toolbar */}
          {currentPageEdits.map((edit) => {
            const isSelected = selectedTextEditId === edit.id;

            return (
              <div
                key={edit.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextEditId(edit.id);
                  setSelectedSigId(null);
                }}
                style={{
                  left: `${edit.x * zoom}px`,
                  top: `${edit.y * zoom}px`,
                  width: `${edit.width * zoom}px`,
                  height: `${edit.height * zoom}px`,
                }}
                className={`absolute bg-white border ${
                  isSelected ? 'border-[#00C2CB] shadow-md' : 'border-dashed border-gray-400'
                } p-1 z-20 flex items-center`}
              >
                <input
                  type="text"
                  value={edit.newText}
                  onChange={(e) => onUpdateTextEdit(edit.id, { newText: e.target.value })}
                  style={{ fontSize: `${edit.fontSize * zoom}px`, color: edit.fontColor }}
                  className="w-full h-full bg-transparent border-none outline-none font-sans font-medium px-1"
                />

                {/* 4 Corner Drag Handles & Floating Context Toolbar when selected */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />

                    {/* Single floating contextual toolbar */}
                    <div className="absolute -top-12 left-0 bg-[#12233F] text-white px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 text-xs z-40 whitespace-nowrap">
                      <span className="font-semibold text-slate-300">Text:</span>
                      <button
                        onClick={() =>
                          onUpdateTextEdit(edit.id, { fontSize: Math.max(8, edit.fontSize - 2) })
                        }
                        className="hover:text-[#00C2CB] p-1"
                        title="Decrease font size"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold px-1">{edit.fontSize}px</span>
                      <button
                        onClick={() => onUpdateTextEdit(edit.id, { fontSize: edit.fontSize + 2 })}
                        className="hover:text-[#00C2CB] p-1"
                        title="Increase font size"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-4 bg-slate-600 my-auto mx-1" />
                      <button
                        onClick={() => onRemoveTextEdit(edit.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete element"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSelectedTextEditId(null)}
                        className="bg-[#00C2CB] text-white px-2 py-0.5 rounded text-[10px] font-bold"
                      >
                        Done
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* E-Sign Signatures Overlay */}
          {currentPageSigs.map((sig) => {
            const isSelected = selectedSigId === sig.id;

            return (
              <div
                key={sig.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSigId(sig.id);
                  setSelectedTextEditId(null);
                }}
                style={{
                  left: `${sig.x * zoom}px`,
                  top: `${sig.y * zoom}px`,
                  width: `${sig.width * zoom}px`,
                  height: `${sig.height * zoom}px`,
                }}
                className={`absolute border ${
                  isSelected ? 'border-[#00C2CB] shadow-md ring-2 ring-[#00C2CB]/30' : 'border-transparent'
                } group cursor-move z-20`}
              >
                <img src={sig.dataUrl} alt="E-Signature" className="w-full h-full object-contain pointer-events-none" />

                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-[#00C2CB] border border-white rounded-xs" />

                    <div className="absolute -top-10 left-0 bg-[#12233F] text-white px-2.5 py-1 rounded shadow-lg flex items-center gap-2 text-xs z-40">
                      <button
                        onClick={() => onRemoveSignature(sig.id)}
                        className="text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* LIVE Watermark Preview Overlay - MUST NEVER apply automatically, only when preview toggled! */}
          {activeTool === 'watermark' && showWatermarkPreview && (
            <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden flex items-center justify-center">
              {watermarkConfig.type === 'text' && watermarkConfig.text.trim() && (
                <div
                  style={{
                    fontSize: `${watermarkConfig.size * zoom}px`,
                    opacity: watermarkConfig.opacity,
                    transform: `rotate(${watermarkConfig.rotation}deg)`,
                  }}
                  className="font-bold text-gray-500 tracking-wider text-center select-none"
                >
                  {watermarkConfig.text}
                </div>
              )}

              {watermarkConfig.type === 'image' && watermarkConfig.imageUrl && (
                <img
                  src={watermarkConfig.imageUrl}
                  alt="Watermark Preview"
                  style={{
                    width: `${watermarkConfig.size * 2 * zoom}px`,
                    opacity: watermarkConfig.opacity,
                    transform: `rotate(${watermarkConfig.rotation}deg)`,
                  }}
                  className="object-contain select-none"
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
