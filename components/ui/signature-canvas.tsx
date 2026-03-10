'use client';
import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface SignatureCanvasProps {
  value?: string;
  onChange?: (signatureData: string) => void;
  label?: string;
  showClearButton?: boolean;
  height?: number;
  className?: string;
}

export interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

export const SignatureCanvas = forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  (
    {
      value,
      onChange,
      label = 'Draw Your Signature',
      showClearButton = true,
      height = 200,
      className = '',
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);
    const { resolvedTheme } = useTheme();

    // Get stroke color based on theme
    const getStrokeColor = () => {
      return resolvedTheme === 'dark' ? '#fff' : '#000';
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clear: clearSignature,
      isEmpty: () => {
        const canvas = canvasRef.current;
        if (!canvas) return true;
        const ctx = canvas.getContext('2d');
        if (!ctx) return true;
        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        return !pixelData.data.some((channel) => channel !== 0);
      },
      toDataURL: () => {
        const canvas = canvasRef.current;
        return canvas ? canvas.toDataURL() : '';
      },
    }));

    // Initialize canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size to match display size only on first render
      if (canvas.width === 0) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }

      // Set drawing style with current theme color
      ctx.strokeStyle = getStrokeColor();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Handle resize
      const handleResize = () => {
        const rect = canvas.getBoundingClientRect();
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.putImageData(imageData, 0, 0);
        ctx.strokeStyle = getStrokeColor();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle theme changes - invert existing signature colors
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !resolvedTheme) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Get current canvas data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Invert colors of existing signature
      for (let i = 0; i < data.length; i += 4) {
        // Only invert if pixel is not transparent
        if (data[i + 3] > 0) {
          data[i] = 255 - data[i]; // Red
          data[i + 1] = 255 - data[i + 1]; // Green
          data[i + 2] = 255 - data[i + 2]; // Blue
          // Alpha stays the same
        }
      }

      // Put the inverted image back
      ctx.putImageData(imageData, 0, 0);

      // Update stroke style for future drawing
      ctx.strokeStyle = getStrokeColor();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }, [resolvedTheme]);

    // Drawing functions
    const getCoordinates = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const startDrawing = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      isDrawingRef.current = true;

      // Set stroke style based on current theme
      ctx.strokeStyle = getStrokeColor();
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const { x, y } = getCoordinates(e);

      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;

      e.preventDefault(); // Prevent scrolling on touch devices

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);

      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawingRef.current) return;

      isDrawingRef.current = false;

      const canvas = canvasRef.current;
      if (canvas && onChange) {
        onChange(canvas.toDataURL());
      }
    };

    const clearSignature = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onChange) {
        onChange('');
      }
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label>{label}</Label>}
        <div className="border-2 border-border rounded-md overflow-hidden bg-white dark:bg-gray-900">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair touch-none block"
            style={{ height: `${height}px`, display: 'block' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
        {showClearButton && (
          <Button type="button" variant="outline" onClick={clearSignature} className="w-full">
            Clear Signature
          </Button>
        )}
      </div>
    );
  }
);

SignatureCanvas.displayName = 'SignatureCanvas';
