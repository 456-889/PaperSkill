import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTag, roundRect, ease } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const PW = 500;
const PH = 220;
const PX = [40, 540];
const PY = 30;
const TILE_COLORS = ['#8d99a6', '#a58d7b', '#b05a3a', '#6f7d8c', '#9aa88f', '#c08b6a'];

function drawScene(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  damage: number
): void {
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, x, y, w, h, 10);
  ctx.clip();
  ctx.fillStyle = '#dfe9f3';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h * 0.22, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a9c39a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.25, y + h * 0.82, w * 0.34, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fa06e';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.78, y + h * 0.9, w * 0.36, h * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8e0d0';
  ctx.fillRect(x + w * 0.4, y + h * 0.5, w * 0.2, h * 0.3);
  ctx.fillStyle = '#b05a3a';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.36, y + h * 0.5);
  ctx.lineTo(x + w * 0.5, y + h * 0.36);
  ctx.lineTo(x + w * 0.64, y + h * 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = PAL.blue;
  ctx.fillRect(x + w * 0.47, y + h * 0.62, w * 0.06, h * 0.18);

  if (damage > 0.001) {
    const cols = 10;
    const rows = 6;
    const tw = w / cols;
    const th = h / rows;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const i = r * cols + c;
        const order = ((i * 37) % 60) / 60;
        if (order > damage) continue;
        ctx.fillStyle = TILE_COLORS[(i * 7) % TILE_COLORS.length];
        ctx.fillRect(x + c * tw, y + r * th, tw + 1, th + 1);
        ctx.strokeStyle = 'rgba(33,50,74,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + c * tw, y + r * th + th * 0.7);
        ctx.lineTo(x + (c + 1) * tw, y + r * th + th * 0.3);
        ctx.stroke();
      }
    }
    if (damage > 0.9) {
      ctx.fillStyle = 'rgba(196,63,82,0.22)';
      ctx.fillRect(x, y, w, h);
    }
  }
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = damage > 0.9 ? PAL.red : PAL.line;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  ctx.restore();
}

export const Ch1Mod2: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ phase: 'idle' as 'idle' | 'running' | 'done', t: 0, last: 0 });
  const rafRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [feedback, setFeedback] = useState({
    text: '按下开始，同一段旧码流分别交给两个解码器。',
    cls: '',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try {
      ctx = setupCanvas(canvas, W, H);
    } catch {
      return;
    }

    const render = (now: number) => {
      const s = stateRef.current;
      if (s.phase === 'running') {
        const dt = s.last ? now - s.last : 16;
        s.t = Math.min(1, s.t + dt / 2200);
        if (s.t >= 1) {
          s.phase = 'done';
          setPhase('done');
          setFeedback({
            text: '原解码器清晰还原；微调后的解码器输出错乱——旧码流再也读不回来。',
            cls: 'bad',
          });
        }
      }
      s.last = now;
      ctx.clearRect(0, 0, W, H);
      drawRoom(ctx, W, H);
      drawScene(ctx, PX[0], PY, PW, PH, 0);
      drawScene(ctx, PX[1], PY, PW, PH, ease(s.t));
      drawTag(ctx, '原解码', PX[0] + 16, PY - 8, PAL.blue);
      drawTag(ctx, '新解码', PX[1] + 16, PY - 8, s.phase === 'done' ? PAL.red : PAL.blue);
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
    };

    const tick = () => {
      render(performance.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      stateRef.current.last = 0;
    };
    const start = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => {
      stop();
      disconnect();
    };
  }, []);

  const startRun = () => {
    if (stateRef.current.phase === 'running') return;
    stateRef.current.phase = 'running';
    stateRef.current.t = 0;
    stateRef.current.last = 0;
    setPhase('running');
    setFeedback({ text: '两边拿到的是同一段码流，只是解码器不同。', cls: '' });
  };

  const reset = () => {
    stateRef.current.phase = 'idle';
    stateRef.current.t = 0;
    stateRef.current.last = 0;
    setPhase('idle');
    setFeedback({ text: '按下开始，同一段旧码流分别交给两个解码器。', cls: '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button className="tiny" onClick={startRun} disabled={phase === 'running'}>
          开始对比
        </button>
        <button className="tiny" onClick={reset} disabled={phase === 'idle'}>
          重置
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch1Mod2;
