import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTag, roundRect, hitRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const ROWS = [
  { name: 'MSH', total: 17.6, pz: 8.2, share: 47 },
  { name: 'GMA', total: 26.6, pz: 9.0, share: 34 },
  { name: 'ELIC', total: 33.8, pz: 16.7, share: 49 },
  { name: 'STF', total: 99.9, pz: 81.4, share: 81 },
  { name: 'TCM', total: 45.2, pz: 35.2, share: 78 },
  { name: 'MLIC++', total: 116.7, pz: 98.4, share: 84 },
  { name: 'Ours', total: 35.5, pz: 4.9, share: 14 },
];
const MAXP = 120;
const X0 = 210;
const BARM = 500;

function feedbackFor(i: number): { text: string; cls: string } {
  const r = ROWS[i];
  if (i === 6) {
    return { text: '总 35.5M，pZ 4.9M（14%）——冻结它只锁住一小部分参数。', cls: 'good' };
  }
  if (i === 5) {
    return { text: '总 116.7M，pZ 98.4M（84%）——冻结熵模型等于锁死大部分参数。', cls: 'bad' };
  }
  return {
    text: `总 ${r.total}M，pZ ${r.pz}M（${r.share}%）——熵模型占比越高，持续学习越受限。`,
    cls: r.share > 50 ? 'warn' : '',
  };
}

export const Ch8Mod2: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState(6);
  const [feedback, setFeedback] = useState(feedbackFor(6));

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

    ROWS.forEach((row, i) => {
      const y = 24 + i * 32;
      if (i === model) {
        ctx.save();
        ctx.fillStyle = 'rgba(39,68,110,0.08)';
        roundRect(ctx, 150, y - 8, 780, 28, 7);
        ctx.fill();
        ctx.strokeStyle = PAL.blue;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.fillStyle = i === model ? PAL.ink : PAL.muted;
      ctx.font = `${i === model ? '700 ' : ''}13px "Segoe UI", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(row.name, 146, y + 5);
      ctx.restore();

      const tw = (row.total / MAXP) * BARM;
      const pw = (row.pz / MAXP) * BARM;
      ctx.save();
      ctx.fillStyle = '#e7ebf1';
      roundRect(ctx, X0, y - 3, BARM, 17, 8);
      ctx.fill();
      ctx.fillStyle = '#c3d0df';
      roundRect(ctx, X0, y - 3, Math.max(3, tw), 17, 8);
      ctx.fill();
      ctx.fillStyle = PAL.purple;
      roundRect(ctx, X0, y - 3, Math.max(3, pw), 17, 8);
      ctx.fill();
      ctx.restore();
    });

    const sel = ROWS[model];
    ctx.save();
    ctx.fillStyle = PAL.ink;
    ctx.font = '700 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${sel.total}M / ${sel.pz}M`, 760, 24 + model * 32 + 5);
    ctx.restore();
    drawTag(ctx, `${sel.share}%`, 900, 24 + model * 32 + 5, PAL.purple);

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [model]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * W) / rect.width;
    const y = ((e.clientY - rect.top) * H) / rect.height;
    for (let i = 0; i < ROWS.length; i += 1) {
      const ry = 24 + i * 32 - 10;
      if (hitRect(x, y, 150, ry, 780, 32)) {
        setModel(i);
        setFeedback(feedbackFor(i));
        return;
      }
    }
  };

  return (
    <div>
      <canvas
        id={`cv-${chapterId}-${moduleId}`}
        ref={canvasRef}
        width={W}
        height={H}
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {ROWS.map((row, i) => (
          <button
            key={row.name}
            className={`chip ${model === i ? 'selected' : ''}`}
            onClick={() => {
              setModel(i);
              setFeedback(feedbackFor(i));
            }}
          >
            {row.name}
          </button>
        ))}
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch8Mod2;
