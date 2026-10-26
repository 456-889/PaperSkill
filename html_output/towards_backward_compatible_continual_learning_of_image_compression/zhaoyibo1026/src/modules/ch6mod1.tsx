import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTurntable, drawRecord, drawArmOnRecord, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const ANGLES = [250, 216, 201, 186, 171, 171];
const SHAPES = ['4×4×128', '8×8×256', '16×16×384', '32×32×256'];
const FEEDBACK = [
  { text: '四路码流已就绪；先由 pZ 预测第一级的分布。', cls: '' },
  { text: '阶段 1：解出 z₁（4×4×128），解码器更新 r₁。', cls: '' },
  { text: '阶段 2：在 z₁ 条件下解出 z₂（8×8×256），更新 r₂。', cls: '' },
  { text: '阶段 3：解出 z₃（16×16×384），更新 r₃。', cls: '' },
  { text: '阶段 4：解出 z₄（32×32×256），更新 r₄。', cls: '' },
  { text: '上采样到 256×256×3，重建完成——四段都走完，图像才出现。', cls: 'good' },
];

export const Ch6Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState(0);

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

    const active = step >= 1 && step <= 4 ? step : 0;
    drawTurntable(ctx, 260, 150, 96);
    drawRecord(ctx, 260, 150, 96, 0.35, { activeBand: active || undefined, markerAngle: 208 });
    drawArmOnRecord(
      ctx,
      260,
      150,
      96,
      ANGLES[step],
      step === 5 ? PAL.green : PAL.blue,
      step === 0 ? 1 : 0
    );

    ctx.save();
    ctx.fillStyle = PAL.white;
    roundRect(ctx, 540, 30, 470, 220, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < 4; i += 1) {
      const y = 44 + i * 44;
      const done = step >= i + 1;
      const isActive = step === i + 1;
      ctx.save();
      ctx.fillStyle = done ? (isActive ? '#e8eff7' : '#eef3f8') : '#f3f4f2';
      roundRect(ctx, 566, y, 300, 34, 7);
      ctx.fill();
      ctx.strokeStyle = isActive ? PAL.blue : done ? '#9bb0c8' : PAL.line;
      ctx.lineWidth = isActive ? 3 : 1.5;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.fillStyle = done ? PAL.blue : '#c9d2dd';
      ctx.beginPath();
      ctx.arc(582, y + 17, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (isActive) {
        drawTag(ctx, `z${'₁₂₃₄'[i]}`, 886, y + 17, PAL.blue);
        ctx.save();
        ctx.fillStyle = PAL.ink;
        ctx.font = '600 15px "Segoe UI", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(SHAPES[i], 912, y + 17);
        ctx.restore();
      }
    }

    if (step === 5) {
      ctx.save();
      ctx.fillStyle = '#eef3f8';
      roundRect(ctx, 884, 64, 110, 110, 8);
      ctx.fill();
      ctx.strokeStyle = PAL.green;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      drawTag(ctx, '256×256', 939, 194, PAL.green, 'center');
    } else {
      ctx.save();
      ctx.strokeStyle = PAL.line;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(866, 62);
      ctx.lineTo(866, 204);
      ctx.stroke();
      ctx.restore();
    }

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [step]);

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button className="tiny" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
          上一步
        </button>
        <span className="step-label">
          步骤 <b>{step}</b> / 5
        </span>
        <button
          className="tiny"
          onClick={() => setStep((s) => Math.min(5, s + 1))}
          disabled={step === 5}
        >
          下一步
        </button>
        <button className="tiny" onClick={() => setStep(0)} disabled={step === 0}>
          重置
        </button>
      </div>
      <div className={`feedback ${FEEDBACK[step].cls}`}>{FEEDBACK[step].text}</div>
    </div>
  );
};

export default Ch6Mod1;
