import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import {
  PAL,
  drawRoom,
  drawTurntable,
  drawRecord,
  drawTag,
  roundRect,
  bandRadius,
} from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const CX = 290;
const CY = 145;
const R = 110;
const SHAPES = ['4×4×128', '8×8×256', '16×16×384', '32×32×256'];
const SIZES = [4, 8, 16, 32];
const CHANNELS = [128, 256, 384, 256];
const FEEDBACK = [
  '阶段 1 的 z₁ 是 4×4×128，先重建大轮廓。',
  '阶段 2 的 z₂ 是 8×8×256，补上中层结构。',
  '阶段 3 的 z₃ 是 16×16×384，补细节。',
  '阶段 4 的 z₄ 是 32×32×256，补最细纹理；每一级都单独形成码流。',
];

export const Ch2Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stage, setStage] = useState(1);
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
    drawTurntable(ctx, CX, CY, R);
    drawRecord(ctx, CX, CY, R, 0.7, { activeBand: stage, markerAngle: 205 });

    ctx.save();
    ctx.fillStyle = PAL.white;
    roundRect(ctx, 600, 44, 440, 202, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    const size = SIZES[stage - 1];
    const gx = 622;
    const gy = 70;
    const gs = 132;
    const cell = gs / size;
    ctx.save();
    ctx.strokeStyle = 'rgba(39,68,110,0.18)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 1) {
      ctx.beginPath();
      ctx.moveTo(gx + i * cell, gy);
      ctx.lineTo(gx + i * cell, gy + gs);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(gx, gy + i * cell);
      ctx.lineTo(gx + gs, gy + i * cell);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(39,68,110,0.10)';
    ctx.fillRect(gx, gy, gs, gs);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#e7ebf1';
    roundRect(ctx, 790, 70, 30, 132, 8);
    ctx.fill();
    const hFrac = CHANNELS[stage - 1] / 384;
    ctx.fillStyle = PAL.purple;
    roundRect(ctx, 790, 70 + 132 * (1 - hFrac), 30, 132 * hFrac, 8);
    ctx.fill();
    ctx.restore();

    drawTag(ctx, `z${'₁₂₃₄'[stage - 1]}`, 860, 100, PAL.blue);
    ctx.save();
    ctx.fillStyle = PAL.ink;
    ctx.font = '700 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(SHAPES[stage - 1], 860, 134);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(622, 216);
    ctx.lineTo(1018, 216);
    ctx.stroke();
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [stage]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * W) / rect.width;
    const y = ((e.clientY - rect.top) * H) / rect.height;
    const d = Math.hypot(x - CX, y - CY);
    let best = 0;
    let bestDist = 14;
    for (let b = 1; b <= 4; b += 1) {
      const diff = Math.abs(d - bandRadius(R, b));
      if (diff < bestDist) {
        bestDist = diff;
        best = b;
      }
    }
    if (best > 0) {
      setStage(best);
      setFeedback(FEEDBACK[best - 1]);
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
        onClick={onCanvasClick}
      />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {[1, 2, 3, 4].map((b) => (
          <button
            key={b}
            className={`chip ${stage === b ? 'selected' : ''}`}
            onClick={() => {
              setStage(b);
              setFeedback(FEEDBACK[b - 1]);
            }}
          >
            阶段 {b}
          </button>
        ))}
      </div>
      <div className="feedback">{feedback}</div>
    </div>
  );
};

export default Ch2Mod1;
