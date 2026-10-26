import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTurntable, drawRecord, drawArmOnRecord, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const LAMS = [32, 256, 1024];
const LEVEL = [0, 1, 2];
const FEEDBACK = [
  { text: 'λ = 32：针压轻，码率优先，细节让位给更小的码流。', cls: '' },
  { text: 'λ = 256：中间采样点，码率与质量取得平衡。', cls: 'good' },
  { text: 'λ = 1024：针压重，质量优先，码率随之升高。', cls: 'warn' },
];

export const Ch5Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [li, setLi] = useState(1);
  const [feedback, setFeedback] = useState(FEEDBACK[1]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }
    const level = LEVEL[li];
    ctx.clearRect(0, 0, W, H);
    drawRoom(ctx, W, H);

    drawTurntable(ctx, 250, 145, 84);
    drawRecord(ctx, 250, 145, 84, 0.4);
    drawArmOnRecord(ctx, 250, 145, 84, 212, PAL.blue, 0);
    const tipA = (212 * Math.PI) / 180;
    ctx.save();
    ctx.fillStyle = PAL.orange;
    roundRect(ctx, 250 + Math.cos(tipA) * 64 - 7, 145 + Math.sin(tipA) * 64 - 5, 14, 10, 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = 'rgba(33,50,74,0.12)';
    roundRect(ctx, 108, 228, 210, 20, 10);
    ctx.fill();
    ctx.fillStyle = PAL.orange;
    ctx.beginPath();
    ctx.arc(118 + level * 66, 238, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PAL.white;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = PAL.white;
    roundRect(ctx, 580, 40, 440, 206, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const box = (x: number, y: number, w: number, h: number, fill: string, stroke: string) => {
      ctx.save();
      ctx.fillStyle = fill;
      roundRect(ctx, x, y, w, h, 7);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    };

    box(606, 78, 92, 40, '#eef3f8', PAL.blue);
    box(736, 78, 66, 40, '#f3f0e8', PAL.wood);
    box(844, 62, 132, 96, '#fdf1e7', PAL.orange);
    box(994, 78, 24, 40, '#eef3f8', PAL.blue);

    ctx.save();
    ctx.strokeStyle = PAL.muted;
    ctx.fillStyle = PAL.muted;
    ctx.lineWidth = 2;
    const arrow = (x1: number, y1: number, x2: number, y2: number) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 7 * Math.cos(a - 0.4), y2 - 7 * Math.sin(a - 0.4));
      ctx.lineTo(x2 - 7 * Math.cos(a + 0.4), y2 - 7 * Math.sin(a + 0.4));
      ctx.closePath();
      ctx.fill();
    };
    arrow(698, 98, 734, 98);
    arrow(802, 98, 842, 98);
    arrow(976, 98, 998, 98);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = PAL.purple;
    ctx.beginPath();
    ctx.arc(760, 186, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(124,58,237,0.35)';
    ctx.lineWidth = 2 + level;
    ctx.beginPath();
    ctx.arc(760, 186, 23 + level * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    drawTag(ctx, 'λ', 760, 214, PAL.purple, 'center');
    ctx.save();
    ctx.strokeStyle = PAL.purple;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(760, 166);
    ctx.lineTo(880, 160);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#e7ebf1';
    roundRect(ctx, 856, 76, 108, 14, 7);
    ctx.fill();
    ctx.fillStyle = PAL.orange;
    roundRect(ctx, 856, 76, 108 * (0.22 + level * 0.39), 14, 7);
    ctx.fill();
    ctx.fillStyle = '#e7ebf1';
    roundRect(ctx, 856, 108, 108, 14, 7);
    ctx.fill();
    ctx.fillStyle = PAL.purple;
    roundRect(ctx, 856, 108, 108 * (0.18 + level * 0.3), 14, 7);
    ctx.fill();
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [li]);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {LAMS.map((lam, i) => (
          <button
            key={lam}
            className={`chip ${li === i ? 'selected' : ''}`}
            onClick={() => {
              setLi(i);
              setFeedback(FEEDBACK[i]);
            }}
          >
            λ = {lam}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch5Mod1;
