import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;

export const Ch8Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [variant, setVariant] = useState<'parallel' | 'sequential'>('parallel');

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

    const card = (
      x: number,
      y: number,
      w: number,
      h: number,
      fill: string,
      stroke: string,
      weight = 2
    ) => {
      ctx.save();
      ctx.fillStyle = fill;
      roundRect(ctx, x, y, w, h, 9);
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke();
      ctx.restore();
    };

    const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, weight = 2) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = weight;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - 9 * Math.cos(a - 0.42), y2 - 9 * Math.sin(a - 0.42));
      ctx.lineTo(x2 - 9 * Math.cos(a + 0.42), y2 - 9 * Math.sin(a + 0.42));
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    card(50, 106, 116, 60, '#eef3f8', PAL.blue);
    drawTag(ctx, '编码器', 108, 190, PAL.blue, 'center');

    if (variant === 'parallel') {
      card(232, 136, 34, 34, '#e8eff7', PAL.blue);
      card(320, 48, 190, 54, '#f3eefb', PAL.purple);
      card(320, 172, 190, 54, '#eef3f8', PAL.blue);
      card(690, 106, 108, 60, '#eef3f8', PAL.blue);
      drawTag(ctx, '解码器', 790, 190, PAL.blue);

      arrow(166, 136, 230, 150, PAL.blue, 3);
      arrow(266, 136, 318, 84, PAL.purple, 3);
      arrow(266, 150, 318, 192, PAL.blue, 3);
      arrow(510, 80, 688, 120, PAL.purple, 2);
      arrow(510, 196, 688, 154, PAL.blue, 3);

      ctx.save();
      ctx.fillStyle = PAL.purple;
      ctx.font = '700 16px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('4.9M / 35.5M', 415, 122);
      ctx.restore();
    } else {
      card(232, 136, 34, 34, '#e8eff7', PAL.blue);
      card(320, 108, 150, 56, '#f3eefb', PAL.purple);
      card(500, 108, 150, 56, '#eef3f8', PAL.blue);
      card(690, 106, 108, 60, '#eef3f8', PAL.blue);
      drawTag(ctx, '解码器', 790, 190, PAL.blue);

      arrow(166, 136, 230, 150, PAL.blue, 3);
      arrow(266, 142, 318, 136, PAL.purple, 3);
      arrow(470, 136, 498, 136, PAL.purple, 3);
      arrow(650, 136, 688, 136, PAL.blue, 3);
    }

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [variant]);

  const feedback =
    variant === 'parallel'
      ? { text: '并行：pZ 独立一条支路，只占 4.9M / 35.5M（14%），其余参数都能在微调中更新。', cls: 'good' }
      : { text: '串行：pZ 与 fdec 叠在一起；同等参数量下旧码流 4.42%、新数据 −12.8%，都不如并行（1.87% / −13.2%）。', cls: 'warn' };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row" style={{ marginTop: 10 }}>
        <button
          className={`chip ${variant === 'parallel' ? 'selected' : ''}`}
          onClick={() => setVariant('parallel')}
        >
          并行支路
        </button>
        <button
          className={`chip ${variant === 'sequential' ? 'selected' : ''}`}
          onClick={() => setVariant('sequential')}
        >
          串行支路
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch8Mod1;
