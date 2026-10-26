import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, clamp } from '../lib/canvasKit';
import { PAL, drawRoom, drawMeter, drawFader, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const ALPHAS = [0, 0.25, 0.5, 0.75, 1];
const OLD = [262.9, 1.4, 0.87, 0.72, 0.63];
const NEW = [-19.0, -16.8, -16.6, -16.3, -14.4];
const TRACK_X = 104;
const TRACK_W = 240;

const FEEDBACK = [
  { text: '不混旧数据：旧码流 BD-Rate 262.9%，旧唱片几乎全毁。', cls: 'bad' },
  { text: '平衡区：旧码流 1.40%，新数据 −16.8%，平均 −7.7%。', cls: 'good' },
  { text: '平衡区：旧码流 0.87%，新数据 −16.6%，平均 −7.9%，默认取这里。', cls: 'good' },
  { text: '平衡区：旧码流 0.72%，新数据 −16.3%，平均 −7.8%。', cls: 'good' },
  { text: '只用旧数据：旧码流 0.63% 最好，但新数据退化到 −14.4%。', cls: 'warn' },
];

export const Ch4Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef(false);
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState(FEEDBACK[0]);

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
    ctx.fillStyle = '#d9d2c3';
    roundRect(ctx, 56, 58, 304, 150, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.wood;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    drawFader(ctx, TRACK_X, 148, TRACK_W, ALPHAS[idx], idx === 4 ? PAL.orange : PAL.blue);

    const oldColor = idx === 0 ? PAL.red : PAL.green;
    const newColor = idx === 4 ? PAL.orange : PAL.green;
    const oldFrac = clamp(1 - OLD[idx] / 300, 0.02, 1);
    const newFrac = clamp((-NEW[idx] - 13) / 7, 0.02, 1);

    drawTag(ctx, '旧码流', 560, 92, PAL.muted);
    drawMeter(ctx, 650, 82, 330, 20, oldFrac, oldColor);
    ctx.save();
    ctx.fillStyle = oldColor;
    ctx.font = '700 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${OLD[idx].toFixed(OLD[idx] < 10 ? 2 : 1)}%`, 996, 92);
    ctx.restore();

    drawTag(ctx, '新数据', 560, 182, PAL.muted);
    drawMeter(ctx, 650, 172, 330, 20, newFrac, newColor);
    ctx.save();
    ctx.fillStyle = newColor;
    ctx.font = '700 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${NEW[idx].toFixed(1)}%`, 996, 182);
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [idx]);

  const pick = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) * W) / rect.width;
    if (x < 80 || x > 370) return;
    const frac = clamp((x - TRACK_X) / TRACK_W, 0, 1);
    const next = Math.round(frac * 4);
    setIdx(next);
    setFeedback(FEEDBACK[next]);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    pick(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current) pick(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div>
      <canvas
        id={`cv-${chapterId}-${moduleId}`}
        ref={canvasRef}
        width={W}
        height={H}
        style={{ cursor: 'ew-resize', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
      <div className="ctrl">
        <label>
          α <span className="val">{ALPHAS[idx].toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={4}
          step={1}
          value={idx}
          onChange={(e) => {
            const next = Number(e.target.value);
            setIdx(next);
            setFeedback(FEEDBACK[next]);
          }}
        />
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch4Mod1;
