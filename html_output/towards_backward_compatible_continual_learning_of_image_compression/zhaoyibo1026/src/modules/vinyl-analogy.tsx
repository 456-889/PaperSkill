import React, { useEffect, useRef } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import {
  PAL,
  drawRoom,
  drawTurntable,
  drawRecord,
  drawArmOnRecord,
  drawTonearm,
  drawSpeaker,
  drawFader,
  drawGrooveWave,
  roundRect,
} from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 560;
const H = 140;

function drawCartridge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale = 1
): void {
  ctx.save();
  ctx.fillStyle = color;
  roundRect(ctx, x - 9 * scale, y - 6 * scale, 18 * scale, 12 * scale, 3 * scale);
  ctx.fill();
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(x - 3 * scale, y + 5 * scale, 6 * scale, 2 * scale);
  ctx.restore();
}

export const VinylAnalogy: React.FC<WidgetProps> = ({ chapterId }) => {
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
    const chapter = Number((chapterId || '').replace('chap-', ''));

    const render = (now: number) => {
      ctx.clearRect(0, 0, W, H);
      drawRoom(ctx, W, H);
      const t = (now % 3000) / 3000;

      if (chapter === 1) {
        drawTurntable(ctx, 150, 78, 44);
        drawRecord(ctx, 150, 78, 44, now / 900);
        const slip = t > 0.55 ? Math.sin((t - 0.55) * 70) * 10 : 0;
        drawArmOnRecord(ctx, 150, 78, 44, 215 + slip, t > 0.55 ? PAL.red : PAL.blue, 0);
        drawSpeaker(ctx, 430, 34, 0.62, t > 0.55 ? 0.2 : 0.45, t > 0.55 ? PAL.red : PAL.green);
      } else if (chapter === 2) {
        drawTurntable(ctx, 140, 74, 48);
        drawRecord(ctx, 140, 74, 48, now / 1100);
        const a = ((185 + t * 85) * Math.PI) / 180;
        const lx = 140 + Math.cos(a) * 31;
        const ly = 74 + Math.sin(a) * 31;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        ctx.beginPath();
        ctx.arc(lx, ly, 17, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PAL.blue;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(lx, ly, 17, 0, Math.PI * 2);
        ctx.clip();
        drawGrooveWave(ctx, lx - 16, ly - 9, 32, 18, t * 22, PAL.green);
        ctx.restore();
        drawTonearm(ctx, 100, 18, lx + 7, ly, PAL.wood, 0.9);
      } else if (chapter === 3) {
        drawTurntable(ctx, 120, 78, 36);
        drawRecord(ctx, 120, 78, 36, now / 1000);
        drawArmOnRecord(ctx, 120, 78, 36, 214, PAL.blue, 0);
        drawTurntable(ctx, 320, 78, 36);
        drawRecord(ctx, 320, 78, 36, now / 1000, { labelColor: '#b05a3a' });
        const jit = t > 0.4 ? Math.sin((t - 0.4) * 80) * 9 : 0;
        drawArmOnRecord(ctx, 320, 78, 36, 214 + jit, t > 0.4 ? PAL.red : PAL.blue, 0);
        drawTonearm(ctx, 460, 30, 460 + Math.sin(t * 20) * 2, 100, PAL.wood, 0.7);
      } else if (chapter === 4) {
        ctx.save();
        ctx.fillStyle = '#d9d2c3';
        roundRect(ctx, 30, 34, 210, 74, 10);
        ctx.fill();
        ctx.strokeStyle = PAL.wood;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        const alpha = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
        drawFader(ctx, 56, 72, 150, alpha, PAL.orange);
        drawRecord(ctx, 400, 52, 28, now / 900, { labelColor: PAL.orange });
        drawRecord(ctx, 470, 84, 28, now / 900, { labelColor: PAL.green });
        ctx.save();
        ctx.globalAlpha = 0.25 + alpha * 0.5;
        ctx.strokeStyle = PAL.orange;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(400, 52, 33, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = PAL.green;
        ctx.beginPath();
        ctx.arc(470, 84, 33, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (chapter === 5) {
        for (let i = 0; i < 3; i += 1) {
          drawCartridge(ctx, 52 + i * 30, 100, i === Math.floor(t * 3) % 3 ? PAL.orange : PAL.wood, 1);
        }
        drawTurntable(ctx, 380, 82, 38);
        drawRecord(ctx, 380, 82, 38, now / 1000);
        const drop = t < 0.4 ? 1 - t / 0.4 : 0;
        drawArmOnRecord(ctx, 380, 82, 38, 212, PAL.blue, drop);
        if (t > 0.35) drawCartridge(ctx, 380 + Math.cos((212 * Math.PI) / 180) * 30, 82 + Math.sin((212 * Math.PI) / 180) * 30, PAL.orange, 0.9);
        const wx = 330 + (t > 0.5 ? 18 : 6);
        ctx.fillStyle = PAL.orange;
        ctx.beginPath();
        ctx.arc(wx, 44, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (chapter === 6) {
        const idx = Math.floor((t * 4) % 4);
        const angles = [216, 201, 186, 171];
        drawTurntable(ctx, 150, 78, 44);
        drawRecord(ctx, 150, 78, 44, now / 1200, { activeBand: idx + 1 });
        drawArmOnRecord(ctx, 150, 78, 44, angles[idx], PAL.blue, 0);
        for (let i = 0; i < 4; i += 1) {
          ctx.fillStyle = i <= idx ? PAL.blue : PAL.line;
          ctx.beginPath();
          ctx.arc(300 + i * 20, 72, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        drawSpeaker(ctx, 410, 34, 0.62, iLevel(idx), PAL.green);
      } else if (chapter === 7) {
        ctx.save();
        ctx.fillStyle = '#d9d2c3';
        roundRect(ctx, 380, 24, 140, 92, 8);
        ctx.fill();
        ctx.strokeStyle = PAL.wood;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        drawRecord(ctx, 420, 52, 19, now / 900, { labelColor: PAL.green });
        drawRecord(ctx, 470, 52, 19, now / 900, { labelColor: PAL.green });
        drawTurntable(ctx, 150, 82, 40);
        drawRecord(ctx, 150, 82, 40, now / 1000);
        if (t < 0.5) {
          const p = t / 0.5;
          drawRecord(ctx, 420 - p * 270, 52 + p * 30, 19, now / 900, { labelColor: PAL.orange });
        }
        drawArmOnRecord(ctx, 150, 82, 40, 212, t > 0.55 ? PAL.green : PAL.blue, t > 0.55 ? 0 : 0.8);
        drawSpeaker(ctx, 500, 58, 0.55, t > 0.55 ? 0.5 : 0.15, PAL.green);
      } else if (chapter === 8) {
        drawTurntable(ctx, 150, 82, 46);
        drawRecord(ctx, 150, 82, 46, now / 1000);
        const lift = t > 0.25 ? Math.min(1, (t - 0.25) / 0.3) : 0;
        ctx.save();
        ctx.translate(150, 34);
        ctx.rotate(-0.16 * lift);
        ctx.fillStyle = '#cfc6b6';
        roundRect(ctx, -58, -14, 116, 22, 6);
        ctx.fill();
        ctx.strokeStyle = PAL.wood;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = PAL.purple;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(150, 82);
        ctx.bezierCurveTo(230, 58 + Math.sin(t * 8) * 3, 300, 44, 360, 44);
        ctx.stroke();
        ctx.strokeStyle = PAL.blue;
        ctx.beginPath();
        ctx.moveTo(150, 82);
        ctx.bezierCurveTo(230, 108 - Math.sin(t * 8) * 3, 300, 118, 360, 118);
        ctx.stroke();
        ctx.fillStyle = PAL.purple;
        ctx.beginPath();
        ctx.arc(360, 44, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.blue;
        ctx.beginPath();
        ctx.arc(360, 118, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (chapter === 9) {
        drawTurntable(ctx, 160, 74, 46);
        drawRecord(ctx, 160, 74, 46, now / 1100);
        const a = ((200 + t * 60) * Math.PI) / 180;
        const lx = 160 + Math.cos(a) * 30;
        const ly = 74 + Math.sin(a) * 30;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(lx, ly, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PAL.blue;
        ctx.lineWidth = 3;
        ctx.stroke();
        if (t > 0.55) {
          ctx.strokeStyle = PAL.green;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(lx - 7, ly);
          ctx.lineTo(lx - 2, ly + 6);
          ctx.lineTo(lx + 8, ly - 7);
          ctx.stroke();
        }
        ctx.restore();
        drawRecord(ctx, 420, 100, 18, now / 900, { labelColor: PAL.wood });
      } else {
        const idx = Math.floor((t * 3) % 3);
        const angles = [216, 233, 250];
        const colors = [PAL.red, PAL.orange, PAL.green];
        drawTurntable(ctx, 220, 78, 50);
        drawRecord(ctx, 220, 78, 50, now / 1100);
        for (let i = 0; i < 3; i += 1) {
          const ma = (angles[i] * Math.PI) / 180;
          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.arc(220 + Math.cos(ma) * 42, 78 + Math.sin(ma) * 42, i === idx ? 6 : 4, 0, Math.PI * 2);
          ctx.fill();
        }
        drawArmOnRecord(ctx, 220, 78, 50, angles[idx], colors[idx], 0);
        drawSpeaker(ctx, 470, 34, 0.62, iLevel(idx), colors[idx]);
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
  }, [chapterId]);

  return <canvas id={`cv-${chapterId}-ana`} ref={canvasRef} width={W} height={H} />;
};

function iLevel(i: number): number {
  return 0.18 + i * 0.14;
}

export default VinylAnalogy;
