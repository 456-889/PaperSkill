import React, { useEffect, useRef } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawRecord, drawTurntable, drawArmOnRecord, drawSpeaker } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 520;
const H = 220;

export const VinylHero: React.FC<WidgetProps> = ({ moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }
    const isOld = moduleId === 'old';

    const render = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      drawRoom(ctx, W, H);
      const angle = now / 900;
      drawTurntable(ctx, 200, 118, 70);
      drawRecord(ctx, 200, 118, 70, angle, { labelColor: isOld ? '#b05a3a' : PAL.label });

      if (isOld) {
        const wob = Math.sin(now / 130) * 8;
        drawArmOnRecord(ctx, 200, 118, 70, 208 + wob, PAL.red, 0);
        ctx.save();
        ctx.strokeStyle = 'rgba(196,63,82,0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        for (let i = 0; i < 2; i += 1) {
          ctx.beginPath();
          ctx.arc(200, 118, 62 + i * 9, 0.5 + i * 0.3, 1.5 + i * 0.3);
          ctx.stroke();
        }
        ctx.restore();
        drawSpeaker(ctx, 420, 70, 0.85, 0.18 + Math.abs(Math.sin(now / 90)) * 0.25, PAL.red);
        ctx.fillStyle = 'rgba(196,63,82,0.85)';
        ctx.beginPath();
        ctx.arc(114, 60, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        drawArmOnRecord(ctx, 200, 118, 70, 212, PAL.blue, 0);
        ctx.save();
        ctx.strokeStyle = PAL.blue;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(74, 52, 22, 0, Math.PI * 2);
        ctx.stroke();
        const na = (-135 * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(74, 52);
        ctx.lineTo(74 + Math.cos(na) * 16, 52 + Math.sin(na) * 16);
        ctx.stroke();
        ctx.fillStyle = PAL.blue;
        ctx.beginPath();
        ctx.arc(74, 52, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        drawSpeaker(ctx, 420, 70, 0.85, 0.42 + Math.abs(Math.sin(now / 260)) * 0.22, PAL.green);
        ctx.fillStyle = PAL.green;
        ctx.beginPath();
        ctx.arc(114, 60, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    };

    const tick = () => {
      render(performance.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => {
      stop();
      disconnect();
    };
  }, [moduleId]);

  return <canvas id={`cv-hero-${moduleId}`} ref={canvasRef} width={W} height={H} />;
};

export default VinylHero;
