import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, clamp } from '../lib/canvasKit';
import { PAL, drawRoom, drawTurntable, drawRecord, drawArmOnRecord, drawTag, drawMeter, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const OLD = [262.9, 23, 3.67, 0.87];
const NEW = [-19.0, -16.9, -16.3, -16.6];
const SHELF = [0, 1, 2, 2];
const FEEDBACK = [
  { text: '只微调：旧码流 262.9%，旧唱片几乎放不了。', cls: 'bad' },
  { text: '加回放旧数据：旧码流降到 23%，但仍比预训练差（1.87%）。', cls: 'warn' },
  { text: '加回放损失：旧码流 3.67%，已经接近预训练。', cls: 'warn' },
  { text: '两者都用：旧码流 0.87%，比预训练还好；平均 −7.87%。', cls: 'good' },
];
const LABELS = ['直接微调', '加回放数据', '加回放损失', '两者都用'];

export const Ch7Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cfg, setCfg] = useState(0);

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
    ctx.fillStyle = '#e8e0d0';
    roundRect(ctx, 36, 48, 124, 120, 8);
    ctx.fill();
    ctx.strokeStyle = PAL.wood;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
    for (let i = 0; i < SHELF[cfg]; i += 1) {
      drawRecord(ctx, 72 + i * 38, 92, 16, 0.3 + i, { labelColor: PAL.green });
    }

    drawTurntable(ctx, 280, 158, 82);
    drawRecord(ctx, 280, 158, 82, 0.45);
    drawArmOnRecord(
      ctx,
      280,
      158,
      82,
      212,
      cfg === 0 ? PAL.red : cfg === 3 ? PAL.green : PAL.blue,
      0
    );

    const oldColor = cfg === 0 ? PAL.red : OLD[cfg] <= 1.87 ? PAL.green : PAL.orange;
    const newColor = PAL.green;
    const oldFrac = clamp(1 - OLD[cfg] / 300, 0.02, 1);
    const newFrac = clamp((-NEW[cfg] - 13) / 7, 0.02, 1);

    drawTag(ctx, '旧码流', 600, 92, PAL.muted);
    drawMeter(ctx, 690, 82, 290, 20, oldFrac, oldColor);
    ctx.save();
    ctx.fillStyle = oldColor;
    ctx.font = '700 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${OLD[cfg].toFixed(OLD[cfg] < 10 ? 2 : 1)}%`, 996, 92);
    ctx.restore();

    drawTag(ctx, '新数据', 600, 170, PAL.muted);
    drawMeter(ctx, 690, 160, 290, 20, newFrac, newColor);
    ctx.save();
    ctx.fillStyle = newColor;
    ctx.font = '700 18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${NEW[cfg].toFixed(1)}%`, 996, 170);
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [cfg]);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {LABELS.map((label, i) => (
          <button
            key={label}
            className={`chip ${cfg === i ? 'selected' : ''}`}
            onClick={() => setCfg(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={`feedback ${FEEDBACK[cfg].cls}`}>{FEEDBACK[cfg].text}</div>
    </div>
  );
};

export default Ch7Mod1;
