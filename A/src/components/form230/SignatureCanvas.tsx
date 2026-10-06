"use client";

import React, { useRef, useState, useEffect } from "react";
import { Eraser, Check } from "lucide-react";

type SignatureCanvasProps = {
  readonly onSave: (dataUrl: string) => void;
  readonly onClear: () => void;
};

export function SignatureCanvas({ onSave, onClear }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set high-DPI scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.strokeStyle = "#071330"; // Deep navy ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL("image/png"));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onClear();
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-amber-900/30 rounded-2xl bg-white/95 overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 sm:h-44 cursor-crosshair block"
        />

        {!hasSignature && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-600 text-xs font-serif">
            <span>✍️ Semnează aici cu degetul sau mouse-ul</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Semnătura va fi aplicată pe formularul oficial</span>
          </div>
        )}

        <div className="absolute bottom-2 left-3 pointer-events-none text-[10px] font-mono text-slate-600 border-t border-slate-300 pt-0.5 w-32">
          Semnătură olografă
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 transition-colors font-medium text-xs"
        >
          <Eraser className="w-3.5 h-3.5" />
          Șterge și resemnează
        </button>

        {hasSignature && (
          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-xs">
            <Check className="w-3.5 h-3.5" />
            Semnătură înregistrată
          </span>
        )}
      </div>
    </div>
  );
}
