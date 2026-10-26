import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas } from '../lib/canvasKit';
import { PAL, drawRoom, drawTurntable, drawRecord, drawArmOnRecord, drawTag, roundRect } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const PANELS = [
  { x: 40, label: '冻结 pZ' },
  { x: 540, label: '改动 pZ' },
];
const PW = 500;
const PH = 220;
const PY = 30;

export const Ch3Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ phase: 'idle' as 'idle' | 'running' | 'done', t: 0, last: 0 });
  const rafRef = useRef<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [feedback, setFeedback] = useState({
    text: '按下播放，左右同时读取同一段旧码流。',
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
        s.t = Math.min(1, s.t + dt / 2600);
        if (s.t >= 1) {
          s.phase = 'done';
          setPhase('done');
          setFeedback({
            text: '左边拿回同一组 z，右边连 z 都取错。冻结 pZ 保证解得回潜变量；画面还要靠回放训练守住。',
            cls: 'warn',
          });
        }
      }
      s.last = now;
      ctx.clearRect(0, 0, W, H);
      drawRoom(ctx, W, H);

      PANELS.forEach((panel, pi) => {
        const px = panel.x;
        ctx.save();
        ctx.fillStyle = PAL.white;
        roundRect(ctx, px, PY, PW, PH, 10);
        ctx.fill();
        ctx.strokeStyle = pi === 1 && s.phase === 'done' ? PAL.red : PAL.line;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        const cx = px + 190;
        const cy = PY + 100;
        const r = 56;
        drawTurntable(ctx, cx, cy, r);
        drawRecord(ctx, cx, cy, r, now / 1000, {
          labelColor: pi === 1 ? '#b05a3a' : PAL.label,
        });
        const jitter = pi === 1 && s.t > 0.35 ? Math.sin((s.t - 0.35) * 70) * 10 : 0;
        drawArmOnRecord(ctx, cx, cy, r, 212 + jitter, pi === 1 && s.t > 0.35 ? PAL.red : PAL.blue, 0);
        if (pi === 1 && s.t > 0.35) {
          ctx.save();
          ctx.strokeStyle = 'rgba(196,63,82,0.5)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(cx, cy, 48, 0.7, 1.5);
          ctx.stroke();
          ctx.restore();
        }

        drawTag(ctx, panel.label, px + 18, PY + 18, pi === 1 ? PAL.red : PAL.blue);

        for (let i = 0; i < 4; i += 1) {
          const bx = px + 368 + i * 28;
          const by = PY + 66;
          let fill: string = '#e7ebf1';
          if (pi === 0) {
            if (s.t > 0.18 + i * 0.18) fill = PAL.blue;
          } else if (s.phase === 'done') {
            fill = PAL.red;
          } else if (s.t > 0.2) {
            fill = ['#c7a08a', '#9aa88f', '#c08b6a'][(i + Math.floor(now / 120)) % 3];
          }
          ctx.save();
          ctx.fillStyle = fill;
          roundRect(ctx, bx, by, 20, 20, 4);
          ctx.fill();
          ctx.strokeStyle = fill === '#e7ebf1' ? PAL.line : fill;
          ctx.lineWidth = 1;
          ctx.stroke();
          if (pi === 1 && s.phase === 'done') {
            ctx.strokeStyle = PAL.white;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(bx + 5, by + 5);
            ctx.lineTo(bx + 15, by + 15);
            ctx.moveTo(bx + 15, by + 5);
            ctx.lineTo(bx + 5, by + 15);
            ctx.stroke();
          }
          ctx.restore();
        }
      });

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
    setFeedback({ text: '左边 pZ 不动，右边 pZ 跟着微调一起变。', cls: '' });
  };

  const reset = () => {
    stateRef.current.phase = 'idle';
    stateRef.current.t = 0;
    stateRef.current.last = 0;
    setPhase('idle');
    setFeedback({ text: '按下播放，左右同时读取同一段旧码流。', cls: '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="step-ctrl">
        <button className="tiny" onClick={startRun} disabled={phase === 'running'}>
          开始播放
        </button>
        <button className="tiny" onClick={reset} disabled={phase === 'idle'}>
          重置
        </button>
      </div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch3Mod1;
