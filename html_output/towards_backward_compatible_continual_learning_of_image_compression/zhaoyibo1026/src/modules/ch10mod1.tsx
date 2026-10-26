import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas, observeCanvas, clamp } from '../lib/canvasKit';
import { PAL, drawRoom, drawLegend, drawTag, ease } from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 340;
const X0 = 100;
const X1 = 1000;
const AXIS_Y = 270;
const ROW_Y = [80, 150, 220];

interface Racer {
  name: string;
  value: number;
  color: string;
}

interface Scenario {
  label: string;
  min: number;
  max: number;
  racers: Racer[];
  done: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: '数据增量',
    min: -15,
    max: 130,
    racers: [
      { name: '预训练', value: -5.67, color: PAL.blue },
      { name: '直接微调', value: 122.0, color: PAL.red },
      { name: '本文 KR', value: -7.87, color: PAL.green },
    ],
    done: '平均 BD-Rate：预训练 −5.67%，直接微调 122.0%，本文 −7.87%——KR 既保旧码流又学到新数据。',
  },
  {
    label: '低→高',
    min: -2,
    max: 11,
    racers: [
      { name: '直接微调', value: 9.58, color: PAL.red },
      { name: '本文 KR', value: 0.83, color: PAL.green },
    ],
    done: '低到高平均：直接微调 9.58%，本文 0.83%；预训练没有新码率结果，不能参与平均。',
  },
  {
    label: '高→低',
    min: -2,
    max: 11,
    racers: [
      { name: '直接微调', value: 9.76, color: PAL.red },
      { name: '本文 KR', value: 2.56, color: PAL.green },
    ],
    done: '高到低平均：直接微调 9.76%，本文 2.56%。',
  },
];

export const Ch10Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ phase: 'idle' as 'idle' | 'running' | 'done', t: 0, last: 0 });
  const rafRef = useRef<number | null>(null);
  const [scenario, setScenario] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [feedback, setFeedback] = useState({
    text: '横轴是平均 BD-Rate，越低越好。选场景后按开始对比。',
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
    const sc = SCENARIOS[scenario];
    const mapX = (v: number) => X0 + ((v - sc.min) / (sc.max - sc.min)) * (X1 - X0);

    const render = (now: number) => {
      const s = stateRef.current;
      if (s.phase === 'running') {
        const dt = s.last ? now - s.last : 16;
        s.t = Math.min(1, s.t + dt / 2000);
        if (s.t >= 1) {
          s.phase = 'done';
          setPhase('done');
          setFeedback({ text: sc.done, cls: 'good' });
        }
      }
      s.last = now;
      ctx.clearRect(0, 0, W, H);
      drawRoom(ctx, W, H);

      ctx.save();
      ctx.strokeStyle = PAL.ink;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(X0, AXIS_Y);
      ctx.lineTo(X1, AXIS_Y);
      ctx.stroke();
      ctx.restore();

      const zx = mapX(0);
      ctx.save();
      ctx.strokeStyle = 'rgba(33,50,74,0.28)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(zx, 40);
      ctx.lineTo(zx, AXIS_Y);
      ctx.stroke();
      ctx.restore();
      drawTag(ctx, '0', zx, AXIS_Y + 18, PAL.muted, 'center');

      sc.racers.forEach((racer, i) => {
        const y = ROW_Y[i];
        ctx.save();
        ctx.strokeStyle = 'rgba(33,50,74,0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(X0, y);
        ctx.lineTo(X1, y);
        ctx.stroke();
        ctx.restore();

        const p = ease(s.t);
        const x = mapX(0) + (mapX(racer.value) - mapX(0)) * p;
        ctx.save();
        ctx.fillStyle = racer.color;
        ctx.beginPath();
        ctx.arc(clamp(x, X0, X1), y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = PAL.white;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        if (s.phase === 'done') {
          ctx.save();
          ctx.fillStyle = racer.color;
          ctx.font = '700 16px "Segoe UI", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(`${racer.value}%`, clamp(x, X0 + 30, X1 - 30), y + 16);
          ctx.restore();
        }
      });

      const legend = sc.racers.map((r) => ({ label: r.name, color: r.color }));
      drawLegend(ctx, X0, 28, legend);

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
  }, [scenario]);

  const choose = (i: number) => {
    stateRef.current = { phase: 'idle', t: 0, last: 0 };
    setPhase('idle');
    setScenario(i);
    setFeedback({ text: '横轴是平均 BD-Rate，越低越好。选场景后按开始对比。', cls: '' });
  };

  const startRun = () => {
    if (stateRef.current.phase === 'running') return;
    stateRef.current.phase = 'running';
    stateRef.current.t = 0;
    stateRef.current.last = 0;
    setPhase('running');
    setFeedback({ text: '标记从 0 出发，位置就是平均 BD-Rate；越靠左越好。', cls: '' });
  };

  const reset = () => {
    stateRef.current = { phase: 'idle', t: 0, last: 0 };
    setPhase('idle');
    setFeedback({ text: '横轴是平均 BD-Rate，越低越好。选场景后按开始对比。', cls: '' });
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="chip-row" style={{ marginTop: 10 }}>
        {SCENARIOS.map((sc, i) => (
          <button
            key={sc.label}
            className={`chip ${scenario === i ? 'selected' : ''}`}
            onClick={() => choose(i)}
          >
            {sc.label}
          </button>
        ))}
      </div>
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

export default Ch10Mod1;
