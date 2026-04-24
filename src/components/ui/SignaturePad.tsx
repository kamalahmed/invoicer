import { useEffect, useRef, useState } from 'react';

interface SignaturePadProps {
  value?: string; // data URL
  onChange: (v: string | undefined) => void;
  width?: number;
  height?: number;
}

/**
 * Lightweight signature pad. Supports mouse + touch drawing, image upload,
 * and output as a PNG data URL. Trimmed to remove transparent padding so the
 * stroke fits neatly above the signature line in the invoice.
 */
export function SignaturePad({ value, onChange, width = 300, height = 110 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  // Tracks the value we just emitted so the sync effect can ignore it and
  // leave the user's live strokes intact (instead of clearing and redrawing
  // the trimmed image smaller and centred, which used to cause a jump).
  const emittedRef = useRef<string | undefined>(value);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Sync the canvas with `value` only for external changes (load / clear /
  // uploaded image). Self-emitted values are skipped to avoid the post-stroke
  // jump described above.
  useEffect(() => {
    if (value === emittedRef.current) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    emittedRef.current = value;
    if (!value) {
      setIsEmpty(true);
      return;
    }
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(c.width / img.width, c.height / img.height);
      const w = img.width * ratio;
      const h = img.height * ratio;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
      setIsEmpty(false);
    };
    img.src = value;
  }, [value]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvasRef.current!.width,
      y: ((e.clientY - rect.top) / rect.height) * canvasRef.current!.height,
    };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = pos(e);
    canvasRef.current?.setPointerCapture(e.pointerId);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    const p = pos(e);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const last = lastRef.current ?? p;
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
    setIsEmpty(false);
  };
  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    lastRef.current = null;
    const data = trimCanvas(canvasRef.current!);
    // Mark the emitted value so the useEffect above won't redraw the trimmed
    // image over our still-visible strokes.
    emittedRef.current = data;
    onChange(data);
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext('2d')!.clearRect(0, 0, c.width, c.height);
    setIsEmpty(true);
    emittedRef.current = undefined;
    onChange(undefined);
  };

  const uploadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Leave emittedRef as-is so the effect picks this up and paints it.
      onChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <div className="relative rounded-md border border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="block w-full touch-none rounded-md"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
        />
        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            Draw signature here
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button type="button" className="btn-ghost text-xs" onClick={clear}>
          Clear
        </button>
        <label className="btn-ghost cursor-pointer text-xs">
          Upload image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) uploadImage(f);
              e.currentTarget.value = '';
            }}
          />
        </label>
        {!isEmpty && <span className="text-ink-muted">Saved</span>}
      </div>
    </div>
  );
}

/** Trim transparent edges so the signature sits snug on the invoice line. */
function trimCanvas(source: HTMLCanvasElement): string | undefined {
  const ctx = source.getContext('2d');
  if (!ctx) return undefined;
  const { width, height } = source;
  const data = ctx.getImageData(0, 0, width, height).data;
  let minX = width,
    minY = height,
    maxX = -1,
    maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return undefined;
  const pad = 4;
  const tx = Math.max(0, minX - pad);
  const ty = Math.max(0, minY - pad);
  const tw = Math.min(width - tx, maxX - minX + pad * 2);
  const th = Math.min(height - ty, maxY - minY + pad * 2);
  const out = document.createElement('canvas');
  out.width = tw;
  out.height = th;
  out.getContext('2d')!.drawImage(source, tx, ty, tw, th, 0, 0, tw, th);
  return out.toDataURL('image/png');
}
