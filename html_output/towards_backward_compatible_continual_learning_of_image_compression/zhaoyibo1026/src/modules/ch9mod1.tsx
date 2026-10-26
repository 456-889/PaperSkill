import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, clamp } from '../lib/canvasKit';
import { PAL, drawRoom, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const OLD = [1.87, 262.9, 0.87];
const NEW = [-13.2, -19.0, -16.6];
const AVG = [-5.67, 122.0, -7.87];
const MODES = ['预训练', '直接微调', '本文 KR'];
const FEEDBACK = [
  { text: '旧码流 1.87%，新数据 −13.2%：旧唱片稳，但没学到新数据。', cls: '' },
  { text: '旧码流 262.9%：新数据虽好（−19.0%），旧唱片却毁了。', cls: 'bad' },
  { text: '旧码流 0.87%、新数据 −16.6%：两边都不牺牲，平均 −7.87%。', cls: 'good' },
];

function gauge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  frac: number,
  color: string,
  value: string
): void {
  const start = (150 * Math.PI) / 180;
  const sweep = (240 * Math.PI) / 180;
  ctx.save();
  ctx.strokeStyle = '#e7ebf1';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, start + sweep);
  ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, start + sweep * clamp(frac, 0, 1));
  ctx.stroke();
  const na = start + sweep * clamp(frac, 0, 1);
  ctx.strokeStyle = PAL.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(na) * (r - 18), cy + Math.sin(na) * (r - 18));
  ctx.stroke();
  ctx.fillStyle = PAL.ink;
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.font = '700 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, cx, cy + r * 0.62);
  ctx.restore();
}

export const Ch9Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }
    ctx.clearRect(0, 0, W, H);
    drawRoom(ctx, W, H);

    ctx.save();
    ctx.fillStyle = PAL.white;
    roundRect(ctx, 70, 36, 290, 200, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    roundRect(ctx, 400, 36, 290, 200, 12);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    drawTag(ctx, '旧码流', 104, 58, PAL.muted);
    drawTag(ctx, '新数据', 434, 58, PAL.muted);

    const oldColor = OLD[mode] > 100 ? PAL.red : PAL.green;
    const newColor = mode === 0 ? PAL.blue : PAL.green;
    gauge(ctx, 215, 148, 74, OLD[mode] / 280, oldColor, `${OLD[mode].toFixed(OLD[mode] < 10 ? 2 : 1)}%`);
    gauge(ctx, 545, 148, 74, (-NEW[mode] - 12) / 9, newColor, `${NEW[mode].toFixed(1)}%`);

    ctx.save();
    ctx.fillStyle = '#eef3f8';
    roundRect(ctx, 730, 60, 300, 150, 12);
    ctx.fill();
    ctx.strokeStyle = AVG[mode] > 100 ? PAL.red : AVG[mode] < 0 ? PAL.green : PAL.line;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = AVG[mode] > 100 ? PAL.red : AVG[mode] < 0 ? PAL.green : PAL.ink;
    ctx.font = '700 40px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${AVG[mode].toFixed(2)}%`, 880, 140);
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [mode]);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {MODES.map((label, i) => (
          <button
            key={label}
            className={`chip ${mode === i ? 'selected' : ''}`}
            onClick={() => setMode(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={`feedback ${FEEDBACK[mode].cls}`}>{FEEDBACK[mode].text}</div>
    </div>
  );
};

export default Ch9Mod1;
