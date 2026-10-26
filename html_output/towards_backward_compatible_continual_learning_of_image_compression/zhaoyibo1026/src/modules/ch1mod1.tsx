import React, { useEffect, useRef, useState } from 'react';
import { setupCanvas } from '../lib/canvasKit';
import {
  PAL,
  drawRoom,
  drawTurntable,
  drawRecord,
  drawArmOnRecord,
  drawMeter,
  drawTag,
  roundRect,
} from './vinyl-kit';
import type { WidgetProps } from './registry';

const W = 1080;
const H = 280;
const OLD = [26.7, 26.7, 419.1];
const LABELS = ['原装', '只微调编码器', '编码器+解码器'];

export const Ch1Mod1: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stop, setStop] = useState(0);
  const [feedback, setFeedback] = useState({
    text: 'MSH-VR 原装唱针：旧唱片平稳播放，旧码流 BD-Rate 26.7%。',
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
    ctx.clearRect(0, 0, W, H);
    drawRoom(ctx, W, H);

    drawTurntable(ctx, 300, 150, 90);
    drawRecord(ctx, 300, 150, 90, 0.5);
    const angle = stop === 2 ? 252 : 212;
    const color = stop === 2 ? PAL.red : PAL.blue;
    drawArmOnRecord(ctx, 300, 150, 90, angle, color, 0);
    if (stop === 2) {
      ctx.save();
      ctx.strokeStyle = 'rgba(196,63,82,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(300, 150, 78 + i * 8, 0.9 + i * 0.18, 1.55 + i * 0.18);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.save();
    ctx.fillStyle = PAL.white;
    roundRect(ctx, 600, 50, 420, 185, 12);
    ctx.fill();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    drawTag(ctx, '旧码流 BD-Rate', 626, 82, PAL.muted);
    ctx.save();
    ctx.fillStyle = stop === 2 ? PAL.red : PAL.blue;
    ctx.font = '700 34px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${OLD[stop]}%`, 626, 122);
    ctx.restore();
    drawMeter(ctx, 626, 168, 368, 18, OLD[stop] / 450, stop === 2 ? PAL.red : PAL.blue);
    ctx.save();
    ctx.strokeStyle = PAL.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(626, 200);
    ctx.lineTo(994, 200);
    ctx.stroke();
    ctx.restore();

    if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
  }, [stop]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setStop(v);
    if (v === 0) {
      setFeedback({ text: 'MSH-VR 原装唱针：旧唱片平稳播放，旧码流 BD-Rate 26.7%。', cls: '' });
    } else if (v === 1) {
      setFeedback({
        text: 'MSH-VR 只微调编码器：解码器没变，旧唱片仍能放，旧码流还是 26.7%。',
        cls: '',
      });
    } else {
      setFeedback({
        text: 'MSH-VR 编码器和解码器一起动：旧码流 BD-Rate 飙到 419.1%，唱针在纹槽上打滑。',
        cls: 'bad',
      });
    }
  };

  return (
    <div>
      <canvas id={`cv-${chapterId}-${moduleId}`} ref={canvasRef} width={W} height={H} />
      <div className="ctrl">
        <label>
          改动范围 <span className="val">{LABELS[stop]}</span>
        </label>
        <input type="range" min={0} max={2} step={1} value={stop} onChange={onChange} />
      </div>
      <div className="step-desc">原装 · 只微调编码器 · 编码器+解码器</div>
      <div className={`feedback ${feedback.cls}`}>{feedback.text}</div>
    </div>
  );
};

export default Ch1Mod1;
